const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "TIG2020",
  password: "3ds4life",
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  insert: (query) => pool.query(query),
  insertWithReturn: (query, callback) =>
    pool.query(query, function (err, result) {
      if (err) {
        callback(err);
      } else {
        callback(null, result.rows[0].vespaid);
      }
    }),
};
