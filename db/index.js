const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

module.exports = {
  query: (text, params) => client.query(text, params),
  insert: (query) => client.query(query),
  insertWithReturn: (query, callback, type) =>
    client.query(query, function (err, result) {
      if (err) {
        callback(err);
      } else {
        if (type === "Vespa") callback(null, result.rows[0].vespaid);
        else callback(null, result.rows[0].nestid);
      }
    }),
};
