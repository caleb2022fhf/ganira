const express = require('express');
const { createClient } = require('@libsql/client');
const path = require('path');

const app = express();
app.use(express.json());

// Guhuza na Turso Database ukoresheje environment variables ziri kuri Vercel
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Gukora table ya database mu gihe itarabaho
async function initDB() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ganira_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
initDB();

// 1. FRONTEND UI (Urupapuro rugaragara iyo usuye link yawe)
app.get('/', async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="rw">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ganira - Chat App</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 h-screen flex flex-col">
        <!-- Umutwe w'urubuga -->
        <header class="bg-indigo-600 text-white p-4 text-center font-bold text-xl shadow-md">
            Ganira Chat App 💬
        </header>

        <!-- Aho ubutumwa bugaragara -->
        <div id="messages-container" class="flex-1 p-4 overflow-y-auto space-y-3 max-w-2xl mx-auto w-full">
            <p class="text-gray-500 text-center">Gukurura ubutumwa...</p>
        </div>

        <!-- Akazu ko kwandikamo no kohereza -->
        <div class="bg-white border-t p-4 shadow-lg">
            <form id="chat-form" class="max-w-2xl mx-auto flex gap-2">
                <input type="text" id="sender" placeholder="Izina ryawe..." class="border p-2 rounded-lg w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                <input type="text" id="message" placeholder="Andika ubutumwa bwawe..." class="border p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                <button type="submit" class="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Ohereza</button>
            </form>
        </div>

        <script>
            async function fetchMessages() {
                try {
                    const response = await fetch('/api/messages');
                    const messages = await response.json();
                    const container = document.getElementById('messages-container');
                    
                    if (messages.length === 0) {
                        container.innerHTML = '<p class="text-gray-500 text-center">Nta butumwa burabaho. Ba uwambere wo kohereza!</p>';
                        return;
                    }

                    container.innerHTML = messages.map(msg => \`
                        <div class="bg-white p-3 rounded-lg shadow-sm border">
                            <span class="font-bold text-indigo-600">\${msg.sender}</span>: 
                            <span class="text-gray-800">\${msg.message}</span>
                            <span class="text-xs text-gray-400 block mt-1">\${new Date(msg.created_at).toLocaleTimeString()}</span>
                        </div>
                    \`).join('');
                    
                    container.scrollTop = container.scrollHeight;
                } catch (error) {
                    console.error('Ikosa:', error);
                }
            }

            document.getElementById('chat-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const sender = document.getElementById('sender').value;
                const message = document.getElementById('message').value;

                await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sender, message })
                });

                document.getElementById('message').value = '';
                fetchMessages();
            });

            fetchMessages();
            setInterval(fetchMessages, 3000); // igeza amakuru mashya buri masegonda 3
        </script>
    </body>
    </html>
  `);
});

// 2. API: Gusoma ubutumwa bwose buri muri Database (GET)
app.get('/api/messages', async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM ganira_messages ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. API: Kohereza ubutumwa bushya muri Database (POST)
app.post('/api/messages', async (req, res) => {
  const { sender, message } = req.body;
  if (!sender || !message) {
    return res.status(400).json({ error: "Sender and message are required" });
  }

  try {
    await db.execute({
      sql: "INSERT INTO ganira_messages (sender, message) VALUES (?, ?)",
      args: [sender, message]
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Guhagarika server ku mibare isanzwe cyangwa kuri Vercel serverless
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port \${PORT}`);
});

module.exports = app;
