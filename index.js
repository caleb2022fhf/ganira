const express = require('express');
const app = express();
app.use(express.json());

// In-Memory Database
let users = [];
let posts = [
  { id: 1, author: "Ganira Official", content: "Murakaza neza kuri Ganira! Design nshya ya Instagram Dark UI yagezeho 🔥", time: "Ubu", likes: 24 }
];
let stories = [
  { id: 1, author: "Ganira Bot", content: "🔥 Story nshya ikora neza!" }
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
        <title>Ganira - Ultra Modern Dark UI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Grand+Hotel&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Plus Jakarta Sans', sans-serif; }
          .font-instagram { font-family: 'Grand Hotel', cursive; }
          .glass-panel { background: rgba(18, 18, 18, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
          .story-ring { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); }
          .btn-gradient { background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
        </style>
    </head>
    <body class="bg-black text-white min-h-screen flex flex-col justify-between selection:bg-pink-500 selection:text-white">

        <!-- AUTH SCREEN -->
        <div id="auth-container" class="flex items-center justify-center min-h-screen px-4 bg-black">
            <div class="glass-panel p-8 rounded-3xl w-full max-w-sm shadow-2xl space-y-6">
                <div class="text-center space-y-2">
                    <h1 class="text-5xl font-instagram tracking-wider bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 bg-clip-text text-transparent">Ganira</h1>
                    <p class="text-xs text-neutral-400 font-medium tracking-wide">SHAKISHA INSHUTI • SANGIZA STORIES • AI CHAT</p>
                </div>
                
                <div id="error-msg" class="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center hidden"></div>

                <form id="auth-form" class="space-y-3">
                    <div class="space-y-1">
                        <input type="text" id="email" placeholder="Email cyangwa Username" class="w-full bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition text-xs font-medium" required>
                    </div>
                    <div class="space-y-1">
                        <input type="password" id="password" placeholder="Password" class="w-full bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition text-xs font-medium" required>
                    </div>
                    <button type="submit" id="auth-btn" class="w-full btn-gradient text-white p-3.5 rounded-xl font-bold hover:opacity-95 active:scale-95 transition text-xs tracking-wider uppercase shadow-lg shadow-pink-500/20">Log In</button>
                </form>

                <div class="text-center text-xs text-neutral-400 border-t border-neutral-800/80 pt-5">
                    <span id="switch-text">Nta konti ufite?</span> 
                    <button onclick="toggleAuthMode()" id="switch-btn" class="text-pink-400 font-bold hover:underline ml-1">Create Account</button>
                </div>
            </div>
        </div>

        <!-- MAIN INSTAGRAM-STYLE APP SCREEN -->
        <div id="main-screen" class="hidden min-h-screen flex flex-col bg-black">
            <!-- TOP NAVBAR -->
            <header class="sticky top-0 z-50 glass-panel border-b border-neutral-900 px-4 py-3 max-w-md mx-auto w-full flex justify-between items-center">
                <h1 class="text-3xl font-instagram bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 bg-clip-text text-transparent">Ganira</h1>
                <div class="flex items-center gap-3">
                    <span id="user-email-display" class="text-[11px] bg-neutral-900 border border-neutral-800 text-neutral-300 py-1 px-3 rounded-full font-semibold"></span>
                    <button onclick="logout()" class="text-xs text-neutral-400 hover:text-red-400 font-semibold transition">Sohoka</button>
                </div>
            </header>

            <!-- TABS CONTENT -->
            <main class="flex-1 max-w-md mx-auto w-full px-3 py-4 space-y-5 mb-16 custom-scrollbar">
                
                <!-- HOME TAB (STORIES + CREATE POST + FEED) -->
                <div id="tab-home" class="space-y-4">
                    <!-- Stories Bar -->
                    <div class="glass-panel p-3 rounded-2xl flex items-center gap-3 overflow-x-auto custom-scrollbar" id="stories-container">
                        <div onclick="addStoryPrompt()" class="cursor-pointer shrink-0 flex flex-col items-center gap-1.5">
                            <div class="w-14 h-14 rounded-full border-2 border-dashed border-purple-500 flex items-center justify-center bg-neutral-900 hover:scale-105 transition">
                                <span class="text-purple-400 text-xl font-bold">+</span>
                            </div>
                            <span class="text-[10px] text-neutral-400 font-medium">Add Story</span>
                        </div>
                    </div>

                    <!-- Create Post Box -->
                    <div class="glass-panel p-4 rounded-2xl space-y-3">
                        <textarea id="post-input" placeholder="Urimu gutekereza iki..." class="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none h-16 transition"></textarea>
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] text-neutral-500">Public Feed 📸</span>
                            <button onclick="createPost()" class="btn-gradient text-white px-5 py-2 rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition shadow-md">Post</button>
                        </div>
                    </div>

                    <!-- Feed Posts -->
                    <div class="space-y-4" id="feed-container"></div>
                </div>

                <!-- AI ASSISTANT TAB -->
                <div id="tab-ai" class="hidden space-y-3">
                    <div class="glass-panel p-4 rounded-2xl border border-purple-500/20 space-y-3">
                        <div class="flex justify-between items-center border-b border-neutral-800/80 pb-2.5">
                            <h3 class="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase tracking-wider">🤖 Ganira AI Assistant</h3>
                            <span class="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium">Active</span>
                        </div>
                        <div id="ai-chat-box" class="h-80 overflow-y-auto space-y-2.5 p-1 text-xs custom-scrollbar">
                            <div class="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl text-purple-200">
                                <strong>AI:</strong> Muraho! Ndi AI ya Ganira. Mbaza ikintu cyose wifuza 🚀
                            </div>
                        </div>
                        <form id="ai-form" class="flex gap-2 pt-1">
                            <input type="text" id="ai-input" placeholder="Baza AI ikintu cyose..." class="flex-1 bg-neutral-900 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-cyan-400" required>
                            <button type="submit" class="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-3 rounded-xl text-xs font-bold active:scale-95 transition">Send</button>
                        </form>
                    </div>
                </div>

                <!-- DIRECT CHAT TAB -->
                <div id="tab-chat" class="hidden space-y-3">
                    <div class="glass-panel rounded-2xl p-4 space-y-3">
                        <h3 class="text-xs font-bold text-neutral-300 uppercase tracking-wider border-b border-neutral-800/80 pb-2">Direct Messages 💬</h3>
                        <div id="messages-container" class="h-80 overflow-y-auto space-y-2.5 p-1 custom-scrollbar"></div>
                        <form id="chat-form" class="flex gap-2 pt-1">
                            <input type="text" id="chat-message" placeholder="Andika ubutumwa..." class="flex-1 bg-neutral-900 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-purple-500" required>
                            <button type="submit" class="bg-purple-600 text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-purple-700 active:scale-95 transition">Send</button>
                        </form>
                    </div>
                </div>

            </main>

            <!-- INSTAGRAM BOTTOM NAVIGATION BAR -->
            <nav class="fixed bottom-0 left-0 right-0 glass-panel border-t border-neutral-900 py-3 px-6 flex justify-around items-center z-50 max-w-md mx-auto">
                <button onclick="switchTab('home')" id="nav-home" class="text-white hover:opacity-80 transition flex flex-col items-center">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.099l-11 9.901v11h8v-7h6v7h8v-11z"/></svg>
                </button>
                <button onclick="switchTab('ai')" id="nav-ai" class="text-neutral-600 hover:text-white transition flex flex-col items-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </button>
                <button onclick="switchTab('chat')" id="nav-chat" class="text-neutral-600 hover:text-white transition flex flex-col items-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
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

                document.getElementById('nav-home').className = "text-neutral-600 hover:text-white transition flex flex-col items-center";
                document.getElementById('nav-ai').className = "text-neutral-600 hover:text-white transition flex flex-col items-center";
                document.getElementById('nav-chat').className = "text-neutral-600 hover:text-white transition flex flex-col items-center";

                document.getElementById('tab-' + tab).classList.remove('hidden');
                document.getElementById('nav-' + tab).className = "text-white transition flex flex-col items-center";
            }

            async function loadAllData() {
                fetchPosts();
                fetchStories();
                fetchMessages();
            }

            // AI CHAT LOGIC
            document.getElementById('ai-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = document.getElementById('ai-input');
                const prompt = input.value.trim();
                if (!prompt) return;

                const chatBox = document.getElementById('ai-chat-box');
                chatBox.innerHTML += \`<div class="bg-neutral-900 border border-neutral-800 p-2.5 rounded-2xl text-neutral-300"><strong>\${currentUser}:</strong> \${prompt}</div>\`;
                input.value = '';
                chatBox.scrollTop = chatBox.scrollHeight;

                const res = await fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });
                const data = await res.json();
                chatBox.innerHTML += \`<div class="glass-panel p-3 rounded-2xl text-purple-200 border border-purple-500/30"><strong>AI:</strong> \${data.reply}</div>\`;
                chatBox.scrollTop = chatBox.scrollHeight;
            });

            // POSTS FEED LOGIC
            async function fetchPosts() {
                const res = await fetch('/api/posts');
                const data = await res.json();
                document.getElementById('feed-container').innerHTML = data.map(post => \`
                    <div class="glass-panel rounded-2xl overflow-hidden p-4 space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-xs text-purple-400">@\${post.author}</span>
                            <span class="text-[10px] text-neutral-500 font-medium">\${post.time}</span>
                        </div>
                        <p class="text-xs text-neutral-200 font-normal leading-relaxed">\${post.content}</p>
                        <div class="flex items-center gap-4 text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
                            <button onclick="likePost(\${post.id})" class="hover:text-pink-500 flex items-center gap-1 font-semibold transition">❤️ <span>\${post.likes || 0}</span></button>
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

            // STORIES LOGIC
            async function fetchStories() {
                const res = await fetch('/api/stories');
                const data = await res.json();
                const container = document.getElementById('stories-container');
                const addBtnHtml = container.firstElementChild.outerHTML;
                const storiesHtml = data.map(story => \`
                    <div onclick="alert('\${story.author}: \\n\\n' + '\${story.content}')" class="cursor-pointer shrink-0 flex flex-col items-center gap-1.5">
                        <div class="w-14 h-14 rounded-full p-0.5 story-ring flex items-center justify-center hover:scale-105 transition">
                            <div class="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase border-2 border-black">\${story.author.substring(0, 2)}</div>
                        </div>
                        <span class="text-[10px] text-neutral-400 w-12 truncate text-center font-medium">\${story.author}</span>
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

            // MESSAGES LOGIC
            async function fetchMessages() {
                const res = await fetch('/api/messages');
                const data = await res.json();
                document.getElementById('messages-container').innerHTML = data.map(msg => \`
                    <div class="text-xs bg-neutral-900/90 p-3 rounded-2xl border border-neutral-800">
                        <span class="font-bold text-purple-400">\${msg.sender}:</span>
                        <span class="text-neutral-300 ml-1 font-normal">\${msg.message}</span>
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
  let reply = "Urakoze ku kibazo cyawe! Ndi AI ya Ganira. Niteguye kugufasha ku kintu cyose.";
  const text = prompt.toLowerCase();
  if (text.includes("amukuru") || text.includes("muraho")) reply = "Ni meza cyane! Urimu kugenda ute uyu munsi?";
  setTimeout(() => res.json({ reply }), 300);
});

app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email na password birakenewe" });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "Iyi email yari isanzwe ikoreshwa." });
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
  if (author && content) { posts.unshift({ id: Date.now(), author, content, time: "Ubu", likes: 0 }); res.json({ success: true }); }
});
app.post('/api/posts/like', (req, res) => {
  const { id } = req.body;
  const post = posts.find(p => p.id === id);
  if (post) { post.likes = (post.likes || 0) + 1; res.json({ success: true }); }
});

app.get('/api/stories', (req, res) => res.json(stories));
app.post('/api/stories', (req, res) => {
  const { author, content } = req.body;
  if (author && content) { stories.unshift({ id: Date.now(), author, content }); res.json({ success: true }); }
});

app.get('/api/messages', (req, res) => res.json(messages));
app.post('/api/messages', (req, res) => {
  const { sender, message } = req.body;
  if (sender && message) { messages.push({ sender, message, time: new Date().toLocaleTimeString() }); res.json({ success: true }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
