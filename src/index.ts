import './index.scss';
import {SetsForCardsResponseData} from '../shared/sharedTypes';
import {fetchSetsForCards} from './api';
import {SetOfCards, SetsForCardsResponse} from './sharedTypes';
import {getLines, hashCode, trimLine} from './textUtils';

function sortingFunction(a: SetOfCards, b: SetOfCards): -1 | 0 | 1 {
  const aLength = Object.keys(a.cards).length;
  const bLength = Object.keys(b.cards).length;
  if (aLength > bLength) {
    return -1;
  } else if (aLength < bLength) {
    return 1;
  }
  return a.releaseDate < b.releaseDate ? 1 : -1;
}

function populatePulledCards(): void {
  const noFiltersAppliedSection = document.getElementById('no-filters-applied');
  const pulledCards = document.getElementById('pulled-cards');
  const pulledCardsSection = document.getElementById('pulled-cards-section');
  if (!pulledCards || !pulledCardsSection || !noFiltersAppliedSection) {
    return;
  }
  if (globalThis.pulledCards.length) {
    pulledCardsSection.classList.remove('hidden');
    noFiltersAppliedSection.classList.add('hidden');
  } else {
    pulledCardsSection.classList.add('hidden');
    noFiltersAppliedSection.classList.remove('hidden');
  }
  pulledCards.innerHTML = globalThis.pulledCards.map((card) => `<div>${card}</div>`).join('');
}

function populateCheckboxes(cardName: string, checked: boolean): void {
  const inputs = document.getElementsByTagName('input');
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].getAttribute('data-card-name') === cardName) {
      inputs[i].checked = checked;
    }
  }
}

function rollUpClickListener(e: Event): void {
  const target = e.target as HTMLInputElement;
  if (target?.labels) {
    const text = target.labels[0] ? target.labels[0].textContent : '';
    if (!text) {
      return;
    }
    const isPulled = !globalThis.pulledCards.includes(text);
    if (isPulled) {
      globalThis.pulledCards.push(text);
    } else {
      globalThis.pulledCards = globalThis.pulledCards.filter((pc) => pc !== text);
    }
    populatePulledCards();
    populateCheckboxes(text, isPulled);
  }
}

function populateRollUp(data: SetsForCardsResponseData[]): void {
  const rollUp = document.getElementById('card-search-roll-up');
  if (!rollUp) {
    return;
  }

  const sets: {[key: string]: SetOfCards} = {};
  data
    .filter((card) => !globalThis.pulledCards.includes(card.name))
    .forEach((card) => {
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
          <div class="card-list">${Object.keys(set.cards)
            .sort((a, b) => (a < b ? -1 : 1))
            .map((card) => {
              const inputId = `${hashCode(card + set.displayName)}`;
              return `<label for="${inputId}" class="list-card"><input class="card-checkbox" type="checkbox" id="${inputId}" name="${inputId}" data-card-name="${card}" />${card}</label>`;
            })
            .join('')}</div>
        </details>
        `,
        )
        .join('')}
    </div>
    `;

  const inputs = document.getElementsByTagName('input');
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].className.includes('card-checkbox')) {
      inputs[i].addEventListener('click', rollUpClickListener);
    }
  }
}

function handleSetsForCardsResponse(result: SetsForCardsResponse): void {
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

  const filtersSection = document.getElementById('filters');
  filtersSection?.classList.remove('hidden');

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
    const cleanedInput = getLines(cardInput.value).map(trimLine).join('\n');
    cardInput.value = cleanedInput;

    const loader = document.getElementById('loader-search') as HTMLElement;
    if (loader) {
      loader.classList.remove('hidden');
    }

    const response = await fetchSetsForCards(cleanedInput);
    if (loader) {
      loader.classList.add('hidden');
    }
    globalThis.latestSetsForCardsResponse = response;
    handleSetsForCardsResponse(response);
  }
}

function clearPulledCardsListener(e: Event): void {
  e.preventDefault();
  globalThis.pulledCards = [];
  populatePulledCards();
  handleSetsForCardsResponse(globalThis.latestSetsForCardsResponse);
}

window.addEventListener('load', () => {
  globalThis.pulledCards = [];
  const cardSearchForm = document.getElementById('card-search-form');
  const clearPulledCardsButton = document.getElementById('clear-pulled-cards');

  cardSearchForm?.addEventListener('submit', submitListener);
  clearPulledCardsButton?.addEventListener('click', clearPulledCardsListener);
});
