const db = require("./db");
const fs = require("fs");

module.exports = {
  automaticImport: () => {
    var json = JSON.parse(fs.readFileSync("./client/public/base.json", "utf8"));
    json.ninhos.map((nest) => {
      const query = {
        text: `INSERT INTO public.ninhos (colony, destroyed, state_nest, past_states ${
          nest.destruction_date ? ", destruction_date" : ""
        }) VALUES ($1, $2, $3, $4${nest.destruction_date ? ", $5" : ""})`,
        values: Object.values(nest),
      };
      db.insert(query);
    });
    json.vespas.map((hornet) => {
      const query = {
        text: `INSERT INTO public.vespas (state_hornet, past_states, confirmed_asian) VALUES ($1, $2, $3)`,
        values: Object.values(hornet),
      };
      db.insert(query);
    });
    json.exterminadores.map((ext) => {
      const query = {
        text: `INSERT INTO public.exterminador (name, radius, type, lat, lng, localtype) VALUES ($1, $2, $3, $4, $5, $6)`,
        values: Object.values(ext),
      };
      db.insert(query);
    });
    json.avistamentos.map((viewing) => {
      const queryViewing = {
        text: `INSERT INTO public.avistamentos (type, state, local, date, lat, lng, localType,municipality,${
          viewing.type === "Vespa" ? "specific_id" : "nest_specific_id"
        }) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        values: Object.values(viewing),
      };
      db.insert(queryViewing);
    });
  },
};
