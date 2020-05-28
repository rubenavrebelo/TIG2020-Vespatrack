const { Pool } = require("pg");
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "TIG2020",
  password: "3ds4life",
  port: 5432,
});

// client.connect();

module.exports = {
  query: (text, params) => pool.query(text, params),
  insert: (query) => pool.query(query),
  insertWithReturn: (query, callback, type) =>
    pool.query(query, function (err, result) {
      if (err) {
        callback(err);
      } else {
        if (type === "Vespa") callback(null, result.rows[0].vespaid);
        else callback(null, result.rows[0].nestid);
      }
    }),
};
