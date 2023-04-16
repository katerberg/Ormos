import './index.scss';
import {fetchSetsForCards} from './api';

function submitListener(e: Event): void {
  e.preventDefault();

  const cardInput = document.getElementById('card-input') as HTMLInputElement;
  const validationMessage = document.getElementById('validation-message');
  if (!cardInput || cardInput.value === '') {
    if (validationMessage) {
      validationMessage.classList.add('error');
      validationMessage.textContent = 'No card list found';
    }
  } else {
    if (validationMessage) {
      validationMessage.classList.remove('error');
      validationMessage.textContent = '';
    }

    fetchSetsForCards(cardInput.value)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.warn(err);
      });
    // perform operation with form input
    //   console.log(`This form has a username of ${username.value} and password of ${password.value}`);

    //   username.value = '';
    //   password.value = '';
  }
}

window.addEventListener('load', () => {
  const cardSearchForm = document.getElementById('card-search-form');

  cardSearchForm?.addEventListener('submit', submitListener);
});
