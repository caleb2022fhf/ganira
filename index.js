const express = require('express');
const app = express();
app.use(express.json());

// Ububiko bw'agateganyo muri memory ya server kugira ngo bikore ako kanya
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
        <title>Ganira - Chat App</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 h-screen flex flex-col justify-between">

        <!-- Umutwe w'urubuga -->
        <header class="bg-indigo-600 text-white p-4 text-center font-bold text-xl shadow-md">
            Ganira Chat App 💬
        </header>

        <!-- Aho ubutumwa bugaragara -->
        <div id="messages-container" class="flex-1 p-4 overflow-y-auto space-y-3 max-w-2xl mx-auto w-full">
            <!-- Ubutumwa buzajya buza hano -->
        </div>

        <!-- Akazu ko kwandikamo no kohereza -->
        <div class="bg-white border-t p-4 shadow-lg">
            <form id="chat-form" class="max-w-2xl mx-auto flex gap-2">
                <input type="text" id="sender" placeholder="Izina ryawe..." class="border p-2 rounded-lg w-1/4 focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                <input type="text" id="message" placeholder="Andika ubutumwa bwawe..." class="border p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                <button type="submit" class="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Ohereza</button>
            </form>
        </div>

        <script>
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
            setInterval(fetchMessages, 2000); // Ivugurura buri masegonda 2
        </script>
    </body>
    </html>
  `);
});

// API yo gusoma ubutumwa
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// API yo kohereza ubutumwa
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
