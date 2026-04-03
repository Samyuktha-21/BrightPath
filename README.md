# 🌟 BrightPath – Grab the Opportunity

> **A student-focused exam tracking platform to help you discover, manage, and never miss a competitive exam opportunity.**

---

## 📌 About the Project

**BrightPath** is a full-stack web application designed to be a one-stop solution for students preparing for competitive and entrance exams. Instead of juggling multiple websites to track exam dates, results, and registration windows, BrightPath brings everything together in a clean, easy-to-use interface.

The platform helps students:
- Stay on top of upcoming exam deadlines
- Filter exams by category and status
- Access a shared community for discussion and support
- Save personal notes for each exam

---

## ✨ Features

- 🔐 **User Login System** — Optional login for personalized experience and saved preferences
- 🔍 **Live Search** — Instantly search through exams as you type
- 🏷️ **Category-Based Filtering** — Filter exams by Medical, Engineering, Government, Law, Management, and more
- ⏳ **Countdown Timer** — Real-time countdown to each exam date
- 🟢 **Exam Status Badges** — Visual indicators for Open, Upcoming, and Closed exams
- 📅 **Calendar View** — Monthly calendar to visualize all exam dates at a glance
- 📢 **Important Updates** — Dedicated section for notifications and announcements
- 💬 **Community Feature** — Students can post questions, answers, and comments
- 📝 **Notes Feature** — Save personal notes and reminders for any exam

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (with Mongoose ODM) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Scheduled Jobs** | node-cron |
| **Environment Config** | dotenv |

---

## 📂 Project Structure

```
BrightPath/
│
├── client/                  # Frontend
│   ├── index.html           # Landing Page
│   ├── login.html           # Login / Register Page
│   ├── dashboard.html       # Main Exam Dashboard
│   ├── dashboard.js         # Dashboard Logic
│   ├── calendar.html        # Calendar View
│   ├── calendar.js          # Calendar Logic
│   ├── community.html       # Community Discussion Hub
│   ├── community.js         # Community Logic
│   ├── about.html           # About Page
│   ├── contact.html         # Contact Page
│   ├── disclaimer.html      # Disclaimer Page
│   ├── script.js            # Shared Scripts
│   └── style.css            # Global Styles
│
├── server/                  # Backend
│   ├── index.js             # Server Entry Point
│   ├── models/              # MongoDB Schemas
│   │   ├── Exam.js
│   │   ├── User.js
│   │   ├── Comment.js
│   │   └── Update.js
│   ├── routes/              # API Route Handlers
│   │   ├── auth.js
│   │   ├── exams.js
│   │   ├── comments.js
│   │   └── updates.js
│   └── cron/                # Scheduled Background Jobs
│       └── notifications.js
│
├── .env                     # Environment Variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

Follow these steps to run BrightPath locally:

### 1. Clone the Repository
```bash
git clone https://github.com/Samyuktha-21/BrightPath.git
cd BrightPath
```

### 2. Install MongoDB

**Option A – Local Installation:**  
Download and install MongoDB Community Edition from the official site:  
👉 [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

After installation, start the MongoDB service:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Option B – Cloud (MongoDB Atlas, no installation needed):**  
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account  
2. Create a free cluster and get your **connection string**  
3. Use it as your `MONGODB_URI` in the `.env` file (see Step 4)

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:
```env
PORT=5000

# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/brightpath

# OR Atlas cloud connection string:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/brightpath

JWT_SECRET=your_secret_key_here
```

### 5. Run the Backend
```bash
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

### 6. Open the Frontend

The Express server serves the frontend automatically.  
Open your browser and go to:
```
http://localhost:5000
```

> ✅ No separate frontend server needed — everything runs from one port.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a JWT token |
| `GET` | `/api/exams` | Fetch all exams (supports filters) |
| `GET` | `/api/exams/:id` | Fetch a single exam by ID |
| `POST` | `/api/exams` | Add a new exam *(auth required)* |
| `GET` | `/api/updates` | Fetch latest updates/announcements |
| `GET` | `/api/comments` | Fetch all community comments |
| `POST` | `/api/comments` | Post a comment *(auth required)* |

---

## 🔮 Future Enhancements

- 📧 **Email Reminders** — Automated email alerts before registration deadlines
- 🤖 **AI-Based Recommendations** — Suggest relevant exams based on user profile and interests
- 🔴 **Real-Time Updates** — WebSocket-powered live notifications for exam news
- 📊 **Analytics Dashboard** — Track exams you've applied for, results, and preparation progress
- 📱 **Mobile App** — Native Android/iOS version of BrightPath

---

## 🎯 Objective

The goal of BrightPath is to eliminate the hassle of tracking multiple competitive exams across different websites. By centralizing exam information, deadlines, study materials, and community support in one place, BrightPath empowers students to focus on what truly matters — **preparation and success**.

> *"Success involves a lot of preparation."*

---

## 👩‍💻 Author

**Samyuktha**  
College Project — Full Stack Web Development  

---

