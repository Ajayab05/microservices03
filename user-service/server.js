const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432
});

app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY id"
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.post("/users", async (req, res) => {

  try {

    const { name, email } = req.body;

    const result = await pool.query(
      "INSERT INTO users(name,email) VALUES($1,$2) RETURNING *",
      [name, email]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    if (err.code === "23505") {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    res.status(500).json({
      error: err.message
    });
  }
});

app.put("/users/:id", async (req, res) => {

  try {

    const { name, email } = req.body;

    const result = await pool.query(
      "UPDATE users SET name=$1,email=$2 WHERE id=$3 RETURNING *",
      [name, email, req.params.id]
    );

    res.json(result.rows[0]);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});

app.delete("/users/:id", async (req, res) => {

  try {

    await pool.query(
      "DELETE FROM users WHERE id=$1",
      [req.params.id]
    );

    res.json({
      message: "deleted"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(3000, () => {
  console.log("User Service Running");
});