const express = require('express');
const { createClient } = require('@libsql/client');

const app = express();
app.use(express.json());

// Guhuza na Turso Database
function getDb() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_DATABASE_URL cyangwa TURSO_AUTH_TOKEN zibuze muri Environment Variables za Vercel!");
  }
  return createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

// 1. FRONTEND UI (Login, Register & Chat)
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
    <body class="bg-gray-100 h-screen flex flex-col justify-between">

        <!-- AUTH SCREEN -->
        <div id="auth-container" class="flex items-center justify-center h-screen">
            <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 id="auth-title" class="text-2xl font-bold text-center text-indigo-600 mb-6">Injira muri Ganira</h2>
                
                <div id="error-msg" class="text-red-500 text-sm mb-4 text-center hidden"></div>

                <form id="auth-form" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input type="email" id="email" class="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input type="password" id="password" class="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                    </div>
                    <button type="submit" id="auth-btn" class="w-full bg-indigo-600 text-white p-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Log In</button>
                </form>

                <p class="text-center text-sm text-gray-600 mt-4">
                    <span id="switch-text">Nta konti ufite?</span> 
                    <button onclick="toggleAuthMode()" id="switch-btn" class="text-indigo-600 font-bold hover:underline ml-1">Create Account</button>
                </p>
            </div>
        </div>

        <!-- CHAT SCREEN -->
        <div id="chat-screen" class="hidden h-screen flex flex-col">
            <header class="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
                <h1 class="font-bold text-xl">Ganira Chat App 💬</h1>
                <div>
                    <span id="user-email-display" class="text-sm mr-4 bg-indigo-700 py-1 px-3 rounded-full"></span>
                    <button onclick="logout()" class="bg-red-500 text-sm px-3 py-1 rounded hover:bg-red-600 transition">Sohoka</button>
                </div>
            </header>

            <div id="messages-container" class="flex-1 p-4 overflow-y-auto space-y-3 max-w-2xl mx-auto w-full">
                <p class="text-gray-500 text-center">Gukurura ubutumwa...</p>
            </div>

            <div class="bg-white border-t p-4 shadow-lg">
                <form id="chat-form" class="max-w-2xl mx-auto flex gap-2">
                    <input type="text" id="message" placeholder="Andika ubutumwa bwawe..." class="border p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                    <button type="submit" class="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Ohereza</button>
                </form>
            </div>
        </div>

        <script>
            let isLoginMode = true;
            let currentUser = localStorage.getItem('ganira_user');

            if (currentUser) {
                showChatScreen(currentUser);
            }

            function toggleAuthMode() {
                isLoginMode = !isLoginMode;
                document.getElementById('auth-title').innerText = isLoginMode ? "Injira muri Ganira" : "Wiyandikishe kuri Ganira";
                document.getElementById('auth-btn').innerText = isLoginMode ? "Log In" : "Create Account";
                document.getElementById('switch-text').innerText = isLoginMode ? "Nta konti ufite?" : "Ubusanzwe ufite konti?";
                document.getElementById('switch-btn').innerText = isLoginMode ? "Create Account" : "Log In";
                document.getElementById('error-msg').classList.add('hidden');
            }

            document.getElementById('auth-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const endpoint = isLoginMode ? '/api/login' : '/api/signup';

                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json();

                    if (res.ok) {
                        localStorage.setItem('ganira_user', email);
                        showChatScreen(email);
                    } else {
                        const errDiv = document.getElementById('error-msg');
                        errDiv.innerText = data.error || "Habaye ikibazo";
                        errDiv.classList.remove('hidden');
                    }
                } catch (err) {
                    console.error(err);
                }
            });

            function showChatScreen(email) {
                document.getElementById('auth-container').classList.add('hidden');
                document.getElementById('chat-screen').classList.remove('hidden');
                document.getElementById('user-email-display').innerText = email;
                fetchMessages();
                setInterval(fetchMessages, 3000);
            }

            function logout() {
                localStorage.removeItem('ganira_user');
                location.reload();
            }

            async function fetchMessages() {
                try {
                    const response = await fetch('/api/messages');
                    const messages = await response.json();
                    const container = document.getElementById('messages-container');
                    
                    if (!Array.isArray(messages)) return;
                    
                    if (messages.length === 0) {
                        container.innerHTML = '<p class="text-gray-500 text-center">Nta butumwa burabaho. Ba uwambere wo kohereza!</p>';
                        return;
                    }

                    container.innerHTML = messages.map(msg => \`
                        <div class="bg-white p-3 rounded-lg shadow-sm border">
                            <span class="font-bold text-indigo-600">\${msg.email || msg.sender}</span>: 
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
                const message = document.getElementById('message').value;
                const sender = localStorage.getItem('ganira_user');

                await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sender, message })
                });

                document.getElementById('message').value = '';
                fetchMessages();
            });
        </script>
    </body>
    </html>
  `);
});

// 2. API: SIGNUP (Kurema Konti)
app.post('/api/signup', async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email na password birakenewe" });

    await db.execute(`
      CREATE TABLE IF NOT EXISTS ganira_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute({
      sql: "INSERT INTO ganira_users (email, password) VALUES (?, ?)",
      args: [email, password]
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Iyi email yari isanzwe ikoreshwa cyangwa habaye ikibazo: " + error.message });
  }
});

// 3. API: LOGIN (Kwinjira)
app.post('/api/login', async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;
    
    const result = await db.execute({
      sql: "SELECT * FROM ganira_users WHERE email = ? AND password = ?",
      args: [email, password]
    });

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Email cyangwa password si byo." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. API: GET MESSAGES
app.get('/api/messages', async (req, res) => {
  try {
    const db = getDb();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ganira_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const result = await db.execute("SELECT * FROM ganira_messages ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. API: POST MESSAGE
app.post('/api/messages', async (req, res) => {
  try {
    const db = getDb();
    const { sender, message } = req.body;
    if (!sender || !message) return res.status(400).json({ error: "Sender and message are required" });

    await db.execute({
      sql: "INSERT INTO ganira_messages (sender, message) VALUES (?, ?)",
      args: [sender, message]
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
