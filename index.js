import { createClient } from "@libsql/client";
import express from "express";

const app = express();
app.use(express.json());

// Guhuza na Turso database (billtolk-db)
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Gukora table y'ubumessage mu mushinga wa Ganira
async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ganira_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Ganira database initialization completed.");
  } catch (err) {
    console.error("Database Init Error:", err);
  }
}
initDb();

// Endpoint yo kureba ubutumwa bwose (GET)
app.get("/api/messages", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM ganira_messages ORDER BY created_at DESC");
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint yo koherereza ubutumwa mushya (POST)
app.post("/api/messages", async (req, res) => {
  try {
    const { sender, message } = req.body;
    if (!sender || !message) {
      return res.status(400).json({ success: false, error: "Sender na message ni ngombwa!" });
    }

    await db.execute({
      sql: "INSERT INTO ganira_messages (sender, message) VALUES (?, ?)",
      args: [sender, message],
    });

    res.json({ success: true, message: "Ubutumwa bwagiye neza muri Ganira!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Home route
app.get("/", (req, res) => {
  res.send("<h1>Ganira API is running successfully with Turso!</h1>");
});

export default app;
