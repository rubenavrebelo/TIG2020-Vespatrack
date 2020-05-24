const { Client } = require("pg");
const express = require("express");
const cors = require("cors");
const db = require("./db");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
var postgresArray = require("postgres-array");

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

app.get("/concelhos", async (req, res) => {
  res.send(geojson);
});

app.get("/infodetails/:id", async (req, res) => {
  const detailQuery =
    "Select * FROM avistamentos LEFT JOIN vespas ON avistamentos.specific_id=vespas.vespaid WHERE avistamentos.id=($1)";
  const result = await db.query({ text: detailQuery, values: [req.params.id] });
  result.rows[0].past_states = postgresArray.parse(result.rows[0].past_states);
  res.send(result.rows[0]);
});

function insertViewing(file, values, id) {
  if (file) values.push(file.originalname);
  values.push(id);
  const queryViewing = {
    text: `INSERT INTO public.avistamentos (type, state, local, date, lat, lng, localType, specific_id${
      file ? ",photo)" : ")"
    } VALUES ($1, $2, $3, $4, $5, $6, $7, $8${file ? ",$9)" : ")"}`,
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
  if (json.type === "Vespa") {
    table = "vespas";
    columns = "(state_hornet, past_states, confirmed_asian)";
    valuesQuery = "($1, $2, $3)";
  }

  const queryHornet = {
    text: `INSERT INTO public.${table} ${columns} VALUES ${valuesQuery} RETURNING vespaid`,
    values: ["Não verificada", [], false],
  };

  db.insertWithReturn(queryHornet, function (err, res) {
    insertViewing(req.file, values, res);
  });
});

app.post("/update/:type/:id", (req, res) => {
  let table;
  let setColumns;

  if (req.params.type === "vespa") {
    setColumns = Object.keys(req.body.avistamento).map(
      (key, i) => `${key} = $${i + 1}`
    );
    table = "avistamentos";
  }

  const queryUpdate = {
    text: `UPDATE public.${table} SET ${setColumns} WHERE id=${req.params.id}`,
    values: Object.values(req.body.avistamento),
  };

  if (queryUpdate.values.length > 0) db.query(queryUpdate);
});

app.listen("8080", () => console.log("hi!"));
