const API_BASE_URL = 'http://localhost:5000/api';

const commentsFeed = document.getElementById('comments-feed');
const submitBtn = document.getElementById('submit-post');
const filterSelect = document.getElementById('filter-category');
const authWarning = document.getElementById('auth-warning');

// Check logged in user
const userStr = localStorage.getItem('user');
let currentUser = null;
if (userStr) {
    currentUser = JSON.parse(userStr);
} else {
    document.getElementById('comment-text').disabled = true;
    document.getElementById('comment-category').disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
    authWarning.style.display = 'block';
}

function timeSince(dateObj) {
    const seconds = Math.floor((new Date() - new Date(dateObj)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

async function fetchComments() {
    const category = filterSelect.value;
    try {
        const response = await fetch(`${API_BASE_URL}/comments?category=${encodeURIComponent(category)}`);
        const comments = await response.json();
        renderComments(comments);
    } catch(err) {
        console.error(err);
        commentsFeed.innerHTML = `<div style="text-align: center; color: #ffcccc;">Error loading discussions. Make sure the server is running.</div>`;
    }
}

function renderComments(comments) {
    commentsFeed.innerHTML = '';
    
    if(comments.length === 0) {
        commentsFeed.innerHTML = `<div style="text-align: center; padding: 2rem; opacity: 0.7;">No discussions found for this category yet. Be the first to start one!</div>`;
        return;
    }

    comments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-card';
        
        let displayCategory = comment.category === 'All Exams' ? 'General' : comment.category;

        div.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.userName}</span>
                <span class="comment-category" onclick="document.getElementById('filter-category').value='${comment.category}'; fetchComments();">${displayCategory}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-time">${timeSince(comment.createdAt)}</div>
        `;
        commentsFeed.appendChild(div);
    });
}

// Submitting a new post
submitBtn.addEventListener('click', async () => {
    if(!currentUser) return;
    
    const textNode = document.getElementById('comment-text');
    const catNode = document.getElementById('comment-category');
    const text = textNode.value.trim();
    const category = catNode.value;

    if(!text || !category) {
        alert('Please enter a message and select a category before posting.');
        return;
    }

    submitBtn.textContent = 'Posting...';
    try {
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                userName: currentUser.name,
                text,
                category
            })
        });

        if(response.ok) {
            textNode.value = '';
            catNode.selectedIndex = 0;
            
            // Auto-switch filter to the category they just posted in so they see their post immediately
            if(filterSelect.value !== 'All Exams' && filterSelect.value !== category && category !== 'All Exams') {
                filterSelect.value = category;
            }
            fetchComments();
        } else {
            alert('Failed to post discussion.');
        }
    } catch(err) {
        console.error(err);
        alert('Error connecting to server.');
    } finally {
        submitBtn.textContent = 'Post Discussion';
    }
});

filterSelect.addEventListener('change', fetchComments);

// Initial Load
fetchComments();
