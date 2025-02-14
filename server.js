require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS for Netlify frontend
app.use(cors({
    origin: [
        'http://localhost:5173',  // Local Vite development server
        'https://your-netlify-app.netlify.app', // Replace with your Netlify domain
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Changed path to be relative to the backend directory
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');

// Ensure data directory exists
const ensureDataDirectory = async () => {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir);
    }
};

// Get tasks
app.get('/api/tasks', async (req, res) => {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(TASKS_FILE, '[]');
            res.json([]);
        } else {
            res.status(500).json({ error: 'Error reading tasks' });
        }
    }
});

// Health check endpoint for Railway.app
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Save tasks
app.post('/api/tasks', async (req, res) => {
    try {
        await ensureDataDirectory();
        await fs.writeFile(TASKS_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error saving tasks' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});