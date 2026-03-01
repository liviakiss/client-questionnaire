document.addEventListener('DOMContentLoaded', () => {

  // ── Show/hide other currency ──
  const currencyRadios = document.querySelectorAll('input[name="currency"]');
  const otherCurrencyField = document.getElementById('other-currency');
  const otherCurrencyLabel = otherCurrencyField.previousElementSibling;

  otherCurrencyField.style.display = 'none';
  otherCurrencyLabel.style.display = 'none';

  currencyRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'other' && radio.checked) {
        otherCurrencyField.style.display = 'block';
        otherCurrencyLabel.style.display = 'block';
      } else {
        otherCurrencyField.style.display = 'none';
        otherCurrencyLabel.style.display = 'none';
      }
    });
  });

  // ── Form submission ──
  const form = document.getElementById('questionnaireForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const loadingScreen = document.getElementById('loadingScreen');
      loadingScreen.style.display = 'flex';

      const response = await fetch('https://client-questionnaire.onrender.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      loadingScreen.style.display = 'none';

      const result = await response.json();

      if (result.success) {
        document.querySelector('h1').style.display = 'none';
        document.querySelectorAll('.subtitle').forEach(el => el.style.display = 'none');
        form.style.display = 'none';
        document.getElementById('postSubmitView').style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      document.getElementById('loadingScreen').style.display = 'none';
      console.error('Submission error:', error);
      alert('Could not connect to the server. Please try again.');
    }
  });

});