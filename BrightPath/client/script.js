// Landing page — rotating motivational quotes with a smooth fade.
const quotes = [
    "Success involves a lot of preparation.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Don't watch the clock; do what it does. Keep going.",
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it is done.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Push yourself, because no one else is going to do it for you.",
    "Dream big. Start small. Act now.",
    "The expert in anything was once a beginner."
];

const quoteBox = document.getElementById('quote-box');
const quoteEl = document.getElementById('motivational-quote');

// Start on a random quote so it feels fresh on every visit.
let index = Math.floor(Math.random() * quotes.length);

function showQuote() {
    if (quoteEl) quoteEl.textContent = quotes[index];
}

showQuote();

// Rotate every 4.5s with a fade-out / fade-in transition.
if (quoteBox && quoteEl) {
    setInterval(() => {
        quoteBox.classList.add('fade');          // fade out
        setTimeout(() => {
            index = (index + 1) % quotes.length;  // next quote
            showQuote();
            quoteBox.classList.remove('fade');    // fade back in
        }, 400);
    }, 4500);
}
