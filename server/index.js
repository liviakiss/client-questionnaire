require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── Resend client ──
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Submit route ──
app.post('/submit', async (req, res) => {
  const data = req.body;

  const emailBody = `
New client questionnaire submission:

Name: ${data.name}
Email: ${data.email}
Company: ${data.company || 'Not provided'}

THE CORE IDEA:
${data['core-idea']}

THE PROBLEM:
${data.problem}

TARGET AUDIENCE:
${data['target-audience']}

VISUAL STYLE:
${data['visual-style']}

COMPETITORS:
${data.competitors}

CORE VALUES:
${data['core-values']}

MUST-HAVE FEATURES:
${data['must-have-features']}

DEVELOPMENT:
${data.development}

SUCCESS METRICS:
${data['success-metrics']}

FILE RIGHTS:
${data['rights-ownership']}

BUDGET:
${data.budget} ${data.currency}

PAYMENT METHOD:
${data['payment-method']}
  `;

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.EMAIL_USER,
      subject: `New project inquiry from ${data.name}`,
      text: emailBody,
    });

    res.status(200).json({ success: true, message: 'Submission received!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Start server ──
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});