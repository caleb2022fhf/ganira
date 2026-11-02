const express = require('express');
const app = express();
app.use(express.json());

// In-Memory Database
let users = [];
let posts = [
  { id: 1, author: "Ganira Bot", content: "Murakaza neza kuri Ganira! Ubu ufite na Instagram-style bottom navigation bar.", time: new Date().toLocaleTimeString(), likes: 4 }
];
let stories = [
  { id: 1, author: "Ganira Bot", content: "🔥 Check out the new bottom bar!", time: "Saa kumi" }
];
let messages = [
  { sender: "Ganira Bot", message: "Muraho! Mwaze neza muri Chat zone.", time: new Date().toLocaleTimeString() }
];

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="rw">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ganira - Social Network</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0b0c10] text-gray-100 min-h-screen flex flex-col font-sans pb-16">

        <!-- AUTH SCREEN -->
        <div id="auth-container" class="flex items-center justify-center h-screen px-4">
            <div class="bg-[#121317] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div class="text-center mb-6">
                    <h1 class="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500">GANIRA</h1>
                    <p class="text-gray-400 text-xs mt-2 uppercase tracking-widest">Connect • Post • AI • Chat</p>
                </div>
                
                <div id="error-msg" class="bg-red-900/40 border border-red-500 text-red-200 text-xs p-3 rounded-xl mb-4 text-center hidden"></div>

                <form id="auth-form" class="space-y-4">
                    <div>
                        <label class="block text-gray-400 text-xs font-bold uppercase mb-1">Email cyangwa Username</label>
                        <input type="text" id="email" class="w-full bg-[#1c1d22] border border-gray-700 p-3 rounded-xl text-white focus:outline-none focus:border-purple-500 transition text-sm" required>
                    </div>
                    <div>
                        <label class="block text-gray-400 text-xs font-bold uppercase mb-1">Password</label>
                        <input type="password" id="password" class="w-full bg-[#1c1d22] border border-gray-700 p-3 rounded-xl text-white focus:outline-none focus:border-purple-500 transition text-sm" required>
                    </div>
                    <button type="submit" id="auth-btn" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3.5 rounded-xl font-bold hover:opacity-95 transition shadow-lg text-sm">Log In</button>
                </form>

                <div class="text-center text-xs text-gray-400 mt-6 border-t border-gray-800/80 pt-4">
                    <span id="switch-text">Nta konti ufite?</span> 
                    <button onclick="toggleAuthMode()" id="switch-btn" class="text-purple-400 font-bold hover:underline ml-1">Create Account</button>
                </div>
            </div>
        </div>

        <!-- MAIN APP SCREEN -->
        <div id="main-screen" class="hidden min-h-screen flex flex-col bg-[#0b0c10]">
            <!-- TOP HEADER -->
            <header class="sticky top-0 z-50 bg-[#121317]/90 backdrop-blur-md border-b border-gray-800 px-6 py-3 flex justify-between items-center">
                <h1 class="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500">GANIRA</h1>
                
                <div class="flex items-center gap-3">
                    <span id="user-email-display" class="text-xs bg-[#1c1d22] border border-gray-700 text-purple-300 py-1.5 px-3 rounded-full font-medium"></span>
                    <button onclick="logout()" class="bg-[#1c1d22] hover:bg-red-600/20 hover:border-red-500 hover:text-red-400 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-xl transition font-semibold">Sohoka</button>
                </div>
            </header>

            <!-- TABS CONTENT -->
            <main class="flex-1 max-w-xl mx-auto w-full p-4 space-y-6 mb-20">
                
                <!-- HOME TAB (FEED & STORIES) -->
                <div id="tab-home" class="space-y-6">
                    <div class="bg-[#121317] border border-gray-800 p-4 rounded-2xl">
                        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Stories</h3>
                        <div class="flex items-center gap-4 overflow-x-auto pb-2" id="stories-container">
                            <div onclick="addStoryPrompt()" class="cursor-pointer shrink-0 flex flex-col items-center gap-1">
                                <div class="w-14 h-14 rounded-full border-2 border-dashed border-purple-500 flex items-center justify-center bg-[#1c1d22] hover:scale-105 transition">
                                    <span class="text-purple-400 text-xl font-bold">+</span>
                                </div>
                                <span class="text-[10px] text-gray-400">Add Story</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-[#121317] border border-gray-800 p-4 rounded-2xl space-y-3">
                        <textarea id="post-input" placeholder="Urimu gutekereza iki ariko? Tangaza Post..." class="w-full bg-[#1c1d22] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none h-20"></textarea>
                        <div class="flex justify-between items-center border-t border-gray-800/80 pt-3">
                            <span class="text-xs text-gray-500">Public Post 🌐</span>
                            <button onclick="createPost()" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:opacity-95 transition">Post</button>
                        </div>
                    </div>

                    <div class="space-y-4" id="feed-container"></div>
                </div>

                <!-- AI ASSISTANT TAB -->
                <div id="tab-ai" class="hidden space-y-4">
                    <div class="bg-[#121317] border border-purple-500/40 p-4 rounded-2xl shadow-xl space-y-3">
                        <h3 class="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase tracking-wider">🤖 AI Assistant Mode</h3>
                        <div id="ai-chat-box" class="h-96 overflow-y-auto space-y-2 p-1 text-xs">
                            <div class="bg-[#1c1d22] border border-purple-500/30 p-2.5 rounded-xl text-purple-200">
                                <strong>AI Assistant:</strong> Muraho! Ndi AI ya Ganira. Mbaza ikibazo cyose wifuza! 🚀
                            </div>
                        </div>
                        <form id="ai-form" class="flex gap-2">
                            <input type="text" id="ai-input" placeholder="Baza AI ikintu cyose..." class="flex-1 bg-[#1c1d22] border border-purple-500/40 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-cyan-400" required>
                            <button type="submit" class="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold">Baza</button>
                        </form>
                    </div>
                </div>

                <!-- CHAT/MESSENGER TAB -->
                <div id="tab-chat" class="hidden space-y-4">
                    <div class="bg-[#121317] border border-gray-800 rounded-2xl p-4 space-y-3">
                        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-2">Live Chat💬</h3>
                        <div id="messages-container" class="h-96 overflow-y-auto space-y-2 p-1"></div>
                        <form id="chat-form" class="flex gap-2">
                            <input type="text" id="chat-message" placeholder="Andika muri live chat..." class="flex-1 bg-[#1c1d22] border border-gray-700 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-purple-500" required>
                            <button type="submit" class="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold">Ohereza</button>
                        </form>
                    </div>
                </div>

            </main>

            <!-- INSTAGRAM/FACEBOOK STYLE BOTTOM NAVIGATION BAR -->
            <nav class="fixed bottom-0 left-0 right-0 bg-[#121317] border-t border-gray-800 py-3 px-6 flex justify-around items-center z-50">
                <!-- Home Icon -->
                <button onclick="switchTab('home')" id="nav-home" class="text-purple-400 hover:text-white transition flex flex-col items-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    <span class="text-[10px] mt-1">Home</span>
                </button>
                <!-- AI Assistant Icon -->
                <button onclick="switchTab('ai')" id="nav-ai" class="text-gray-400 hover:text-white transition flex flex-col items-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <span class="text-[10px] mt-1">AI Mode</span>
                </button>
                <!-- Direct / Chat Icon -->
                <button onclick="switchTab('chat')" id="nav-chat" class="text-gray-400 hover:text-white transition flex flex-col items-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    <span class="text-[10px] mt-1">Chat</span>
                </button>
            </nav>
        </div>

        <script>
            let isLoginMode = true;
            let currentUser = localStorage.getItem('ganira_user');

            if (currentUser) {
                showMainScreen(currentUser);
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
                        showMainScreen(email);
                    } else {
                        const errDiv = document.getElementById('error-msg');
                        errDiv.innerText = data.error || "Habaye ikibazo";
                        errDiv.classList.remove('hidden');
                    }
                } catch (err) {
                    console.error(err);
                }
            });

            function showMainScreen(email) {
                document.getElementById('auth-container').classList.add('hidden');
                document.getElementById('main-screen').classList.remove('hidden');
                document.getElementById('user-email-display').innerText = email;
                loadAllData();
                setInterval(loadAllData, 3000);
            }

            function logout() {
                localStorage.removeItem('ganira_user');
                location.reload();
            }

            function switchTab(tab) {
                document.getElementById('tab-home').classList.add('hidden');
                document.getElementById('tab-ai').classList.add('hidden');
                document.getElementById('tab-chat').classList.add('hidden');

                document.getElementById('nav-home').className = "text-gray-400 hover:text-white transition flex flex-col items-center";
                document.getElementById('nav-ai').className = "text-gray-400 hover:text-white transition flex flex-col items-center";
                document.getElementById('nav-chat').className = "text-gray-400 hover:text-white transition flex flex-col items-center";

                document.getElementById('tab-' + tab).classList.remove('hidden');
                document.getElementById('nav-' + tab).className = "text-purple-400 hover:text-white transition flex flex-col items-center";
            }

            async function loadAllData() {
                fetchPosts();
                fetchStories();
                fetchMessages();
            }

            // AI LOGIC
            document.getElementById('ai-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = document.getElementById('ai-input');
                const prompt = input.value.trim();
                if (!prompt) return;

                const chatBox = document.getElementById('ai-chat-box');
                chatBox.innerHTML += \`<div class="bg-gray-800 p-2 rounded-xl text-gray-200"><strong>\${currentUser}:</strong> \${prompt}</div>\`;
                input.value = '';
                chatBox.scrollTop = chatBox.scrollHeight;

                const res = await fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });
                const data = await res.json();
                chatBox.innerHTML += \`<div class="bg-[#1c1d22] border border-purple-500/30 p-2.5 rounded-xl text-purple-200"><strong>AI Assistant:</strong> \${data.reply}</div>\`;
                chatBox.scrollTop = chatBox.scrollHeight;
            });

            // POSTS
            async function fetchPosts() {
                const res = await fetch('/api/posts');
                const data = await res.json();
                document.getElementById('feed-container').innerHTML = data.map(post => \`
                    <div class="bg-[#121317] border border-gray-800 p-4 rounded-2xl space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-xs text-purple-400">@\${post.author}</span>
                            <span class="text-[10px] text-gray-500">\${post.time}</span>
                        </div>
                        <p class="text-sm text-gray-200">\${post.content}</p>
                        <div class="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-800/60">
                            <button onclick="likePost(\${post.id})" class="hover:text-pink-500 flex items-center gap-1">❤️ <span>\${post.likes || 0}</span></button>
                        </div>
                    </div>
                \`).join('');
            }

            async function createPost() {
                const input = document.getElementById('post-input');
                const content = input.value.trim();
                if (!content) return;
                await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: currentUser, content }) });
                input.value = '';
                fetchPosts();
            }

            async function likePost(id) {
                await fetch('/api/posts/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
                fetchPosts();
            }

            // STORIES
            async function fetchStories() {
                const res = await fetch('/api/stories');
                const data = await res.json();
                const container = document.getElementById('stories-container');
                const addBtnHtml = container.firstElementChild.outerHTML;
                const storiesHtml = data.map(story => \`
                    <div onclick="alert('\${story.author}: \\n\\n' + '\${story.content}')" class="cursor-pointer shrink-0 flex flex-col items-center gap-1">
                        <div class="w-14 h-14 rounded-full border-2 border-pink-500 p-0.5 flex items-center justify-center bg-gradient-to-tr from-yellow-500 to-purple-600">
                            <div class="w-full h-full bg-[#121317] rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">\${story.author.substring(0, 2)}</div>
                        </div>
                        <span class="text-[10px] text-gray-300 w-12 truncate text-center">\${story.author}</span>
                    </div>
                \`).join('');
                container.innerHTML = addBtnHtml + storiesHtml;
            }

            async function addStoryPrompt() {
                const content = prompt("Andika story yawe:");
                if (!content) return;
                await fetch('/api/stories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: currentUser, content }) });
                fetchStories();
            }

            // MESSAGES
            async function fetchMessages() {
                const res = await fetch('/api/messages');
                const data = await res.json();
                document.getElementById('messages-container').innerHTML = data.map(msg => \`
                    <div class="text-xs bg-[#1c1d22] p-2 rounded-xl border border-gray-800">
                        <span class="font-bold text-purple-400">\${msg.sender}:</span>
                        <span class="text-gray-300 ml-1">\${msg.message}</span>
                    </div>
                \`).join('');
            }

            document.getElementById('chat-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = document.getElementById('chat-message');
                const message = input.value.trim();
                if (!message) return;
                await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sender: currentUser, message }) });
                input.value = '';
                fetchMessages();
            });
        </script>
    </body>
    </html>
  `);
});

// APIs
app.post('/api/ai', (req, res) => {
  const { prompt } = req.body;
  let reply = "Urakoze ku kibazo cyawe! Ndi AI ya Ganira.";
  const text = prompt.toLowerCase();
  if (text.includes("amukuru") || text.includes("muraho")) reply = "Ni meza cyane! Urimu kugenda ute uyu munsi?";
  setTimeout(() => res.json({ reply }), 300);
});

app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email na password birakenewe" });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "Email yari isanzwe ikoreshwa." });
  users.push({ email, password });
  res.status(201).json({ success: true });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) res.json({ success: true });
  else res.status(401).json({ error: "Email cyangwa password si byo." });
});

app.get('/api/posts', (req, res) => res.json(posts));
app.post('/api/posts', (req, res) => {
  const { author, content } = req.body;
  if (author && content) { posts.unshift({ id: Date.now(), author, content, time: new Date().toLocaleTimeString(), likes: 0 }); res.json({ success: true }); }
});
app.post('/api/posts/like', (req, res) => {
  const { id } = req.body;
  const post = posts.find(p => p.id === id);
  if (post) { post.likes = (post.likes || 0) + 1; res.json({ success: true }); }
});

app.get('/api/stories', (req, res) => res.json(stories));
app.post('/api/stories', (req, res) => {
  const { author, content } = req.body;
  if (author && content) { stories.unshift({ id: Date.now(), author, content, time: new Date().toLocaleTimeString() }); res.json({ success: true }); }
});

app.get('/api/messages', (req, res) => res.json(messages));
app.post('/api/messages', (req, res) => {
  const { sender, message } = req.body;
  if (sender && message) { messages.push({ sender, message, time: new Date().toLocaleTimeString() }); res.json({ success: true }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
