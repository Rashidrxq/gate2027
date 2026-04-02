// ===== GATE 2027 - Node.js API Configuration =====
// Switch from Firebase to Node.js backend

const API_BASE_URL = 'https://gate2027-api.onrender.com/api';

// ===== Auth Token Management =====
function getToken() {
    return localStorage.getItem('gate2027_token');
}

function setToken(token) {
    localStorage.setItem('gate2027_token', token);
}

function removeToken() {
    localStorage.removeItem('gate2027_token');
}

function getAuthHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ===== Authentication Service =====
const AuthService = {
    async signUp(name, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            
            if (data.success) {
                setToken(data.token);
                this._currentUser = data.user;
            }
            return data;
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    },

    async signIn(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (data.success) {
                setToken(data.token);
                this._currentUser = data.user;
            }
            return data;
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    },

    async signOut() {
        removeToken();
        this._currentUser = null;
        return { success: true };
    },

    getCurrentUser() {
        return this._currentUser;
    },

    async checkAuth() {
        const token = getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            
            if (data.success) {
                this._currentUser = data.user;
                return data.user;
            }
            removeToken();
            return null;
        } catch {
            return null;
        }
    },

    onAuthStateChanged(callback) {
        // Check auth on load
        this.checkAuth().then(user => callback(user));
    },

    _currentUser: null
};

// ===== Notes Service =====
const NotesService = {
    async uploadNote(file, noteData) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', noteData.title);
            formData.append('subject', noteData.subject);
            formData.append('type', noteData.type);
            formData.append('description', noteData.description || '');

            const response = await fetch(`${API_BASE_URL}/notes/upload`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: 'Upload failed. Please try again.' };
        }
    },

    async getNotes(filter = 'all', limit = 20) {
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('subject', filter);
            params.append('limit', limit);

            const response = await fetch(`${API_BASE_URL}/notes?${params}`);
            return await response.json();
        } catch (error) {
            return { success: false, error: 'Failed to load notes.' };
        }
    },

    async searchNotes(searchTerm) {
        try {
            const params = new URLSearchParams({ search: searchTerm });
            const response = await fetch(`${API_BASE_URL}/notes?${params}`);
            return await response.json();
        } catch (error) {
            return { success: false, error: 'Search failed.' };
        }
    },

    async downloadNote(noteId) {
        try {
            const response = await fetch(`${API_BASE_URL}/notes/${noteId}/download`);
            const data = await response.json();
            
            if (data.success) {
                // Convert relative URL to absolute
                data.downloadURL = `https://gate2027-api.onrender.com${data.downloadURL}`;
            }
            return data;
        } catch (error) {
            return { success: false, error: 'Download failed.' };
        }
    },

    async deleteNote(noteId) {
        try {
            const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: 'Delete failed.' };
        }
    },

    async saveNote(noteId) {
        try {
            const response = await fetch(`${API_BASE_URL}/notes/${noteId}/save`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: 'Save failed.' };
        }
    }
};

// ===== Helper Functions =====
function getSubjectName(subjectCode) {
    const subjects = {
        'dsa': 'Data Structures & Algorithms',
        'dbms': 'Database Management',
        'os': 'Operating Systems',
        'cn': 'Computer Networks',
        'toc': 'Theory of Computation',
        'cd': 'Compiler Design',
        'coa': 'Computer Organization',
        'dm': 'Discrete Mathematics',
        'em': 'Engineering Mathematics',
        'apt': 'Aptitude & Reasoning',
        'ml': 'Machine Learning & AI',
        'se': 'Software Engineering'
    };
    return subjects[subjectCode] || subjectCode;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export for use
window.AuthService = AuthService;
window.NotesService = NotesService;
window.getSubjectName = getSubjectName;
window.formatFileSize = formatFileSize;

console.log('Node.js API configured - API URL:', API_BASE_URL);
