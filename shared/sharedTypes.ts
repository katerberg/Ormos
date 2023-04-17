export type MtgSet = {
  code: string;
  name: string;
  parent: string | null;
  releaseDate: Date;
};

export type SetsForCardsResponseData = {
  name: string;
  sets: MtgSet[];
};
