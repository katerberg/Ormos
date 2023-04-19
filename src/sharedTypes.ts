import {SetsForCardsResponseData} from '../shared/sharedTypes';

export type SetOfCards = {code: string; displayName: string; releaseDate: Date; cards: {[key2: string]: true}};
export type SetsForCardsResponse = {
  data: SetsForCardsResponseData[];
  error: string | null;
};
