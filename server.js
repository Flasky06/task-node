const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Table creation script
const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS persons (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        occupation VARCHAR(100),
        idNumber VARCHAR(100),
        telephone VARCHAR(100)
      )
    `);
    console.log("Table created successfully");
  } catch (err) {
    console.error("Error creating table", err);
  }
};

createTable();

// Routes
app.get("/api/persons", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM persons");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching persons", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/persons", async (req, res) => {
  const { name, occupation, idNumber, telephone } = req.body;
  try {
    await pool.query(
      "INSERT INTO persons (name, occupation, idNumber, telephone) VALUES ($1, $2, $3, $4)",
      [name, occupation, idNumber, telephone]
    );
    res.status(201).json({ message: "Person created" });
  } catch (err) {
    console.error("Error saving person", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/persons/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM persons WHERE id = $1", [id]);
    res.status(200).json({ message: "Person deleted" });
  } catch (err) {
    console.error("Error deleting person", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Test DB connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Database connection successful",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error("Error testing database connection", err);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
