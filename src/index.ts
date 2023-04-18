import './index.scss';
import {SetsForCardsResponseData} from '../shared/sharedTypes';
import {fetchSetsForCards} from './api';

type SetOfCards = {code: string; displayName: string; releaseDate: Date; cards: {[key2: string]: true}};

function sortingFunction(a: SetOfCards, b: SetOfCards): -1 | 0 | 1 {
  const aLength = Object.keys(a.cards).length;
  const bLength = Object.keys(b.cards).length;
  if (aLength > bLength) {
    return -1;
  } else if (aLength < bLength) {
    return 1;
  }
  // return 0;
  return a.releaseDate < b.releaseDate ? 1 : -1;
  // return 0;
}

function populateRollUp(data: SetsForCardsResponseData[]): void {
  const rollUp = document.getElementById('card-search-roll-up');
  if (!rollUp) {
    return;
  }

  const sets: {[key: string]: SetOfCards} = {};
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
    <div class="set-list">
      ${Object.values(sets)
        .sort(sortingFunction)
        .map(
          (set) => `
        <details open>
          <summary>${set.code} - ${set.displayName}</summary>
          <ul class="card-list">${Object.keys(set.cards)
            .sort((a, b) => (a < b ? -1 : 1))
            .map((card) => `<li>${card}</li>`)
            .join('')}</ul>
        </details>
        `,
        )
        .join('')}
    </div>
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
