const express = require("express");
const cors = require("cors");
const db = require("./db");
const dbimports = require("./automatic-import");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");

var app = express();

var geojson = JSON.parse(fs.readFileSync("./public/concelhos.geojson", "utf8"));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM avistamentos;");
  res.send(result.rows);
});

app.get("/vespas", async (req, res) => {
  const result = await db.query("SELECT * FROM vespas;");
  res.send(result.rows);
});

app.get("/ninhos", async (req, res) => {
  const result = await db.query("SELECT * FROM ninhos;");
  res.send(result.rows);
});

app.get("/years", async (req, res) => {
  const result = await db.query(
    "select distinct extract(year from date) from avistamentos;"
  );
  res.send(result.rows);
});

app.get("/:id", async (req, res) => {
  if (req.params.id === "concelhos") {
    res.send(geojson);
  } else if (req.params.id === "exterminadores") {
    const result = await db.query("SELECT * FROM exterminador");
    res.send(result.rows);
  } else if (req.params.id === "municipalities_risk") {
    const result = await db.query(
      "SELECT municipality, mode() WITHIN GROUP (ORDER BY state) AS mode FROM avistamentos group by municipality"
    );
    res.send(result.rows);
  } else {
    const result = await db.query(
      `SELECT * FROM avistamentos WHERE id=${req.params.id};`
    );
    res.send(result.rows[0]);
  }
});

app.get("/infodetails/:type/:id", async (req, res) => {
  const { type } = req.params;
  const detailQuery = `Select * FROM avistamentos LEFT JOIN ${req.params.type.toLowerCase()} ON avistamentos.${
    type === "vespas" ? "specific_id" : "nest_specific_id"
  }=${type.toLowerCase()}.${
    type === "vespas" ? "vespaid" : "nestid"
  } WHERE avistamentos.id=($1)`;
  const result = await db.query({ text: detailQuery, values: [req.params.id] });
  res.send(result.rows[0]);
});

function insertViewing(file, values, id, type) {
  if (file) values.push(file.originalname);
  values.push(id);
  const queryViewing = {
    text: `INSERT INTO public.avistamentos (type, state, local, date, lat, lng, localType,municipality,${
      file ? "photo," : ""
    } ${
      type === "Vespa" ? "specific_id" : "nest_specific_id"
    }) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9${file ? ",$10)" : ")"}`,
    values,
  };
  db.insert(queryViewing);
}

app.post("/add", upload.single("photo"), (req, res) => {
  const json = JSON.parse(req.body.data);
  const values = Object.values(json);
  let table;
  let columns;
  let valuesQuery;
  let query;
  if (json.type === "Vespa") {
    table = "vespas";
    columns = "(state_hornet, past_states, confirmed_asian)";
    valuesQuery = "($1, $2, $3)";
    query = {
      text: `INSERT INTO public.${table} ${columns} VALUES ${valuesQuery} RETURNING vespaid`,
      values: ["Não verificada", [], false],
    };
  } else {
    table = "ninhos";
    columns = "(colony, destroyed, state_nest, past_states)";
    valuesQuery = "($1, $2, $3, $4)";
    query = {
      text: `INSERT INTO public.${table} ${columns} VALUES ${valuesQuery} RETURNING nestid`,
      values: [false, false, "Não verificado", []],
    };
  }

  db.insertWithReturn(
    query,
    function (err, res) {
      insertViewing(req.file, values, res, json.type);
    },
    json.type
  );
  res.send(query);
});

app.post("/update/:type/:id", (req, res) => {
  let table;
  let setColumns;

  setColumns = Object.keys(req.body.avistamento).map(
    (key, i) => `${key} = $${i + 1}`
  );
  table = "avistamentos";

  const queryUpdate = {
    text: `UPDATE public.${table} SET ${setColumns} WHERE id=${req.params.id}`,
    values: Object.values(req.body.avistamento),
  };
  if (queryUpdate.values.length > 0) db.query(queryUpdate);

  let specId;
  let values;
  let specIdString;
  if (req.params.type === "vespa") {
    specId = req.body.vespas.vespaid;
    specIdString = "vespaid";
    delete req.body.vespas.vespaid;
    table = "vespas";
    setColumns = Object.keys(req.body.vespas).map(
      (key, i) => `${key} = $${i + 1}`
    );
    values = Object.values(req.body.vespas);
  } else {
    specId = req.body.nest.nestid;
    specIdString = "nestid";
    delete req.body.nest.nestid;
    table = "ninhos";
    setColumns = Object.keys(req.body.nest).map(
      (key, i) => `${key} = $${i + 1}`
    );
    values = Object.values(req.body.nest);
  }
  const querySpecificUpdate = {
    text: `UPDATE public.${req.params.type}s SET ${setColumns} WHERE ${specIdString}=${specId}`,
    values: Object.values(values),
  };

  db.query(querySpecificUpdate);
});

app.post("/update_state/:type/:id", (req, res) => {
  const current_state =
    req.params.type === "vespas" ? "state_hornet" : "state_nest";
  const current_id = req.params.type === "vespas" ? "vespaid" : "nestid";
  const queryUpdate = {
    text: `UPDATE public.${req.params.type} SET past_states = array_append(past_states, ($1)), ${current_state} = ($2) WHERE ${current_id}=${req.params.id}`,
    values: [Object.values(req.body)[0], Object.values(req.body)[1]],
  };
  db.query(queryUpdate);

  const viewingQuery = {
    text: `UPDATE public.avistamentos SET state = ($2) WHERE id=($1)`,
    values: [Object.values(req.body)[2], Object.values(req.body)[3]],
  };
  db.query(viewingQuery);
  res.send({});
});

app.put("/update_photo/:id", upload.single("photo"), (req, res) => {
  const viewingQuery = {
    text: `UPDATE public.avistamentos SET photo = ($1) WHERE id=($2)`,
    values: [req.file.originalname, req.params.id],
  };
  db.query(viewingQuery);
  res.send({});
});

app.post("/filter", async (req, res) => {
  let params = "";

  let dataQuery = "";

  Object.keys(req.body.data).map((val, i) => {
    if (i < Object.keys(req.body.data).length - 1) {
      params = params.concat(
        `AND ${val} = ANY($${req.body.data.years.length * 2 + i + 1}::text[])`
      );
    }
  });

  req.body.data.years.map((date, j) => {
    if (j < req.body.data.years.length - 1) {
      dataQuery = dataQuery.concat(
        `date >= ($${2 * j + 1})::date AND date <= ($${2 * (j + 1)})::date OR `
      );
    } else {
      dataQuery = dataQuery.concat(
        `date >= ($${2 * j + 1})::date AND date <= ($${2 * (j + 1)})::date`
      );
    }
  });

  let valuesArray = [];

  req.body.data.years.map((key) => {
    valuesArray.push(key + "-01-01");
    valuesArray.push(key + "-12-31");
  });

  valuesArray = valuesArray.concat(
    Object.keys(req.body.data)
      .map((key) => {
        if (key !== "years") return Object.values(req.body.data[key]);
      })
      .filter((el) => el !== undefined)
  );
  var query = {
    text: `SELECT * FROM avistamentos WHERE avistamentos.id IN (SELECT id FROM avistamentos WHERE ${dataQuery}) ${params}`,
    values: valuesArray,
  };

  const result = await db.query(query);

  res.send(result.rows);
});

app.listen("8080", async () => {
  const result = await db.query("SELECT * FROM avistamentos");
  if (result.rows.length === 0) {
    dbimports.automaticImport();
  }
});
