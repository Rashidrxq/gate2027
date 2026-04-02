// ===== GATE 2027 - Premium Notes Platform =====
// Firebase-integrated JavaScript for notes management

// ===== State =====
let currentUser = null;
let currentFilter = 'all';
let allNotes = [];

// ===== DOM Elements =====
const notesGrid = document.getElementById('notesGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const navbar = document.getElementById('navbar');

// Modals
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const syllabusModal = document.getElementById('syllabusModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const syllabusBtn = document.getElementById('syllabusBtn');
const closeLogin = document.getElementById('closeLogin');
const closeSignup = document.getElementById('closeSignup');
const closeSyllabus = document.getElementById('closeSyllabus');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');

// Forms
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const uploadForm = document.getElementById('uploadForm');

// File Upload
const fileUploadArea = document.getElementById('fileUploadArea');
const noteFile = document.getElementById('noteFile');
const filePreview = document.getElementById('filePreview');

// Toast
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Subject Cards
const subjectCards = document.querySelectorAll('.subject-card');

// Hamburger Menu
const hamburger = document.getElementById('hamburger');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initScrollAnimations();
    initFirebase();
});

// ===== Firebase Initialization =====
async function initFirebase() {
    // Check if Firebase is configured
    if (typeof AuthService === 'undefined') {
        console.log('Firebase not configured - using demo mode');
        loadDemoNotes();
        return;
    }

    // Listen for auth state changes
    AuthService.onAuthStateChanged((user) => {
        currentUser = user;
        updateUIForAuthState(user);
    });

    // Load notes from Firebase
    await loadNotesFromFirebase();
}

function updateUIForAuthState(user) {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (user) {
        loginBtn.textContent = user.displayName || 'Profile';
        signupBtn.textContent = 'Logout';
        signupBtn.onclick = handleLogout;
    } else {
        loginBtn.textContent = 'Login';
        signupBtn.textContent = 'Sign Up';
        signupBtn.onclick = () => openModal(signupModal);
    }
}

async function loadNotesFromFirebase() {
    try {
        showLoadingState();
        const result = await NotesService.getNotes(currentFilter);
        
        if (result.success && result.notes.length > 0) {
            allNotes = result.notes;
            renderNotes(allNotes);
        } else {
            // If no notes in Firebase, show demo notes
            loadDemoNotes();
        }
    } catch (error) {
        console.log('Loading demo notes...');
        loadDemoNotes();
    }
}

function loadDemoNotes() {
    // Demo notes for when Firebase isn't configured
    const demoNotes = [
        {
            id: '1',
            title: "Complete Binary Tree Notes",
            subject: "dsa",
            subjectName: "Data Structures",
            type: "handwritten",
            description: "Comprehensive notes covering binary trees, BST, AVL trees, and heap data structures with examples.",
            authorName: "Rahul Sharma",
            authorInitials: "RS",
            downloads: 234
        },
        {
            id: '2',
            title: "SQL Queries Cheat Sheet",
            subject: "dbms",
            subjectName: "Database Management",
            type: "formula",
            description: "Quick reference for all important SQL queries, joins, subqueries, and aggregate functions.",
            authorName: "Priya Patel",
            authorInitials: "PP",
            downloads: 456
        },
        {
            id: '3',
            title: "Process Scheduling Algorithms",
            subject: "os",
            subjectName: "Operating Systems",
            type: "typed",
            description: "Detailed explanation of FCFS, SJF, Round Robin, Priority scheduling with solved examples.",
            authorName: "Amit Kumar",
            authorInitials: "AK",
            downloads: 189
        },
        {
            id: '4',
            title: "OSI Model Explained",
            subject: "cn",
            subjectName: "Computer Networks",
            type: "handwritten",
            description: "Layer by layer explanation of OSI model with protocols and real-world examples.",
            authorName: "Sneha Gupta",
            authorInitials: "SG",
            downloads: 312
        },
        {
            id: '5',
            title: "Regular Expressions & DFA",
            subject: "toc",
            subjectName: "Theory of Computation",
            type: "typed",
            description: "Converting RE to NFA to DFA with step-by-step solutions and minimization techniques.",
            authorName: "Vikram Singh",
            authorInitials: "VS",
            downloads: 178
        },
        {
            id: '6',
            title: "Graph Algorithms PYQs",
            subject: "dsa",
            subjectName: "Data Structures",
            type: "pyq",
            description: "Previous year GATE questions on BFS, DFS, Dijkstra, and MST algorithms with solutions.",
            authorName: "Neha Verma",
            authorInitials: "NV",
            downloads: 567
        }
    ];
    allNotes = demoNotes;
    renderNotes(demoNotes);
}

function showLoadingState() {
    notesGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--accent); margin-bottom: 15px;"></i>
            <p style="color: var(--text-muted);">Loading notes...</p>
        </div>
    `;
}

// ===== Render Notes =====
function renderNotes(notes) {
    notesGrid.innerHTML = notes.map((note, index) => createNoteCard(note, index)).join('');
    
    // Add staggered animation to cards
    const cards = notesGrid.querySelectorAll('.note-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function createNoteCard(note) {
    const authorName = note.authorName || note.author || 'Anonymous';
    const authorInitials = note.authorInitials || authorName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    
    return `
        <div class="note-card" data-subject="${note.subject}" data-id="${note.id}">
            <div class="note-card-header">
                <span class="note-type-badge">${formatType(note.type)}</span>
                <h3>${note.title}</h3>
            </div>
            <div class="note-card-body">
                <span class="note-subject">${note.subjectName}</span>
                <p class="note-description">${note.description}</p>
                <div class="note-meta">
                    <div class="note-author">
                        <div class="note-author-avatar">${authorInitials}</div>
                        <span class="note-author-name">${authorName}</span>
                    </div>
                    <div class="note-actions">
                        <button class="note-action-btn" title="Download" onclick="downloadNote('${note.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="note-action-btn" title="Save" onclick="saveNote('${note.id}')">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function formatType(type) {
    const types = {
        'handwritten': 'Handwritten',
        'typed': 'Typed',
        'pyq': 'PYQ',
        'formula': 'Formula'
    };
    return types[type] || type;
}

// ===== Event Listeners =====
function initializeEventListeners() {
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterNotes(btn.dataset.filter);
        });
    });

    // Search
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Modal handlers
    loginBtn.addEventListener('click', () => openModal(loginModal));
    signupBtn.addEventListener('click', () => openModal(signupModal));
    closeLogin.addEventListener('click', () => closeModal(loginModal));
    closeSignup.addEventListener('click', () => closeModal(signupModal));
    
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        setTimeout(() => openModal(signupModal), 200);
    });
    
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signupModal);
        setTimeout(() => openModal(loginModal), 200);
    });

    // Syllabus modal
    syllabusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(syllabusModal);
    });
    closeSyllabus.addEventListener('click', () => closeModal(syllabusModal));

    // Syllabus tabs
    const syllabusTabs = document.querySelectorAll('.syllabus-tab');
    const syllabusPanels = document.querySelectorAll('.syllabus-panel');
    
    syllabusTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.section;
            
            // Update active tab
            syllabusTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active panel
            syllabusPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.dataset.panel === section) {
                    panel.classList.add('active');
                }
            });
        });
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal(loginModal);
        if (e.target === signupModal) closeModal(signupModal);
        if (e.target === syllabusModal) closeModal(syllabusModal);
    });

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(loginModal);
            closeModal(signupModal);
            closeModal(syllabusModal);
        }
    });

    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    uploadForm.addEventListener('submit', handleUpload);

    // File upload
    fileUploadArea.addEventListener('click', () => noteFile.click());
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleDrop);
    noteFile.addEventListener('change', handleFileSelect);

    // Subject cards
    subjectCards.forEach(card => {
        card.addEventListener('click', () => {
            const subject = card.dataset.subject;
            filterNotes(subject);
            scrollToSection('notes');
            
            // Update filter button
            filterBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.filter === subject) {
                    btn.classList.add('active');
                }
            });
        });
    });

    // Load more button
    loadMoreBtn.addEventListener('click', loadMoreNotes);

    // Hamburger menu
    hamburger.addEventListener('click', toggleMobileMenu);

    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
}

// ===== Navbar Scroll Effect =====
function handleNavbarScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe section headers
    document.querySelectorAll('.section-header').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // Observe subject cards
    document.querySelectorAll('.subject-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(el);
    });
}

// Add animation styles
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    </style>
`);

// ===== Filter Notes =====
async function filterNotes(filter) {
    currentFilter = filter;
    
    if (typeof NotesService !== 'undefined') {
        // Use Firebase
        const result = await NotesService.getNotes(filter);
        if (result.success) {
            allNotes = result.notes;
            renderNotes(allNotes);
        }
    } else {
        // Use local data
        if (filter === 'all') {
            renderNotes(allNotes);
        } else {
            const filtered = allNotes.filter(note => note.subject === filter);
            renderNotes(filtered);
        }
    }
}

// ===== Search =====
async function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderNotes(allNotes);
        return;
    }

    if (typeof NotesService !== 'undefined') {
        const result = await NotesService.searchNotes(query);
        if (result.success) {
            renderNotes(result.notes);
            if (result.notes.length === 0) showNoResults();
        }
    } else {
        const results = allNotes.filter(note => 
            note.title.toLowerCase().includes(query) ||
            note.description.toLowerCase().includes(query) ||
            note.subjectName.toLowerCase().includes(query) ||
            (note.authorName || '').toLowerCase().includes(query)
        );
        renderNotes(results);
        if (results.length === 0) showNoResults();
    }
}

function showNoResults() {
    notesGrid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search" style="font-size: 48px; color: var(--text-light); margin-bottom: 25px; display: block;"></i>
            <h3>No notes found</h3>
            <p>Try different keywords or browse by subject</p>
        </div>
    `;
}

// ===== Modal Functions =====
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Form Handlers =====
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    console.log('Login attempt:', { email });
    console.log('AuthService available:', typeof AuthService !== 'undefined');

    if (typeof AuthService !== 'undefined') {
        const result = await AuthService.signIn(email, password);
        console.log('Login result:', result);
        if (result.success) {
            showToast('Welcome back! You have been signed in.');
            closeModal(loginModal);
            loginForm.reset();
        } else {
            showToast(result.error || 'Login failed', 'error');
        }
    } else {
        showToast('Backend not connected - please check console', 'error');
        console.error('AuthService not loaded! Check if api-config.js is included');
        closeModal(loginModal);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    console.log('Signup attempt:', { name, email });
    console.log('AuthService available:', typeof AuthService !== 'undefined');

    if (typeof AuthService !== 'undefined') {
        const result = await AuthService.signUp(name, email, password);
        console.log('Signup result:', result);
        if (result.success) {
            showToast('Account created successfully!');
            closeModal(signupModal);
            signupForm.reset();
        } else {
            showToast(result.error || 'Signup failed', 'error');
        }
    } else {
        showToast('Backend not connected - please check console', 'error');
        console.error('AuthService not loaded! Check if api-config.js is included');
        closeModal(signupModal);
    }
}

async function handleLogout() {
    if (typeof AuthService !== 'undefined') {
        await AuthService.signOut();
        showToast('You have been logged out.');
    }
}

async function handleUpload(e) {
    e.preventDefault();
    
    const title = document.getElementById('noteTitle').value;
    const subject = document.getElementById('noteSubject').value;
    const type = document.getElementById('noteType').value;
    const description = document.getElementById('noteDescription').value;
    const file = noteFile.files[0];

    if (!file) {
        showToast('Please select a file to upload', 'error');
        return;
    }

    if (typeof NotesService !== 'undefined' && typeof AuthService !== 'undefined') {
        if (!AuthService.getCurrentUser()) {
            showToast('Please login to upload notes', 'error');
            openModal(loginModal);
            return;
        }

        showToast('Uploading your notes...');
        
        const noteData = {
            title,
            subject,
            subjectName: getSubjectName(subject),
            type,
            description
        };

        const result = await NotesService.uploadNote(file, noteData);
        
        if (result.success) {
            showToast('Notes uploaded successfully. Thank you for contributing!');
            uploadForm.reset();
            filePreview.classList.remove('active');
            filePreview.innerHTML = '';
            // Refresh notes list
            await loadNotesFromFirebase();
        } else {
            showToast(result.error, 'error');
        }
    } else {
        showToast('Firebase not configured - upload disabled in demo mode', 'error');
    }
}

// ===== File Upload Handlers =====
function handleDragOver(e) {
    e.preventDefault();
    fileUploadArea.style.borderColor = 'var(--accent)';
    fileUploadArea.style.background = 'var(--bg-cream)';
}

function handleDragLeave(e) {
    e.preventDefault();
    fileUploadArea.style.borderColor = '';
    fileUploadArea.style.background = '';
}

function handleDrop(e) {
    e.preventDefault();
    fileUploadArea.style.borderColor = '';
    fileUploadArea.style.background = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        noteFile.files = files;
        displayFilePreview(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        displayFilePreview(file);
    }
}

function displayFilePreview(file) {
    const fileSize = formatFileSize(file.size);
    const fileIcon = getFileIcon(file.name);
    
    filePreview.innerHTML = `
        <div class="file-info">
            <i class="${fileIcon}"></i>
            <div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize}</div>
            </div>
        </div>
        <button type="button" class="remove-file" onclick="removeFile()">
            <i class="fas fa-times"></i>
        </button>
    `;
    filePreview.classList.add('active');
}

function removeFile() {
    noteFile.value = '';
    filePreview.classList.remove('active');
    filePreview.innerHTML = '';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint'
    };
    return icons[ext] || 'fas fa-file';
}

// ===== Toast Notification =====
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.classList.remove('error');
    
    if (type === 'error') {
        toast.classList.add('error');
        toast.querySelector('i').className = 'fas fa-exclamation-circle';
    } else {
        toast.querySelector('i').className = 'fas fa-check-circle';
    }
    
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

// ===== Note Actions =====
async function downloadNote(noteId) {
    if (typeof NotesService !== 'undefined') {
        const result = await NotesService.downloadNote(noteId);
        if (result.success) {
            // Trigger download
            const link = document.createElement('a');
            link.href = result.downloadURL;
            link.download = result.fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast(`Downloading: ${result.fileName}`);
        } else {
            showToast(result.error, 'error');
        }
    } else {
        const note = allNotes.find(n => n.id === noteId);
        if (note) {
            showToast(`Download not available in demo mode`);
        }
    }
}

async function saveNote(noteId) {
    if (typeof NotesService !== 'undefined') {
        if (!AuthService.getCurrentUser()) {
            showToast('Please login to save notes', 'error');
            openModal(loginModal);
            return;
        }
        
        const result = await NotesService.saveNote(noteId);
        if (result.success) {
            showToast(result.message);
        } else {
            showToast(result.error, 'error');
        }
    } else {
        const note = allNotes.find(n => n.id === noteId);
        if (note) {
            showToast(`Saved to bookmarks: ${note.title}`);
        }
    }
}

// ===== Load More Notes =====
function loadMoreNotes() {
    showToast('Loading more notes...');
}

// ===== Mobile Menu =====
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
}

// ===== Scroll to Section =====
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ===== Smooth Hover Effects =====
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function(e) {
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});
