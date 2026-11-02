const express = require('express');
const app = express();
app.use(express.json());

// Ububiko bw'agateganyo muri memory ya server
let users = [];
let messages = [
  { sender: "Ganira Bot", message: "Muraho neza! Ikiganiro cyatangiye muri stail ya Instagram & Facebook.", time: new Date().toLocaleTimeString() }
];

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="rw">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ganira - Social Dark UI</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0f0f0f] text-gray-100 h-screen flex flex-col justify-between font-sans">

        <!-- AUTH SCREEN (LOGIN & REGISTER - DARK STYLE) -->
        <div id="auth-container" class="flex items-center justify-center h-screen px-4">
            <div class="bg-[#18191a] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div class="text-center mb-6">
                    <h1 class="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500">GANIRA</h1>
                    <p class="text-gray-400 text-sm mt-1">Huha n'abandi mu buryo bugezweho</p>
                </div>
                
                <div id="error-msg" class="bg-red-900/50 border border-red-500 text-red-200 text-sm p-2 rounded-lg mb-4 text-center hidden"></div>

                <form id="auth-form" class="space-y-4">
                    <div>
                        <label class="block text-gray-300 text-xs font-bold uppercase mb-1">Email cyangwa Izina</label>
                        <input type="email" id="email" class="w-full bg-[#242526] border border-gray-700 p-3 rounded-xl text-white focus:outline-none focus:border-purple-500 transition" required>
                    </div>
                    <div>
                        <label class="block text-gray-300 text-xs font-bold uppercase mb-1">Password</label>
                        <input type="password" id="password" class="w-full bg-[#242526] border border-gray-700 p-3 rounded-xl text-white focus:outline-none focus:border-purple-500 transition" required>
                    </div>
                    <button type="submit" id="auth-btn" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl font-bold hover:opacity-95 transition shadow-lg shadow-purple-900/40">Log In</button>
                </form>

                <div class="text-center text-sm text-gray-400 mt-6 border-t border-gray-800 pt-4">
                    <span id="switch-text">Nta konti ufite?</span> 
                    <button onclick="toggleAuthMode()" id="switch-btn" class="text-purple-400 font-bold hover:underline ml-1">Create Account</button>
                </div>
            </div>
        </div>

        <!-- CHAT & SOCIAL FEED SCREEN -->
        <div id="chat-screen" class="hidden h-screen flex flex-col justify-between bg-[#0f0f0f]">
            <!-- Header (Facebook/Instagram Style Navbar) -->
            <header class="bg-[#18191a] border-b border-gray-800 px-6 py-3 flex justify-between items-center shadow-md">
                <h1 class="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500">GANIRA</h1>
                <div class="flex items-center gap-4">
                    <span id="user-email-display" class="text-xs bg-[#242526] border border-gray-700 text-purple-300 py-1.5 px-3 rounded-full font-medium"></span>
                    <button onclick="logout()" class="bg-[#242526] hover:bg-red-600/20 hover:border-red-500 hover:text-red-400 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-xl transition font-semibold">Sohoka</button>
                </div>
            </header>

            <!-- Main Feed / Messages Container -->
            <div id="messages-container" class="flex-1 p-4 overflow-y-auto space-y-4 max-w-xl mx-auto w-full">
                <!-- Ubutumwa buzajya buza hano -->
            </div>

            <!-- Input Box (Instagram/Facebook Messenger Style Footer) -->
            <div class="bg-[#18191a] border-t border-gray-800 p-4 shadow-xl">
                <form id="chat-form" class="max-w-xl mx-auto flex gap-3 items-center">
                    <input type="text" id="message" placeholder="Andika ubutumwa cyangwa post yawe..." class="w-full bg-[#242526] border border-gray-700 text-white p-3 rounded-full px-4 focus:outline-none focus:border-purple-500 transition text-sm" required>
                    <button type="submit" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:opacity-95 transition shadow-lg text-sm shrink-0">Ohereza</button>
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
                        <div class="bg-[#18191a] border border-gray-800 p-4 rounded-2xl shadow-md space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-sm text-purple-400 flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                    \${msg.sender}
                                </span>
                                <span class="text-[10px] text-gray-500">\${msg.time}</span>
                            </div>
                            <p class="text-gray-200 text-sm pl-4 border-l-2 border-purple-500/50">\${msg.message}</p>
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
