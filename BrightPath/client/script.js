const quotes = [
    "Success involves a lot of preparation.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Don't watch the clock; do what it does. Keep going.",
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it is done.",
    "Your limitation—it's only your imagination."
];

const quoteElement = document.getElementById('motivational-quote');
const getStartedBtn = document.getElementById('get-started-btn');

function setRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.textContent = `"${quotes[randomIndex]}"`;
}

// Set quote on load
setRandomQuote();

// Navigate to dashboard
getStartedBtn.addEventListener('click', () => {
    // Add a simple fade-out effect if desired, or just navigate
    window.location.href = 'dashboard.html';
});
