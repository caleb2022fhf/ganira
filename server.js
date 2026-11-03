const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database ya Agateganyo
let users = [];
let posts = [
  { id: 1, author: "Ganira Official", content: "Murakaza neza kuri Ganira Multi-file architecture! 🔥", time: "Ubu", likes: 10 }
];
let stories = [{ id: 1, author: "Ganira Bot", content: "Welcome to Stories!" }];
let messages = [{ sender: "Ganira Bot", message: "Muraho muri Live Chat!", time: "12:00" }];

// API: SIGNUP
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email na password birakenewe" });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "Iyi email isanzwe ikoreshwa." });
  users.push({ email, password });
  res.status(201).json({ success: true });
});

// API: LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) res.json({ success: true });
  else res.status(401).json({ error: "Email cyangwa password si byo." });
});

// API: POSTS
app.get('/api/posts', (req, res) => res.json(posts));
app.post('/api/posts', (req, res) => {
  const { author, content } = req.body;
  if (author && content) {
    posts.unshift({ id: Date.now(), author, content, time: "Ubu", likes: 0 });
    res.json({ success: true });
  }
});

// API: STORIES
app.get('/api/stories', (req, res) => res.json(stories));
app.post('/api/stories', (req, res) => {
  const { author, content } = req.body;
  if (author && content) {
    stories.unshift({ id: Date.now(), author, content });
    res.json({ success: true });
  }
});

// API: MESSAGES
app.get('/api/messages', (req, res) => res.json(messages));
app.post('/api/messages', (req, res) => {
  const { sender, message } = req.body;
  if (sender && message) {
    messages.push({ sender, message, time: new Date().toLocaleTimeString() });
    res.json({ success: true });
  }
});

// API: AI ASSISTANT
app.post('/api/ai', (req, res) => {
  const { prompt } = req.body;
  let reply = "Urakoze! Ndi AI ya Ganira, niteguye kugufasha.";
  if (prompt.toLowerCase().includes("muraho")) reply = "Muraho neza! Amakuru yawe?";
  setTimeout(() => res.json({ reply }), 300);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
