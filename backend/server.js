import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routers & engines
import stemRouter from './routes/stem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Global connection state flag for controllers
global.mongoConnected = false;

// Database Connection Handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/educare-ai';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 1500 // 1.5 seconds timeout
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully!');
  global.mongoConnected = true;
})
.catch((err) => {
  console.log('⚠️ MongoDB connection failed. Activating local JSON fallback.');
  global.mongoConnected = false;
});

// Mount modular API routers
app.use('/stem', stemRouter);
app.use('/api', stemRouter); // Backwards compatibility mount

// POST AI TUTOR (Heuristic chat companion Sparky Node)
app.post('/api/ai/tutor', (req, res) => {
  const { message, grade, context } = req.body;
  const q = message.toLowerCase();

  let reply = '';
  let mood = 'happy';

  if (q.includes('joke') || q.includes('funny')) {
    const jokes = [
      "Why did the lightbulb fail the test? Because it wasn't very bright! 😂",
      "What did the wire say to the battery? 'I get a real charge out of you!' ⚡",
      "Why did the electron look sad? Because it was feeling negative! ⚛️",
      "What is a scientist's favorite dog? A lab-rador! 🐕",
    ];
    reply = jokes[Math.floor(Math.random() * jokes.length)];
    mood = 'excited';
  } else if (q.includes('what is electricity') || q.includes('how does electricity work')) {
    if (grade === 'KG' || grade === 'Grade 1') {
      reply = "Electricity is like a **magic river** of tiny, invisible stars called **electrons**! When they flow through wires in a loop, they light up bulbs and spin toys! 🌟";
    } else {
      reply = "Electricity is the flow of tiny charged particles called **electrons**! They need a complete, unbroken loop called a **closed circuit** to travel from a power source (like a battery) to a user (like an LED bulb or motor).";
    }
    mood = 'happy';
  } else if (q.includes('conductor') || q.includes('insulator') || q.includes('metal') || q.includes('wood')) {
    reply = "A **conductor** (like copper, gold, or key) is a friendly helper that lets electrons pass through easily! An **insulator** (like wood, plastic, or rubber) is a blocker that stops electrons from flowing. For Grade 1, try testing different objects in our loop!";
    mood = 'excited';
  } else if (q.includes('switch')) {
    reply = "A **switch** is like a drawbridge for our electron road! When the switch is **CLOSED** (bridge down), the electrons cross and the light turns on. When it's **OPEN** (bridge up), the road is broken, and everything turns off! 🌉";
    mood = 'happy';
  } else if (q.includes('series') || q.includes('parallel')) {
    reply = "In a **Series circuit**, components are lined up in a single line like passengers on a bus. If one steps off (unscrews), the bus stops! In a **Parallel circuit**, components have their own separate roads, so they get full power and stay bright even if one is broken! 💡💡";
    mood = 'happy';
  } else if (q.includes('resistor') || q.includes('resistance')) {
    reply = "A **resistor** acts like a bottleneck or speed bump on the electron road! It slows down the current so delicate things (like LEDs or buzzers) don't get too hot or burn out. It's like a shield! 🛡️";
    mood = 'excited';
  } else if (q.includes('hint') || q.includes('solve') || q.includes('how do i')) {
    mood = 'thinking';
    if (context === 'lesson-kg') {
      reply = "Click the glowing wire end on the right, then click the bulb connector to create a complete loop. You got this!";
    } else if (context === 'lesson-g1') {
      reply = "Try dragging the **metal key** or the **copper coin** into the blank slot. Metal objects are excellent **conductors** of electricity!";
    } else if (context === 'lesson-g2') {
      reply = "Drag a **Switch** from the inventory and drop it into the gap in the wire. Then click on the switch to close it and let the current flow!";
    } else if (context === 'lesson-g3') {
      reply = "Build two circuits: one where bulbs are on the *same line* (Series) and one where they are on *separate loops* (Parallel). Notice how the Parallel bulbs shine twice as bright!";
    } else if (context === 'lesson-g4') {
      reply = "Connect the Battery, Switch, Resistor, and Buzzer in a loop. Click the switch to close it, and adjust the slider on the Resistor to see how it dims or silences the buzzer!";
    } else {
      reply = "Make sure you have a **Battery** to provide power, **wires** connecting all parts, and that the path loops all the way back from the battery (+) to (-). Also make sure any switches are closed!";
    }
  } else {
    reply = `Hi STEM explorer! That is an awesome question for Grade ${grade}. We learn that circuits need a complete path to work. Try checking if your wires are connected from one side of the battery all the way to the other! Let me know if you need another hint.`;
    mood = 'happy';
  }

  res.json({ reply, mood });
});

// Serve Frontend Static files if built
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Modular Server running on port ${PORT}`);
});
