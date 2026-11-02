const express = require('express');
const app = express();
app.use(express.json());

// Ububiko bw'agateganyo muri memory ya server (abakoresha n'ubutumwa)
let users = [];
let messages = [
  { sender: "Ganira Bot", message: "Muraho neza! Ikiganiro cyatangiye.", time: new Date().toLocaleTimeString() }
];

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="rw">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ganira - Login & Chat</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 h-screen flex flex-col justify-between">

        <!-- AUTH SCREEN (LOGIN & REGISTER) -->
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

        <!-- CHAT SCREEN (Hakingwa kugeza ubwo winjiye) -->
        <div id="chat-screen" class="hidden h-screen flex flex-col justify-between">
            <header class="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
                <h1 class="font-bold text-xl">Ganira Chat App 💬</h1>
                <div>
                    <span id="user-email-display" class="text-sm mr-4 bg-indigo-700 py-1 px-3 rounded-full"></span>
                    <button onclick="logout()" class="bg-red-500 text-sm px-3 py-1 rounded hover:bg-red-600 transition">Sohoka</button>
                </div>
            </header>

            <div id="messages-container" class="flex-1 p-4 overflow-y-auto space-y-3 max-w-2xl mx-auto w-full">
                <!-- Ubutumwa buzajya buza hano -->
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
                setInterval(fetchMessages, 2000);
            }

            function logout() {
                localStorage.removeItem('ganira_user');
                location.reload();
            }

            async function fetchMessages() {
                try {
                    const response = await fetch('/api/messages');
                    const data = await response.json();
                    const container = document.getElementById('messages-container');
                    
                    container.innerHTML = data.map(msg => \`
                        <div class="bg-white p-3 rounded-lg shadow-sm border">
                            <span class="font-bold text-indigo-600">\${msg.sender}</span>: 
                            <span class="text-gray-800">\${msg.message}</span>
                            <span class="text-xs text-gray-400 block mt-1">\${msg.time}</span>
                        </div>
                    \`).join('');
                    
                    container.scrollTop = container.scrollHeight;
                } catch (err) {
                    console.error(err);
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

// API: SIGNUP
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email na password birakenewe" });

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "Iyi email yari isanzwe ikoreshwa." });
  }

  users.push({ email, password });
  res.status(201).json({ success: true });
});

// API: LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Email cyangwa password si byo." });
  }
});

// API: GET MESSAGES
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// API: POST MESSAGE
app.post('/api/messages', (req, res) => {
  const { sender, message } = req.body;
  if (sender && message) {
    messages.push({
      sender,
      message,
      time: new Date().toLocaleTimeString()
    });
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Sender and message required" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
