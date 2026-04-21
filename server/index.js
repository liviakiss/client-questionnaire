// Express + Resend backend for both intake and brief forms
// Deploy on Render, set environment variables: RESEND_API_KEY, TO_EMAIL, FROM_EMAIL

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const app = express();
const PORT = process.env.PORT || 3000;

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = process.env.TO_EMAIL || 'alivedesignstudio00@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(PUBLIC_DIR));

// Root = intake form (public)
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// /brief = brief form (private)
app.get('/brief', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'brief.html'));
});

// Email templates
function intakeEmailHTML(d) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fafafa;">
      <h2 style="font-family: Georgia, serif; color: #5ba8a0; margin: 0 0 8px;">New Intake — ${escapeHtml(d.name)}</h2>
      <p style="color: #888; margin: 0 0 24px; font-size: 14px;">${escapeHtml(d.email)}</p>
      <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
        <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #5ba8a0;">Project</h3>
        <p style="margin: 0 0 20px; color: #222;">${escapeHtml(d.project)}</p>
        <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #5ba8a0;">Goal</h3>
        <p style="margin: 0 0 20px; color: #222;">${escapeHtml(d.goal)}</p>
        <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #5ba8a0;">Timeline</h3>
        <p style="margin: 0 0 20px; color: #222;">${escapeHtml(d.timeline)}</p>
        <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #5ba8a0;">Budget</h3>
        <p style="margin: 0; color: #222;">${escapeHtml(d.currency || 'EUR')} ${escapeHtml(d.budget)}</p>
      </div>
      <p style="color: #aaa; font-size: 12px; margin-top: 20px;">Sent from alivedesignstudio.net · Intake Form</p>
    </div>
  `;
}

function briefEmailHTML(d) {
  const field = (label, value) => value ? `
    <h3 style="margin: 20px 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #5ba8a0;">${label}</h3>
    <p style="margin: 0; color: #222; white-space: pre-wrap;">${escapeHtml(value)}</p>
  ` : '';

  return `
    <div style="font-family: system-ui, sans-serif; max-width: 680px; margin: 0 auto; padding: 24px; background: #fafafa;">
      <h2 style="font-family: Georgia, serif; color: #5ba8a0; margin: 0 0 8px;">New Project Brief — ${escapeHtml(d.companyName)}</h2>
      <p style="color: #888; margin: 0 0 24px; font-size: 14px;">${escapeHtml(d.email)}</p>
      <div style="background: #fff; padding: 24px; border-radius: 8px; border: 1px solid #eee;">
        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">01 · About the project</h2>
        ${field('Company', d.companyName)}
        ${field('Core idea', d.coreIdea)}
        ${field('Problem', d.problem)}
        ${field('Audience', d.audience)}
        ${field('Stage', d.stage)}

        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">02 · Design direction</h2>
        ${field('Visual style', d.visualStyle)}
        ${field('Personality', d.personality)}
        ${field('Competitors & inspiration', d.competitors)}
        ${field('Visual inspiration', d.visualInspiration)}

        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">03 · Scope & features</h2>
        ${field('Must-have', d.mustHave)}
        ${field('Nice-to-have', d.niceToHave)}
        ${field('Development', d.development)}
        ${field('Tech stack', d.techStack)}

        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">04 · Success & outcomes</h2>
        ${field('Success metrics', d.successMetrics)}
        ${field('Timeline', d.timeline)}

        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">05 · Practical details</h2>
        ${field('Rights', d.rights)}
        ${field('Budget', `${d.currency || 'EUR'} ${d.budget}`)}
        ${field('Payment', d.payment)}

        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">06 · Anything else</h2>
        ${field('Notes', d.other)}
      </div>
      <p style="color: #aaa; font-size: 12px; margin-top: 20px;">Sent from alivedesignstudio.net · Project Brief</p>
    </div>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.post('/api/submit', async (req, res) => {
  try {
    const data = req.body;
    const isIntake = data.formType === 'intake';

    const subject = isIntake
      ? `🌱 New Intake — ${data.name || 'Unknown'}`
      : `📋 New Brief — ${data.companyName || 'Unknown'}`;

    const html = isIntake ? intakeEmailHTML(data) : briefEmailHTML(data);

    await resend.emails.send({
      from: `ALIVE Design Studio <${FROM_EMAIL}>`,
      to: TO_EMAIL,
      reply_to: data.email,
      subject,
      html,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Send failed:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});