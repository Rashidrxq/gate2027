// ===== GATE 2027 - Premium Notes Platform =====
// Modern, minimal JavaScript for smooth interactions

// ===== Sample Notes Data =====
const sampleNotes = [
    {
        id: 1,
        title: "Complete Binary Tree Notes",
        subject: "dsa",
        subjectName: "Data Structures",
        type: "handwritten",
        description: "Comprehensive notes covering binary trees, BST, AVL trees, and heap data structures with examples and visualizations.",
        author: "Rahul Sharma",
        authorInitials: "RS",
        downloads: 234
    },
    {
        id: 2,
        title: "SQL Queries Cheat Sheet",
        subject: "dbms",
        subjectName: "Database Management",
        type: "formula",
        description: "Quick reference for all important SQL queries, joins, subqueries, and aggregate functions for GATE preparation.",
        author: "Priya Patel",
        authorInitials: "PP",
        downloads: 456
    },
    {
        id: 3,
        title: "Process Scheduling Algorithms",
        subject: "os",
        subjectName: "Operating Systems",
        type: "typed",
        description: "Detailed explanation of FCFS, SJF, Round Robin, Priority scheduling with solved numerical examples.",
        author: "Amit Kumar",
        authorInitials: "AK",
        downloads: 189
    },
    {
        id: 4,
        title: "OSI Model Explained",
        subject: "cn",
        subjectName: "Computer Networks",
        type: "handwritten",
        description: "Layer by layer explanation of OSI model with protocols, functions, and real-world application examples.",
        author: "Sneha Gupta",
        authorInitials: "SG",
        downloads: 312
    },
    {
        id: 5,
        title: "Regular Expressions & DFA",
        subject: "toc",
        subjectName: "Theory of Computation",
        type: "typed",
        description: "Converting RE to NFA to DFA with step-by-step solutions and state minimization techniques.",
        author: "Vikram Singh",
        authorInitials: "VS",
        downloads: 178
    },
    {
        id: 6,
        title: "Graph Algorithms PYQs",
        subject: "dsa",
        subjectName: "Data Structures",
        type: "pyq",
        description: "Previous year GATE questions on BFS, DFS, Dijkstra, Bellman-Ford, and MST algorithms with solutions.",
        author: "Neha Verma",
        authorInitials: "NV",
        downloads: 567
    }
];

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
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const closeLogin = document.getElementById('closeLogin');
const closeSignup = document.getElementById('closeSignup');
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
    renderNotes(sampleNotes);
    initializeEventListeners();
    initScrollAnimations();
});

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
    return `
        <div class="note-card" data-subject="${note.subject}">
            <div class="note-card-header">
                <span class="note-type-badge">${formatType(note.type)}</span>
                <h3>${note.title}</h3>
            </div>
            <div class="note-card-body">
                <span class="note-subject">${note.subjectName}</span>
                <p class="note-description">${note.description}</p>
                <div class="note-meta">
                    <div class="note-author">
                        <div class="note-author-avatar">${note.authorInitials}</div>
                        <span class="note-author-name">${note.author}</span>
                    </div>
                    <div class="note-actions">
                        <button class="note-action-btn" title="Download" onclick="downloadNote(${note.id})">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="note-action-btn" title="Save" onclick="saveNote(${note.id})">
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

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal(loginModal);
        if (e.target === signupModal) closeModal(signupModal);
    });

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(loginModal);
            closeModal(signupModal);
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
function filterNotes(filter) {
    if (filter === 'all') {
        renderNotes(sampleNotes);
    } else {
        const filtered = sampleNotes.filter(note => note.subject === filter);
        renderNotes(filtered);
    }
}

// ===== Search =====
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderNotes(sampleNotes);
        return;
    }

    const results = sampleNotes.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.description.toLowerCase().includes(query) ||
        note.subjectName.toLowerCase().includes(query) ||
        note.author.toLowerCase().includes(query)
    );

    renderNotes(results);
    
    if (results.length === 0) {
        notesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 48px; color: var(--text-light); margin-bottom: 25px; display: block;"></i>
                <h3>No notes found</h3>
                <p>Try different keywords or browse by subject</p>
            </div>
        `;
    }
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
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    console.log('Login:', { email, password });
    
    showToast('Welcome back! You have been signed in.');
    closeModal(loginModal);
    loginForm.reset();
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    console.log('Signup:', { name, email, password });
    
    showToast('Account created successfully!');
    closeModal(signupModal);
    signupForm.reset();
}

function handleUpload(e) {
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

    const uploadData = { title, subject, type, description, fileName: file.name };
    console.log('Upload:', uploadData);

    showToast('Notes uploaded successfully. Thank you for contributing!');
    uploadForm.reset();
    filePreview.classList.remove('active');
    filePreview.innerHTML = '';
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
function downloadNote(noteId) {
    const note = sampleNotes.find(n => n.id === noteId);
    if (note) {
        showToast(`Downloading: ${note.title}`);
        console.log('Downloading note:', noteId);
    }
}

function saveNote(noteId) {
    const note = sampleNotes.find(n => n.id === noteId);
    if (note) {
        showToast(`Saved to bookmarks: ${note.title}`);
        console.log('Saving note:', noteId);
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
