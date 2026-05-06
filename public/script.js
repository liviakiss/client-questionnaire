const form = document.getElementById('intakeForm');
const confirmation = document.getElementById('confirmation');
const submitBtn = form.querySelector('.submit-btn');

// Autosave progress
const STORAGE_KEY = 'alive-intake-draft';

function saveDraft() {
  const data = {};
  new FormData(form).forEach((value, key) => { data[key] = value; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadDraft() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    Object.entries(data).forEach(([key, value]) => {
      const field = form.elements[key];
      if (!field) return;
      if (field.length) {
        // radio group
        Array.from(field).forEach(el => {
          if (el.value === value) el.checked = true;
        });
      } else {
        field.value = value;
      }
    });
  } catch (e) {}
}

loadDraft();
form.addEventListener('input', saveDraft);
form.addEventListener('change', saveDraft);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Basic validation
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Sending...';

  const formData = new FormData(form);
  const data = { formType: 'intake' };
  formData.forEach((value, key) => { data[key] = value; });
  data.lang = document.documentElement.lang || 'en';

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Submission failed');

    localStorage.removeItem(STORAGE_KEY);
    form.classList.add('hidden');
    confirmation.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Send';
    alert('Something went wrong. Please try again or email directly.');
    console.error(err);
  }
});