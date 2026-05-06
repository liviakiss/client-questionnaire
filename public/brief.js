const form = document.getElementById('briefForm');
const confirmation = document.getElementById('confirmation');
const submitBtn = form.querySelector('.submit-btn');

const STORAGE_KEY = 'alive-brief-draft';

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
      if (field.length && field[0] && field[0].type === 'radio') {
        Array.from(field).forEach(el => {
          if (el.value === value) el.checked = true;
        });
      } else if (field.tagName) {
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

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Submitting...';

  const formData = new FormData(form);
  const data = { formType: 'brief' };
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
    submitBtn.querySelector('span').textContent = 'Submit Brief';
    alert('Something went wrong. Please try again or email directly.');
    console.error(err);
  }
});