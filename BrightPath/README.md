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
| **Frontend** | HTML, CSS (Inter font), Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (with Mongoose ODM) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Scheduled Jobs** | node-cron (daily notifications + weekly scrape) |
| **Web Scraping** | axios + cheerio |
| **Environment Config** | dotenv |
| **Hosting** | Render (free tier) |

---

## 🔄 Automated Data Refresh (Scraper)

`server/scraper/examScraper.js` is a best-effort change detector for the official
sites that update most often (NTA — NEET/JEE, SSC, UPSC). It uses **axios + cheerio**
(no headless browser, to respect Render's free-tier memory) and is fully defensive:

- Falls back to the seeded data in `server/data/sampleExams.js` if any site fails — it never crashes.
- Skips PDFs gracefully (most official notices are PDFs) and logs a warning.
- Hashes each site's notice board and, on change, bumps `lastUpdated` on the matching exams.
- Runs automatically **every Sunday at 00:00** via node-cron.
- Manual trigger: **`GET /api/admin/scrape`** (protect with the `ADMIN_KEY` env var → `?key=YOUR_KEY`).

> ⚠️ Reality check: NTA and UPSC are JavaScript-rendered and publish dates inside
> PDFs behind anti-bot protection, so those targets usually fall back to seed data.
> SSC's HTML calendar is the most reliably parseable. The value here is the
> pipeline, logging and change-detection — the per-site selectors need occasional
> maintenance when the sites change.

Every exam carries `isVerified` (date confirmed against an official source) and
`isTentative` (expected window, not yet officially announced) flags. Year-round exams
(GRE/GMAT/TOEFL/IELTS) use `isRolling`. The dashboard surfaces an **"Unverified date"**
badge so nothing is presented as confirmed when it isn't.

---

## ⏰ Keeping the Server Awake (UptimeRobot)

Render's free tier sleeps a service after ~15 minutes of inactivity, which causes a
~50-second cold start and means the Sunday cron scraper may not fire. A dedicated
health endpoint keeps it warm:

```
GET /health  →  { "status": "ok", "uptime": <seconds>, "timestamp": <ISO> }
```

**To keep this server always awake on Render free tier, set up a free UptimeRobot
monitor at [uptimerobot.com](https://uptimerobot.com) pointing to
`https://brightpath-waf7.onrender.com/health` with a 5-minute interval.**

This ensures the cron scraper fires reliably every Sunday, there's no cold start for
real users, and you get email alerts if the server goes down.

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
| `PUT` | `/api/auth/bookmarks` | Save a user's bookmarked exams |
| `GET` | `/api/exams` | Fetch all exams (optional `?category=`) |
| `GET` | `/api/updates` | Fetch latest updates/announcements |
| `GET` | `/api/comments` | Fetch community comments (optional `?category=`) |
| `POST` | `/api/comments` | Post a comment |
| `GET` | `/api/last-updated` | When exam data was last refreshed |
| `GET` | `/api/admin/scrape` | Manually trigger the scraper (`?key=ADMIN_KEY`) |
| `GET` | `/health` | Health check for UptimeRobot / keep-alive |

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

## 📄 License

This project is licensed under the [ISC License](LICENSE).
