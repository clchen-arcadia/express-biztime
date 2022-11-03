"use strict";

const { Client } = require("pg");

const DB_URI = process.env.NODE_ENV === "test"
  // ? "postgresql://ezray:secret@localhost/biztime_test"
  // : "postgresql://ezray:secret@localhost/biztime";
  ? "postgresql:///biztime_test"
  : "postgresql:///biztime";

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;
