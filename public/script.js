console.log('script loaded');
console.log(document.getElementById('questionnaireForm'));

document.addEventListener('DOMContentLoaded', () => {

  const currencyRadios = document.querySelectorAll('input[name="currency"]');
  const otherCurrencyField = document.getElementById('other-currency');
  const otherCurrencyLabel = otherCurrencyField.previousElementSibling;

  // Hide by default
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

});

// ── Form submission ──
  const form = document.getElementById('questionnaireForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop the page from refreshing

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log('Form data:', data); // we'll check this first before sending to server
  });