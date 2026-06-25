const API_BASE_URL = '/api'; // relative — works locally, on Render and on Vercel

const examsGrid = document.getElementById('exams-grid');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-chip');
const announcementsEl = document.getElementById('announcements');
const lastUpdatedText = document.getElementById('last-updated-text');

let allExams = [];
let currentCategory = 'All';

// ----------------------------- helpers ----------------------------------
function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr) {
    const exam = new Date(dateStr); exam.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
}

function getCountdown(exam) {
    if (exam.isRolling || !exam.examDate) return { text: 'Year-round', cls: 'countdown-neutral' };
    const days = daysUntil(exam.examDate);
    if (days < 0) return { text: 'Completed', cls: 'countdown-neutral' };
    if (days === 0) return { text: 'Today', cls: 'countdown-red' };
    let cls = 'countdown-green';
    if (days < 30) cls = 'countdown-red';
    else if (days < 60) cls = 'countdown-amber';
    return { text: `${days} ${days === 1 ? 'day' : 'days'} left`, cls };
}

const CALENDAR_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';

// ----------------------------- auth -------------------------------------
const userStr = localStorage.getItem('user');
let user = null;
if (userStr) {
    try { user = JSON.parse(userStr); } catch (e) { user = null; }
}

if (user) {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        const wrap = document.createElement('span');
        wrap.className = 'nav-user';
        wrap.textContent = `Hi, ${user.name}`;
        const logout = document.createElement('button');
        logout.className = 'btn-ghost';
        logout.textContent = 'Logout';
        logout.onclick = () => { localStorage.removeItem('user'); window.location.reload(); };
        loginBtn.replaceWith(wrap, logout);
    }
    const gs = document.getElementById('greeting-section');
    const ug = document.getElementById('user-greeting');
    if (gs && ug) {
        gs.style.display = 'block';
        ug.innerHTML = `Welcome back, <span style="color:var(--primary-color)">${escapeHtml(user.name)}</span> 👋`;
    }
}

// --------------------------- bookmarks ----------------------------------
function getBookmarks() {
    const saved = localStorage.getItem('brightpath_bookmarks');
    return saved ? JSON.parse(saved) : [];
}

function toggleBookmark(examName) {
    const bookmarks = getBookmarks();
    const i = bookmarks.indexOf(examName);
    if (i === -1) bookmarks.push(examName); else bookmarks.splice(i, 1);
    localStorage.setItem('brightpath_bookmarks', JSON.stringify(bookmarks));
    filterAndRender();
    renderAnalytics();
    if (user) {
        fetch(`${API_BASE_URL}/auth/bookmarks`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, bookmarks })
        }).catch(err => console.error('Failed to sync bookmarks', err));
    }
}
window.toggleBookmark = toggleBookmark;

// --------------------------- rendering ----------------------------------
function renderCard(exam, index) {
    const bookmarks = getBookmarks();
    const isBookmarked = bookmarks.includes(exam.name);
    const cd = getCountdown(exam);
    const catClass = 'cat-' + (exam.category || 'other').toLowerCase();

    const dateLabel = exam.isRolling || !exam.examDate
        ? (exam.scheduleNote ? escapeHtml(exam.scheduleNote) : 'Available year-round')
        : formatDate(exam.examDate);

    const unverified = exam.isVerified === false
        ? '<span class="badge-unverified" title="Date not confirmed against an official source">Unverified date</span>'
        : '';

    let materials = '';
    if (exam.materials && exam.materials.length > 0) {
        materials = `<div class="materials-section"><h4>📚 Study Materials</h4>${exam.materials.map(m =>
            `<a href="${escapeHtml(m.link)}" class="material-link"><strong style="color:var(--primary-color)">${escapeHtml(m.type)}:</strong> ${escapeHtml(m.title)}</a>`
        ).join('')}</div>`;
    }

    const card = document.createElement('article');
    card.className = 'exam-card';
    card.style.animationDelay = `${Math.min(index, 12) * 0.04}s`;
    card.innerHTML = `
        <div class="card-top">
            <span class="cat-pill ${catClass}">${escapeHtml(exam.category)}</span>
            <button class="bookmark ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark('${exam.name.replace(/'/g, "\\'")}')" title="${isBookmarked ? 'Remove bookmark' : 'Save exam'}" aria-label="bookmark">${isBookmarked ? '★' : '☆'}</button>
        </div>
        <h3 class="card-title">${escapeHtml(exam.name)}</h3>
        <div class="card-date">${CALENDAR_ICON}<span>${dateLabel}</span>${unverified}</div>
        <div class="countdown ${cd.cls}">⏳ ${cd.text}</div>
        <p class="card-desc">${escapeHtml(exam.description || '')}</p>
        ${materials}
        <a href="${escapeHtml(exam.websiteUrl)}" target="_blank" rel="noopener" class="card-link">Official site →</a>
    `;
    return card;
}

function renderExams(exams) {
    examsGrid.innerHTML = '';
    if (exams.length === 0) {
        examsGrid.innerHTML = `
            <div class="empty-state">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cfcabd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line><line x1="9" y1="16" x2="15" y2="16"></line>
                </svg>
                <h3>No exams found</h3>
                <p>Try a different category or clear your search.</p>
            </div>`;
        return;
    }
    const frag = document.createDocumentFragment();
    exams.forEach((exam, i) => frag.appendChild(renderCard(exam, i)));
    examsGrid.appendChild(frag);
}

function sortExams(exams) {
    return exams.slice().sort((a, b) => {
        if (!a.examDate && !b.examDate) return 0;
        if (!a.examDate) return 1;   // rolling/no-date last
        if (!b.examDate) return -1;
        return new Date(a.examDate) - new Date(b.examDate);
    });
}

function filterAndRender() {
    const term = searchInput.value.toLowerCase().trim();
    const bookmarks = getBookmarks();

    let filtered = allExams.filter(exam => {
        const haystack = `${exam.name} ${exam.description || ''} ${exam.conductingBody || ''} ${exam.category}`.toLowerCase();
        const matchesSearch = !term || haystack.includes(term);

        let matchesCategory = true;
        if (currentCategory === 'Saved') matchesCategory = bookmarks.includes(exam.name);
        else if (currentCategory !== 'All') matchesCategory = exam.category === currentCategory;

        return matchesSearch && matchesCategory;
    });

    renderExams(sortExams(filtered));
}

// --------------------------- analytics ----------------------------------
function renderAnalytics() {
    const el = document.getElementById('analytics-dashboard');
    if (!el) return;
    if (!user) { el.style.display = 'none'; return; }

    const bookmarks = getBookmarks();
    if (bookmarks.length === 0) {
        el.style.display = 'grid';
        el.innerHTML = `<div class="analytics-card" style="grid-column:1/-1"><h4 style="color:var(--text-muted);font-weight:500">Your tracker is empty</h4><p style="margin-top:.3rem">Tap the ☆ on any exam to start building your personalised timeline.</p></div>`;
        return;
    }

    const saved = allExams.filter(e => bookmarks.includes(e.name)).filter(e => e.examDate);
    saved.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
    const today = new Date();
    const approaching = saved.filter(e => { const d = daysUntil(e.examDate); return d >= 0 && d <= 30; }).length;
    const next = saved.find(e => new Date(e.examDate) >= today);

    el.style.display = 'grid';
    el.innerHTML = `
        <div class="analytics-card stat-card"><h4>Saved exams</h4><div class="stat-number">${bookmarks.length}</div></div>
        <div class="analytics-card stat-card"><h4>Within 30 days</h4><div class="stat-number" style="color:var(--warm)">${approaching}</div></div>
        <div class="analytics-card tracker-card" style="grid-column:1/-1">
            <h4 style="color:var(--text-muted);font-weight:500">Your next exam</h4>
            ${next ? `<div style="font-size:1.15rem;font-weight:700;margin-top:.3rem">${escapeHtml(next.name)} — <span style="color:var(--primary-color)">${getCountdown(next).text}</span></div>
            <div style="font-size:.85rem;color:var(--text-muted)">${formatDate(next.examDate)}</div>
            <div class="progress-bar-container" style="margin-top:.6rem;height:8px"><div class="progress-bar" style="width:100%;background:var(--primary-color);height:8px;border-radius:4px;animation:progressAnim 1s ease-out"></div></div>`
            : '<p style="margin-top:.3rem">All your saved exams are in the past.</p>'}
        </div>`;
}

// ------------------------- announcements / meta -------------------------
async function fetchUpdates() {
    try {
        const res = await fetch(`${API_BASE_URL}/updates`);
        const updates = await res.json();
        const items = (updates && updates.length) ? updates : [{ text: 'Welcome to BrightPath — track every exam that matters.' }];
        const pills = items.map(u =>
            `<span class="announce-pill"><span class="dot"></span>${escapeHtml(u.text)}</span>`
        ).join('');
        // duplicated so the ticker loops seamlessly (translateX(-50%))
        announcementsEl.innerHTML = pills + pills;
    } catch (e) {
        const pill = `<span class="announce-pill"><span class="dot"></span>Welcome to BrightPath</span>`;
        announcementsEl.innerHTML = pill + pill;
    }
}

async function fetchLastUpdated() {
    try {
        const res = await fetch(`${API_BASE_URL}/last-updated`);
        const data = await res.json();
        const days = daysUntil(data.lastUpdated) * -1; // days ago
        let when;
        if (days <= 0) when = 'today';
        else if (days === 1) when = 'yesterday';
        else when = `${days} days ago`;
        lastUpdatedText.textContent = `Exam data last updated: ${when}`;
    } catch (e) {
        lastUpdatedText.textContent = 'Exam data freshness unavailable';
    }
}

// ----------------------------- fetch ------------------------------------
async function fetchExams() {
    try {
        const res = await fetch(`${API_BASE_URL}/exams`);
        allExams = await res.json();
        filterAndRender();
        renderAnalytics();
    } catch (err) {
        console.error('Error fetching exams:', err);
        examsGrid.innerHTML = `<div class="empty-state"><h3>Couldn't load exams</h3><p>Please make sure the server is running and try again.</p></div>`;
    }
}

// --------------------------- listeners ----------------------------------
let searchTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(filterAndRender, 200); // debounced
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        filterAndRender(); // cards re-render with staggered fade-in
    });
});

// Init
fetchExams();
fetchUpdates();
fetchLastUpdated();
