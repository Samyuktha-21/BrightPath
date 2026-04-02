const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if port is different

const examsGrid = document.getElementById('exams-grid');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const updatesMarquee = document.getElementById('updates-marquee');

let allExams = [];
let currentCategory = 'All';
let currentSort = 'date-asc'; // 'date-asc', 'date-desc', 'name-asc'

const loginBtn = document.querySelector('.cta-button');
const navContainer = document.querySelector('.dashboard-nav');

// --- Auth Logic ---
const userStr = localStorage.getItem('user');
if (userStr) {
    const user = JSON.parse(userStr);

    // Replace Login button with User Profile
    if (loginBtn) {
        loginBtn.style.display = 'none';

        const userProfile = document.createElement('div');
        userProfile.style.display = 'flex';
        userProfile.style.alignItems = 'center';
        userProfile.style.gap = '1rem';

        userProfile.innerHTML = `
            <span style="font-weight: 600; display: none;" id="nav-username">Welcome, ${user.name}</span>
            <button id="logout-btn" class="cta-button" style="padding: 0.5rem 1rem; font-size: 0.9rem; background: rgba(255,255,255,0.2); color: white;">Logout</button>
        `;

        navContainer.appendChild(userProfile);

        // Activate giant greeting
        const greetingSection = document.getElementById('greeting-section');
        const userGreeting = document.getElementById('user-greeting');
        if (greetingSection && userGreeting) {
            greetingSection.style.display = 'block';
            userGreeting.innerHTML = `Welcome back, <span style="color: var(--accent-color);">${user.name}</span>! 👋`;
        }

        // Logout Logic
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.reload();
        });
    }
} else {
    // Not logged in - navigate to login page
    if (loginBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
}

// --- Bookmarking System ---
function getBookmarks() {
    const saved = localStorage.getItem('brightpath_bookmarks');
    return saved ? JSON.parse(saved) : [];
}

function toggleBookmark(examName) {
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(examName);

    if (index === -1) {
        bookmarks.push(examName);
    } else {
        bookmarks.splice(index, 1);
    }

    localStorage.setItem('brightpath_bookmarks', JSON.stringify(bookmarks));
    filterAndRender();
    renderAnalytics(); // Refresh analytics when bookmark toggled

    // Sync to backend if logged in
    if (userStr) {
        const user = JSON.parse(userStr);
        fetch(`${API_BASE_URL}/auth/bookmarks`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, bookmarks })
        }).catch(err => console.error('Failed to sync bookmarks', err));
    }
}

// --- Helper: Countdown Timer ---
function getDaysLeft(examDateString) {
    const examDate = new Date(examDateString);
    const today = new Date();
    examDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Completed';
    if (diffDays === 0) return 'Today!';
    return `${diffDays} days left`;
}

// --- Fetch Exams ---
async function fetchExams() {
    try {
        const response = await fetch(`${API_BASE_URL}/exams`);
        allExams = await response.json();
        filterAndRender();
        renderAnalytics();
    } catch (error) {
        console.error('Error fetching exams:', error);
        examsGrid.innerHTML = '<p>Error loading exams. Please try again later.</p>';
    }
}

// --- Render Analytics ---
function renderAnalytics() {
    const analyticsDiv = document.getElementById('analytics-dashboard');
    if (!analyticsDiv) return;

    if (!userStr) {
        analyticsDiv.style.display = 'none';
        return;
    }

    const bookmarks = getBookmarks();
    if (bookmarks.length === 0) {
        analyticsDiv.style.display = 'block';
        analyticsDiv.innerHTML = `
            <div class="analytics-card" style="text-align: center;">
                <h3>Welcome to your Dashboard!</h3>
                <p>You haven't saved any exams yet. Start saving exams to see your personalized preparation timeline here.</p>
            </div>
        `;
        return;
    }

    const savedExams = allExams.filter(e => bookmarks.includes(e.name));
    
    // Sort saved exams by date
    savedExams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

    // Calculate stats
    const totalSaved = savedExams.length;
    let approachingIn30Days = 0;
    
    const today = new Date();
    savedExams.forEach(exam => {
        const examDate = new Date(exam.examDate);
        const diffDays = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 30) approachingIn30Days++;
    });

    const nextExam = savedExams.find(e => new Date(e.examDate) >= today);

    analyticsDiv.style.display = 'grid';
    analyticsDiv.innerHTML = `
        <div class="analytics-card stat-card">
            <h4>Total Saved Exams</h4>
            <div class="stat-number">${totalSaved}</div>
        </div>
        <div class="analytics-card stat-card">
            <h4>Approaching in 30 Days</h4>
            <div class="stat-number" style="color: var(--accent-color);">${approachingIn30Days}</div>
        </div>
        <div class="analytics-card tracker-card" style="grid-column: 1 / -1; display:flex; flex-direction:column; gap:0.5rem;">
            <h4>Your Next Big Exam</h4>
            ${nextExam ? `
                <div style="font-size: 1.2rem; font-weight: 600;">${nextExam.name} - <span style="color: var(--accent-color);">${getDaysLeft(nextExam.examDate)}</span></div>
                <div style="font-size: 0.9rem; opacity: 0.8;">${new Date(nextExam.examDate).toLocaleDateString()}</div>
                <div class="progress-bar-container" style="margin-top: 0.5rem;">
                    <div class="progress-bar" style="width: 100%; background: var(--accent-color); height: 8px; border-radius: 4px; animation: progressAnim 1s ease-out;"></div>
                </div>
            ` : '<p>No upcoming exams. All your saved exams are in the past!</p>'}
        </div>
    `;
}

// --- Fetch Updates ---
async function fetchUpdates() {
    try {
        const response = await fetch(`${API_BASE_URL}/updates`);
        const updates = await response.json();

        if (updates && updates.length > 0) {
            updatesMarquee.textContent = updates.map(u => u.text).join('  |  ');
        } else {
            // Fallback if API returns empty
            const placeholderUpdates = [
                "Welcome to BrightPath!",
                "NEET 2026 Registration opens soon.",
                "Stay tuned for more updates."
            ];
            updatesMarquee.textContent = placeholderUpdates.join('  |  ');
        }

    } catch (error) {
        console.error('Error fetching updates:', error);
        const placeholderUpdates = [
            "Welcome to BrightPath!",
            "NEET 2026 Registration opens soon.",
            "Stay tuned for more updates."
        ];
        updatesMarquee.textContent = placeholderUpdates.join('  |  ');
    }
}

// --- Render Logic ---
function renderExams(exams) {
    examsGrid.innerHTML = '';

    if (exams.length === 0) {
        examsGrid.innerHTML = '<p>No exams found.</p>';
        return;
    }

    const bookmarks = getBookmarks();

    exams.forEach(exam => {
        const date = new Date(exam.examDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const daysLeft = getDaysLeft(exam.examDate);
        const isBookmarked = bookmarks.includes(exam.name);
        // Use accessible symbols or SVG. Star symbol:
        const bookmarkIcon = isBookmarked ? '★' : '☆';
        const bookmarkClass = isBookmarked ? 'active' : '';

        let materialsHtml = '';
        if (exam.materials && exam.materials.length > 0) {
            materialsHtml = `<div class="materials-section">
                <h4 style="margin-bottom: 0.5rem; margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 0.5rem;">📚 Study Materials</h4>
                <div class="materials-list" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                    ${exam.materials.map(m => `
                        <a href="${m.link}" class="material-link" style="display: block; font-size: 0.85rem; padding: 0.4rem; background: rgba(0,0,0,0.2); border-radius: 4px; text-decoration: none; color: white;">
                            <span style="color: var(--accent-color); font-weight: bold;">${m.type}:</span> ${m.title}
                        </a>
                    `).join('')}
                </div>
            </div>`;
        }

        const card = document.createElement('div');
        card.className = 'exam-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div class="exam-category">${exam.category}</div>
                <button class="bookmark-btn ${bookmarkClass}" onclick="toggleBookmark('${exam.name}'); renderAnalytics();" title="${isBookmarked ? 'Remove' : 'Save'}">
                    ${bookmarkIcon}
                </button>
            </div>
            
            <h3 class="exam-title">${exam.name}</h3>
            <div class="exam-date">Date: ${date}</div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; font-weight: bold; color: var(--accent-color);">
                ⏳ ${daysLeft}
            </div>

            <p style="font-size: 0.9rem; margin-bottom: 1rem;">${exam.description || ''}</p>
            ${materialsHtml}
            <a href="${exam.websiteUrl}" target="_blank" class="exam-link">Official Website</a>
        `;
        examsGrid.appendChild(card);
    });
}

// --- Sorting & Filtering ---
function sortExams(exams) {
    return exams.sort((a, b) => {
        if (currentSort === 'date-asc') {
            return new Date(a.examDate) - new Date(b.examDate);
        } else if (currentSort === 'date-desc') {
            return new Date(b.examDate) - new Date(a.examDate);
        } else if (currentSort === 'name-asc') {
            return a.name.localeCompare(b.name);
        }
    });
}

function filterAndRender() {
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = allExams.filter(exam => {
        const matchesSearch = exam.name.toLowerCase().includes(searchTerm) ||
            (exam.description && exam.description.toLowerCase().includes(searchTerm));

        let matchesCategory = true;
        if (currentCategory === 'Saved') {
            matchesCategory = getBookmarks().includes(exam.name);
        } else if (currentCategory !== 'All') {
            matchesCategory = exam.category === currentCategory;
        }

        return matchesSearch && matchesCategory;
    });

    const sorted = sortExams(filtered);
    renderExams(sorted);
}

// --- Event Listeners ---
searchInput.addEventListener('input', filterAndRender);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        filterAndRender();
    });
});

// Add Sort Control
const controlsSection = document.querySelector('.controls-section');
let sortSelect = document.getElementById('sort-select');

// Prevent duplicates if re-run
if (!sortSelect) {
    sortSelect = document.createElement('select');
    sortSelect.id = 'sort-select';
    sortSelect.className = 'search-bar';
    sortSelect.style.flex = '0';
    sortSelect.style.minWidth = '150px';
    sortSelect.style.cursor = 'pointer';
    sortSelect.style.color = '#333'; // Ensure text is visible on white background
    sortSelect.innerHTML = `
        <option value="date-asc">Date (Soonest)</option>
        <option value="date-desc">Date (Latest)</option>
        <option value="name-asc">Name (A-Z)</option>
    `;
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        filterAndRender();
    });
    controlsSection.appendChild(sortSelect);
}

// Init
fetchExams();
fetchUpdates();
