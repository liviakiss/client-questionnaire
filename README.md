# Client Questionnaire Form

A full-stack client onboarding form built for ALIVE Design Studio. Clients fill out a detailed project brief, and the answers are sent directly to the studio's email upon submission.

Live: [client-questionnaire.onrender.com](https://client-questionnaire.onrender.com)

---

## What it does

- Collects detailed project information from potential clients (goals, budget, timeline, visual style, etc.)
- Sends a formatted email with all answers upon submission
- Shows a confirmation screen after successful submission
- Hides/shows the "other currency" field dynamically based on user selection

---

## Tech stack

**Frontend**
- HTML5, CSS3, Vanilla JavaScript

**Backend**
- Node.js
- Express
- Resend (email delivery)

**Deployment**
- Render (backend + static files)
- GitHub (version control)

---

## Run locally

1. Clone the repo
```bash
   git clone https://github.com/liviakiss/client-questionnaire.git
   cd client-questionnaire
```

2. Install dependencies
```bash
   npm install
```

3. Create a `.env` file in the root:
```
   EMAIL_USER=your@gmail.com
   RESEND_API_KEY=your_resend_api_key
   PORT=3000
```

4. Start the server
```bash
   node server/index.js
```

5. Open `http://localhost:3000` in your browser

---

## Project structure
```
client-questionnaire/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/
│   └── index.js
├── .env (not committed)
├── .gitignore
└── README.md
```