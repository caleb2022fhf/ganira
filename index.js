const express = require('express');
const app = express();
app.use(express.json());

// In-Memory Database
let users = [];
let posts = [
  { id: 1, author: "Ganira Official", content: "Murakaza neza kuri Ganira! Ubu isa na Instagram muri Dark Mode nziza cyane.", time: "Ubu", likes: 12 }
];
let stories = [
  { id: 1, author: "Ganira Bot", content: "🔥 Welcome to Ganira Stories!" }
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
        <title>Ganira - Instagram Dark Style</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-black text-white min-h-screen flex flex-col font-sans pb-16">

        <!-- AUTH SCREEN -->
        <div id="auth-container" class="flex items-center justify-center h-screen px-4 bg-black">
            <div class="bg-[#121212] border border-neutral-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-black tracking-wider italic font-serif">Ganira</h1>
                    <p class="text-neutral-500 text-xs mt-2 uppercase tracking-widest">Instagram & Facebook Dark UI</p>
                </div>
                
                <div id="error-msg" class="bg-red-950/50 border border-red-800 text-red-300 text-xs p-3 rounded-xl mb-4 text-center hidden"></div>

                <form id="auth-form" class="space-y-3">
                    <div>
                        <input type="text" id="email" placeholder="Phone number, username, or email" class="w-full bg-[#121212] border border-neutral-800 p-3 rounded-md text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 text-xs" required>
                    </div>
                    <div>
                        <input type="password" id="password" placeholder="Password" class="w-full bg-[#121212] border border-neutral-800 p-3 rounded-md text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 text-xs" required>
                    </div>
                    <button type="submit" id="auth-btn" class="w-full bg-[#0095f6] text-white p-3 rounded-lg font-semibold hover:opacity-90 transition text-sm">Log In</button>
                </form>

                <div class="text-center text-xs text-neutral-400 mt-6 border-t border-neutral-800 pt-4">
                    <span id="switch-text">Don't have an account?</span> 
                    <button onclick="toggleAuthMode()" id="switch-btn" class="text-[#0095f6] font-bold hover:underline ml-1">Sign up</button>
                </div>
            </div>
        </div>

        <!-- MAIN INSTAGRAM-STYLE FEED SCREEN -->
        <div id="main-screen" class="hidden min-h-screen flex flex-col bg-black">
            <!-- TOP NAVBAR (Instagram Header) -->
            <header class="sticky top-0 z-50 bg-black border-b border-neutral-800 px-4 py-3 flex justify-between items-center max-w-lg mx-auto w-full">
                <h1 class="text-2xl font-black italic font-serif tracking-wide">Ganira</h1>
                <div class="flex items-center gap-3">
                    <span id="user-email-display" class="text-[11px] bg-neutral-900 border border-neutral-800 text-neutral-300 py-1 px-3 rounded-full"></span>
                    <button onclick="logout()" class="text-red-500 text-xs font-semibold hover:opacity-80">Sohoka</button>
                </div>
            </header>

            <!-- TABS CONTAINER -->
            <main class="flex-1 max-w-lg mx-auto w-full p-2 space-y-4 mb-16">
                
                <!-- HOME TAB (INSTAGRAM STORIES + POSTS FEED) -->
                <div id="tab-home" class="space-y-4">
                    <!-- Stories Bar -->
                    <div class="bg-black border border-neutral-800 p-3 rounded-xl overflow-x-auto flex items-center gap-4" id="stories-container">
                        <div onclick="addStoryPrompt()" class="cursor-pointer shrink-0 flex flex-col items-center gap-1">
                            <div class="w-14 h-14 rounded-full border-2 border-neutral-700 flex items-center justify-center bg-neutral-900 hover:scale-105 transition">
                                <span class="text-white text-lg font-bold">+</span>
                            </div>
                            <span class="text-[10px] text-neutral-400">Your story</span>
                        </div>
                    </div>

                    <!-- Create Post Box -->
                    <div class="bg-[#121212] border border-neutral-800 p-3 rounded-xl space-y-2">
                        <textarea id="post-input" placeholder="What's on your mind? Create a post..." class="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 resize-none h-16"></textarea>
                        <div class="flex justify-between items-center pt-1">
                            <span class="text-[10px] text-neutral-500">Public Feed 📸</span>
                            <button onclick="createPost()" class="bg-[#0095f6] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition">Post</button>
                        </div>
                    </div>

                    <!-- Feed Posts (Instagram Style Cards) -->
                    <div class="space-y-4" id="feed-container"></div>
                </div>

                <!-- AI ASSISTANT TAB -->
                <div id="tab-ai" class="hidden space-y-3">
                    <div class="bg-[#121212] border border-neutral-800 p-4 rounded-xl space-y-3">
                        <h3 class="text-xs font-bold text-neutral-300 uppercase tracking-wider">🤖 Ganira AI Assistant</h3>
                        <div id="ai-chat-box" class="h-80 overflow-y-auto space-y-2 p-1 text-xs">
                            <div class="bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl text-neutral-200">
                                <strong>AI:</strong> Hello! Ask me anything you want. 🚀
                            </div>
                        </div>
                        <form id="ai-form" class="flex gap-2">
                            <input type="text" id="ai-input" placeholder="Ask AI..." class="flex-1 bg-black border border-neutral-800 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-neutral-500" required>
                            <button type="submit" class="bg-[#0095f6] text-white px-4 py-2.5 rounded-lg text-xs font-bold">Send</button>
                        </form>
                    </div>
                </div>

                <!-- DIRECT CHAT TAB -->
                <div id="tab-chat" class="hidden space-y-3">
                    <div class="bg-[#121212] border border-neutral-800 rounded-xl p-4 space-y-3">
                        <h3 class="text-xs font-bold text-neutral-300 uppercase tracking-wider border-b border-neutral-800 pb-2">Direct Messages 💬</h3>
                        <div id="messages-container" class="h-80 overflow-y-auto space-y-2 p-1"></div>
                        <form id="chat-form" class="flex gap-2">
                            <input type="text" id="chat-message" placeholder="Message..." class="flex-1 bg-black border border-neutral-800 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-neutral-500" required>
                            <button type="submit" class="bg-[#0095f6] text-white px-4 py-2.5 rounded-lg text-xs font-bold">Send</button>
                        </form>
                    </div>
                </div>

            </main>

            <!-- INSTAGRAM BOTTOM NAVIGATION BAR (Icons ziri hasi) -->
            <nav class="fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-800 py-3 px-6 flex justify-around items-center z-50 max-w-lg mx-auto">
                <!-- Home Icon -->
                <button onclick="switchTab('home')" id="nav-home" class="text-white hover:text-neutral-400 transition flex flex-col items-center">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.099l-11 9.901v11h8v-7h6v7h8v-11z"/></svg>
                </button>
                <!-- AI Assistant Icon -->
                <button onclick="switchTab('ai')" id="nav-ai" class="text-neutral-500 hover:text-neutral-400 transition flex flex-col items-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </button>
                <!-- Direct / Chat Icon (Instagram Paper Plane) -->
                <button onclick="switchTab('chat')" id="nav-chat" class="text-neutral-500 hover:text-neutral-400 transition flex flex-col items-center">
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
                document.getElementById('auth-btn').innerText = isLoginMode ? "Log In" : "Sign Up";
                document.getElementById('switch-text').innerText = isLoginMode ? "Don't have an account?" : "Have an account?";
                document.getElementById('switch-btn').innerText = isLoginMode ? "Sign up" : "Log In";
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

                document.getElementById('nav-home').className = "text-neutral-500 hover:text-neutral-400 transition flex flex-col items-center";
                document.getElementById('nav-ai').className = "text-neutral-500 hover:text-neutral-400 transition flex flex-col items-center";
                document.getElementById('nav-chat').className = "text-neutral-500 hover:text-neutral-400 transition flex flex-col items-center";

                document.getElementById('tab-' + tab).classList.remove('hidden');
                document.getElementById('nav-' + tab).className = "text-white hover:text-neutral-400 transition flex flex-col items-center";
            }

            async function loadAllData() {
                fetchPosts();
                fetchStories();
                fetchMessages();
            }

            // AI CHAT
            document.getElementById('ai-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = document.getElementById('ai-input');
                const prompt = input.value.trim();
                if (!prompt) return;

                const chatBox = document.getElementById('ai-chat-box');
                chatBox.innerHTML += \`<div class="bg-neutral-900 p-2 rounded-xl text-neutral-300"><strong>\${currentUser}:</strong> \${prompt}</div>\`;
                input.value = '';
                chatBox.scrollTop = chatBox.scrollHeight;

                const res = await fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });
                const data = await res.json();
                chatBox.innerHTML += \`<div class="bg-[#121212] border border-neutral-800 p-2.5 rounded-xl text-neutral-200"><strong>AI:</strong> \${data.reply}</div>\`;
                chatBox.scrollTop = chatBox.scrollHeight;
            });

            // POSTS FEED (Instagram Style Post Cards)
            async function fetchPosts() {
                const res = await fetch('/api/posts');
                const data = await res.json();
                document.getElementById('feed-container').innerHTML = data.map(post => \`
                    <div class="bg-black border border-neutral-800 rounded-xl overflow-hidden space-y-2 pb-3">
                        <div class="flex justify-between items-center p-3 pb-1">
                            <span class="font-bold text-xs text-white">@\${post.author}</span>
                            <span class="text-[10px] text-neutral-500">\${post.time}</span>
                        </div>
                        <div class="px-3 text-sm text-neutral-200">\${post.content}</div>
                        <div class="flex items-center gap-4 text-xs text-neutral-400 px-3 pt-2">
                            <button onclick="likePost(\${post.id})" class="hover:text-red-500 flex items-center gap-1">❤️ <span>\${post.likes || 0}</span></button>
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
                        <div class="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-yellow-500 to-fuchsia-600 flex items-center justify-center">
                            <div class="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase">\${story.author.substring(0, 2)}</div>
                        </div>
                        <span class="text-[10px] text-neutral-400 w-12 truncate text-center">\${story.author}</span>
                    </div>
                \`).join('');
                container.innerHTML = addBtnHtml + storiesHtml;
            }

            async function addStoryPrompt() {
                const content = prompt("Andika story yawe nka Instagram:");
                if (!content) return;
                await fetch('/api/stories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: currentUser, content }) });
                fetchStories();
            }

            // MESSAGES
            async function fetchMessages() {
                const res = await fetch('/api/messages');
                const data = await res.json();
                document.getElementById('messages-container').innerHTML = data.map(msg => \`
                    <div class="text-xs bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                        <span class="font-bold text-neutral-300">\${msg.sender}:</span>
                        <span class="text-neutral-400 ml-1">\${msg.message}</span>
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
