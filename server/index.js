// Express + Resend backend for both intake and brief forms (EN + HU)

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

// English routes
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/brief', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'brief.html')));

// Hungarian routes
app.get('/hu', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index-hu.html')));
app.get('/hu/brief', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'brief-hu.html')));

// Email templates
function intakeEmailHTML(d, lang) {
  const isHU = lang === 'hu';
  const labels = isHU
    ? { project: 'Projekt', goal: 'Cél', timeline: 'Időkeret', budget: 'Költségvetés' }
    : { project: 'Project', goal: 'Goal', timeline: 'Timeline', budget: 'Budget' };
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fafafa;">
      <h2 style="font-family: Georgia, serif; color: #5ba8a0; margin: 0 0 8px;">${isHU ? 'Új érdeklődés' : 'New Intake'} — ${escapeHtml(d.name)}</h2>
      <p style="color: #888; margin: 0 0 24px; font-size: 14px;">${escapeHtml(d.email)} · <span style="color:#5ba8a0;font-weight:600;">${isHU ? 'HU' : 'EN'}</span></p>
      <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
        <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #5ba8a0;">${labels.project}</h3>
        <p style="margin: 0 0 20px; color: #222;">${escapeHtml(d.project)}</p>
        <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #5ba8a0;">${labels.goal}</h3>
        <p style="margin: 0 0 20px; color: #222;">${escapeHtml(d.goal)}</p>
        <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #5ba8a0;">${labels.timeline}</h3>
        <p style="margin: 0 0 20px; color: #222;">${escapeHtml(d.timeline)}</p>
        <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #5ba8a0;">${labels.budget}</h3>
        <p style="margin: 0; color: #222;">${escapeHtml(d.currency || 'EUR')} ${escapeHtml(d.budget)}</p>
      </div>
      <p style="color: #aaa; font-size: 12px; margin-top: 20px;">Sent from alivedesignstudio.net · Intake Form (${isHU ? 'HU' : 'EN'})</p>
    </div>
  `;
}

function briefEmailHTML(d, lang) {
  const isHU = lang === 'hu';
  const field = (label, value) => value ? `
    <h3 style="margin: 20px 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #5ba8a0;">${label}</h3>
    <p style="margin: 0; color: #222; white-space: pre-wrap;">${escapeHtml(value)}</p>
  ` : '';

  const sections = isHU
    ? ['01 · A projektről', '02 · Design irány', '03 · Hatókör és funkciók', '04 · Siker és eredmények', '05 · Gyakorlati részletek', '06 · Bármi más']
    : ['01 · About the project', '02 · Design direction', '03 · Scope & features', '04 · Success & outcomes', '05 · Practical details', '06 · Anything else'];

  const labels = isHU
    ? { company: 'Cég', coreIdea: 'Alapötlet', problem: 'Probléma', audience: 'Célközönség', stage: 'Fázis', visualStyle: 'Vizuális stílus', personality: 'Személyiség', competitors: 'Versenytársak', visualInspiration: 'Inspiráció', mustHave: 'Kötelező', niceToHave: 'Jó ha van', development: 'Fejlesztés', techStack: 'Tech stack', successMetrics: 'Sikerkritériumok', timeline: 'Időkeret', rights: 'Jogok', budget: 'Költségvetés', payment: 'Fizetés', notes: 'Jegyzetek' }
    : { company: 'Company', coreIdea: 'Core idea', problem: 'Problem', audience: 'Audience', stage: 'Stage', visualStyle: 'Visual style', personality: 'Personality', competitors: 'Competitors & inspiration', visualInspiration: 'Visual inspiration', mustHave: 'Must-have', niceToHave: 'Nice-to-have', development: 'Development', techStack: 'Tech stack', successMetrics: 'Success metrics', timeline: 'Timeline', rights: 'Rights', budget: 'Budget', payment: 'Payment', notes: 'Notes' };

  return `
    <div style="font-family: system-ui, sans-serif; max-width: 680px; margin: 0 auto; padding: 24px; background: #fafafa;">
      <h2 style="font-family: Georgia, serif; color: #5ba8a0; margin: 0 0 8px;">${isHU ? 'Új projekt brief' : 'New Project Brief'} — ${escapeHtml(d.companyName)}</h2>
      <p style="color: #888; margin: 0 0 24px; font-size: 14px;">${escapeHtml(d.email)} · <span style="color:#5ba8a0;font-weight:600;">${isHU ? 'HU' : 'EN'}</span></p>
      <div style="background: #fff; padding: 24px; border-radius: 8px; border: 1px solid #eee;">
        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">${sections[0]}</h2>
        ${field(labels.company, d.companyName)}
        ${field(labels.coreIdea, d.coreIdea)}
        ${field(labels.problem, d.problem)}
        ${field(labels.audience, d.audience)}
        ${field(labels.stage, d.stage)}

        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">${sections[1]}</h2>
        ${field(labels.visualStyle, d.visualStyle)}
        ${field(labels.personality, d.personality)}
        ${field(labels.competitors, d.competitors)}
        ${field(labels.visualInspiration, d.visualInspiration)}

        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">${sections[2]}</h2>
        ${field(labels.mustHave, d.mustHave)}
        ${field(labels.niceToHave, d.niceToHave)}
        ${field(labels.development, d.development)}
        ${field(labels.techStack, d.techStack)}

        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">${sections[3]}</h2>
        ${field(labels.successMetrics, d.successMetrics)}
        ${field(labels.timeline, d.timeline)}

        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">${sections[4]}</h2>
        ${field(labels.rights, d.rights)}
        ${field(labels.budget, `${d.currency || 'EUR'} ${d.budget}`)}
        ${field(labels.payment, d.payment)}

        <h2 style="font-family: Georgia, serif; font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">${sections[5]}</h2>
        ${field(labels.notes, d.other)}
      </div>
      <p style="color: #aaa; font-size: 12px; margin-top: 20px;">Sent from alivedesignstudio.net · Project Brief (${isHU ? 'HU' : 'EN'})</p>
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
    const lang = data.lang === 'hu' ? 'hu' : 'en';
    const langTag = lang === 'hu' ? '🇭🇺' : '🇬🇧';

    const subject = isIntake
      ? `${langTag} 🌱 New Intake — ${data.name || 'Unknown'}`
      : `${langTag} 📋 New Brief — ${data.companyName || 'Unknown'}`;

    const html = isIntake ? intakeEmailHTML(data, lang) : briefEmailHTML(data, lang);

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