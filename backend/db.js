const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: "postgres",
      host: "localhost",
      database: "car_rental",
      password: "1234",
      port: 5432,
    });

module.exports = pool;
