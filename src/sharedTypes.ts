export type Card = {
  name: string;
};

export type SetForCards = {
  setCode: string;
  setDisplayName: string;
  cards: Card[];
};
