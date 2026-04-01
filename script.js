const quotes = [
    "Opportunities don't happen. You create them.",
    "Your future is created by what you do today.",
    "Success begins with the decision to try.",
    "Small steps today lead to big achievements tomorrow.",
    "Don’t miss chances — prepare for them.",
    "Dream big. Start small. Act now.",
    "Every exam is a new opportunity in disguise.",
    "Hard work beats talent when talent doesn’t work hard.",
    "Your journey matters more than your fear.",
    "One decision can change your entire future.",
    "Believe in yourself — the rest will follow.",
    "The best time to start was yesterday. The next best time is now.",
    "Your effort today is your success tomorrow."
];


document.getElementById("quote").innerText =
    quotes[Math.floor(Math.random() * quotes.length)];

function enterDashboard() {
    document.getElementById("welcome").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
}

function showLoginAlert() {
    alert("Login is optional.\nRequired only for reminders and updates (future feature).");
}

function filterCategory(category) {
    const exams = document.querySelectorAll(".exam-card");

    exams.forEach(exam => {
        if (category === "all" || exam.dataset.category === category) {
            exam.style.display = "inline-block";
        } else {
            exam.style.display = "none";
        }
    });
}