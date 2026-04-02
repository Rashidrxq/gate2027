// ===== GATE 2027 Backend Server =====
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors()); // Allow all origins for development
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== Ensure directories exist =====
const directories = ['uploads', 'data'];
directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Initialize data files if they don't exist
const dataFiles = {
    'data/users.json': [],
    'data/notes.json': []
};

Object.entries(dataFiles).forEach(([file, defaultData]) => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
});

// ===== Routes =====
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// ===== Health Check =====
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GATE 2027 API is running' });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// ===== Start Server =====
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║   GATE 2027 Backend Server            ║
    ║   Running on http://localhost:${PORT}    ║
    ╚═══════════════════════════════════════╝
    `);
});
