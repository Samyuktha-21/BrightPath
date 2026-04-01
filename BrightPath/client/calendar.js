const API_BASE_URL = 'http://localhost:5000/api';

let allExams = [];
let currentDate = new Date();

const monthYearDisplay = document.getElementById('month-year-display');
const calendarDays = document.getElementById('calendar-days');

const modal = document.getElementById('exam-modal');
const modalDate = document.getElementById('modal-date');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');

closeModal.onclick = () => modal.style.display = 'none';

async function fetchExams() {
    try {
        const response = await fetch(`${API_BASE_URL}/exams`);
        allExams = await response.json();
        renderCalendar();
    } catch (error) {
        console.error('Error fetching exams:', error);
    }
}

function renderCalendar() {
    calendarDays.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    monthYearDisplay.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // Fill empty slots for first week
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDiv);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerHTML = `<div class="calendar-date">${i}</div>`;
        
        // Find exams for this date
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        const examsToday = allExams.filter(e => {
            const eDate = new Date(e.examDate);
            return eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === i;
        });
        
        examsToday.forEach(exam => {
            const ev = document.createElement('div');
            ev.className = 'calendar-event';
            ev.textContent = exam.name;
            dayDiv.appendChild(ev);
        });
        
        dayDiv.onclick = () => showExamsModal(dateString, examsToday);
        
        calendarDays.appendChild(dayDiv);
    }
}

function showExamsModal(dateString, exams) {
    if (exams.length === 0) return;
    
    modalDate.textContent = new Date(dateString).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    modalContent.innerHTML = exams.map(exam => `
        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
            <div style="font-size: 0.8rem; color: var(--accent-color); margin-bottom: 0.2rem;">${exam.category}</div>
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem;">${exam.name}</div>
            <p style="font-size: 0.9rem;">${exam.description || 'No description available'}</p>
            <a href="${exam.websiteUrl}" target="_blank" style="color: white; font-size: 0.8rem; text-decoration: underline; margin-top: 0.5rem; display: inline-block;">Official Website</a>
        </div>
    `).join('');
    
    modal.style.display = 'flex';
}

document.getElementById('prev-month').onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
};

document.getElementById('next-month').onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
};

// Init
fetchExams();
