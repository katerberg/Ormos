import './index.scss';
import {SetsForCardsResponseData} from '../shared/sharedTypes';
import {fetchSetsForCards} from './api';

function populateRollUp(data: SetsForCardsResponseData[]): void {
  const rollUp = document.getElementById('card-search-roll-up');
  if (!rollUp) {
    return;
  }

  const sets: {[key: string]: {code: string; displayName: string; releaseDate: Date; cards: {[key2: string]: true}}} =
    {};
  data.forEach((card) => {
    card.sets.forEach((set) => {
      const code = set.parent || set.code;
      if (!sets[code]) {
        sets[code] = {
          code,
          displayName: set.name,
          releaseDate: set.releaseDate,
          cards: {},
        };
      }
      sets[code].cards[card.name] = true;
    });
  });
  rollUp.innerHTML = `
    <ul class="set-list">
      ${Object.values(sets)
        .sort((a, b) => (a.releaseDate > b.releaseDate ? -1 : 1))
        .map(
          (set) => `
        <li>${set.code} - ${set.displayName}</li>
        <ul class="card-list">${Object.keys(set.cards)
          .map((card) => `<li>${card}</li>`)
          .join('')}</ul>
        `,
        )
        .join('')}
    </ul>
    `;
}

function handleSetsForCardsResponse(result: {data: SetsForCardsResponseData[]; error: string | null}): void {
  const cardTextArea = document.getElementById('card-input');
  if (cardTextArea) {
    cardTextArea.classList.remove('collapsed');
  }
  const validationMessage = document.getElementById('validation-message');
  if (result.error && validationMessage) {
    validationMessage.classList.add('error');
    validationMessage.textContent = result.error;
    return;
  }
  if (cardTextArea) {
    cardTextArea.classList.add('collapsed');
  }
  populateRollUp(result.data);
}

async function submitListener(e: Event): Promise<void> {
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

    const response = await fetchSetsForCards(cardInput.value);
    handleSetsForCardsResponse(response);
  }
}

window.addEventListener('load', () => {
  const cardSearchForm = document.getElementById('card-search-form');

  cardSearchForm?.addEventListener('submit', submitListener);
});
