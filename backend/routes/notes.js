// ===== Notes Routes =====
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gate2027-secret-key-change-in-production';
const NOTES_FILE = path.join(__dirname, '../data/notes.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX'));
        }
    }
});

// Helper functions
function getNotes() {
    const data = fs.readFileSync(NOTES_FILE, 'utf8');
    return JSON.parse(data);
}

function saveNotes(notes) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

function getUsers() {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function getUserFromToken(req) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const users = getUsers();
        return users.find(u => u.id === decoded.id);
    } catch {
        return null;
    }
}

const SUBJECT_NAMES = {
    'dsa': 'Data Structures & Algorithms',
    'dbms': 'Database Management',
    'os': 'Operating Systems',
    'cn': 'Computer Networks',
    'toc': 'Theory of Computation',
    'cd': 'Compiler Design',
    'coa': 'Computer Organization',
    'dm': 'Discrete Mathematics'
};

// ===== Get All Notes =====
router.get('/', (req, res) => {
    try {
        const { subject, limit = 20, search } = req.query;
        let notes = getNotes();

        // Filter by subject
        if (subject && subject !== 'all') {
            notes = notes.filter(n => n.subject === subject);
        }

        // Search
        if (search) {
            const query = search.toLowerCase();
            notes = notes.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.description.toLowerCase().includes(query) ||
                n.subjectName.toLowerCase().includes(query) ||
                n.authorName.toLowerCase().includes(query)
            );
        }

        // Sort by newest first
        notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Limit results
        notes = notes.slice(0, parseInt(limit));

        res.json({ success: true, notes });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ===== Get Single Note =====
router.get('/:id', (req, res) => {
    try {
        const notes = getNotes();
        const note = notes.find(n => n.id === req.params.id);

        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        res.json({ success: true, note });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ===== Upload Note =====
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            // Delete uploaded file if auth fails
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(401).json({ success: false, error: 'Please login to upload notes' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please select a file' });
        }

        const { title, subject, type, description } = req.body;

        if (!title || !subject || !type) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, error: 'Please fill all required fields' });
        }

        const notes = getNotes();

        const newNote = {
            id: uuidv4(),
            title,
            subject,
            subjectName: SUBJECT_NAMES[subject] || subject,
            type,
            description: description || '',
            fileName: req.file.originalname,
            fileSize: req.file.size,
            filePath: req.file.filename,
            downloadURL: `/uploads/${req.file.filename}`,
            authorId: user.id,
            authorName: user.name,
            authorInitials: user.initials,
            downloads: 0,
            createdAt: new Date().toISOString()
        };

        notes.push(newNote);
        saveNotes(notes);

        // Update user upload count
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex].uploadCount = (users[userIndex].uploadCount || 0) + 1;
            saveUsers(users);
        }

        res.status(201).json({
            success: true,
            message: 'Note uploaded successfully',
            note: newNote
        });

    } catch (error) {
        console.error('Upload error:', error);
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch {}
        }
        res.status(500).json({ success: false, error: error.message || 'Upload failed' });
    }
});

// ===== Download Note =====
router.get('/:id/download', (req, res) => {
    try {
        const notes = getNotes();
        const noteIndex = notes.findIndex(n => n.id === req.params.id);

        if (noteIndex === -1) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        const note = notes[noteIndex];
        const filePath = path.join(UPLOADS_DIR, note.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        // Increment download count
        notes[noteIndex].downloads = (notes[noteIndex].downloads || 0) + 1;
        saveNotes(notes);

        // Send file info for frontend to handle
        res.json({
            success: true,
            downloadURL: note.downloadURL,
            fileName: note.fileName
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ===== Delete Note =====
router.delete('/:id', (req, res) => {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Please login' });
        }

        const notes = getNotes();
        const noteIndex = notes.findIndex(n => n.id === req.params.id);

        if (noteIndex === -1) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        const note = notes[noteIndex];

        // Check ownership
        if (note.authorId !== user.id) {
            return res.status(403).json({ success: false, error: 'You can only delete your own notes' });
        }

        // Delete file
        const filePath = path.join(UPLOADS_DIR, note.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove from array
        notes.splice(noteIndex, 1);
        saveNotes(notes);

        res.json({ success: true, message: 'Note deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ===== Save/Bookmark Note =====
router.post('/:id/save', (req, res) => {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Please login to save notes' });
        }

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Initialize savedNotes array if doesn't exist
        if (!users[userIndex].savedNotes) {
            users[userIndex].savedNotes = [];
        }

        const noteId = req.params.id;
        const savedIndex = users[userIndex].savedNotes.indexOf(noteId);

        if (savedIndex === -1) {
            // Add to saved
            users[userIndex].savedNotes.push(noteId);
            saveUsers(users);
            res.json({ success: true, saved: true, message: 'Added to bookmarks' });
        } else {
            // Remove from saved
            users[userIndex].savedNotes.splice(savedIndex, 1);
            saveUsers(users);
            res.json({ success: true, saved: false, message: 'Removed from bookmarks' });
        }

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
