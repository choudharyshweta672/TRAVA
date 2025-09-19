// Install first: npm install express socket.io axios

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Dummy translate function (replace with Google Translate API, DeepL, etc.)
async function translate(text, targetLang = "en") {
  return text; // For demo, no real translation
}

// Default options for every bot reply
function getOptions() {
  return [
    "Booking Issues",
    "Payment Issues",
    "Travel Guide Info",
    "🌐 Connect to Agent",
    "❌ No, I want to chat with Bot"
  ];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let connectedToAgent = false;
  let agentSocket = null;

  // 🔹 Send welcome message immediately when user connects
  socket.emit("botReply", {
    text: "👋 Welcome to Smart Travel Assistant! How can I help you today?",
    lang: "en",
    options: getOptions()
  });

  // Handle user messages/choices
  socket.on("userMessage", async (data) => {
    const { text, lang } = data;

    if (!connectedToAgent) {
      if (text.includes("Connect to Agent")) {
        connectedToAgent = true;
        agentSocket = [...io.sockets.sockets.values()].find(s => s.role === "agent");
        if (agentSocket) {
          socket.emit("botReply", { 
            text: "🔄 Connecting you to a live agent...", 
            lang,
            options: [] 
          });
          agentSocket.emit("agentNotification", { userId: socket.id });
        } else {
          socket.emit("botReply", { 
            text: "⚠ Sorry, no agents available right now.", 
            lang,
            options: getOptions() 
          });
        }
      } else if (text.includes("Booking Issues")) {
        socket.emit("botReply", { 
          text: "🛎 You selected Booking Issues. Please describe your booking problem.", 
          lang,
          options: getOptions()
        });
      } else if (text.includes("Payment Issues")) {
        socket.emit("botReply", { 
          text: "💳 You selected Payment Issues. Please provide your payment reference.", 
          lang,
          options: getOptions()
        });
      } else if (text.includes("Travel Guide Info")) {
        socket.emit("botReply", { 
          text: "🧭 You selected Travel Guide Info. Do you want local guide recommendations?", 
          lang,
          options: getOptions()
        });
      } else if (text.includes("No, I want to chat with Bot")) {
        socket.emit("botReply", { 
          text: "✅ Okay! Let's continue chatting. Tell me your issue.", 
          lang,
          options: getOptions()
        });
      } else {
        // Default chatbot response
        const reply = await translate("Hello! How can I assist you further?", lang);
        socket.emit("botReply", { text: reply, lang, options: getOptions() });
      }
    } else {
      // Forward to human agent
      if (agentSocket) {
        const translated = await translate(text, "en");
        agentSocket.emit("userToAgent", { userId: socket.id, text: translated });
      }
    }
  });

  // Handle agent messages
  socket.on("agentMessage", async (data) => {
    const { userId, text, lang } = data;
    const translated = await translate(text, lang);
    io.to(userId).emit("agentReply", { text: translated, lang, options: [] });
  });

  // Assign role
  socket.on("setRole", (role) => {
    socket.role = role; // "user" or "agent"
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

server.listen(3000, () => console.log("✅ Server running on port 3000"));
