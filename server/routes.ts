/* eslint-disable no-console */
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./data/AllPrintings.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('connected to db');
});

export type MtgSet = {
  code: string;
  name: string;
  parent: string | null;
};

export type SetsForCardsResponseData = {
  name: string;
  sets: MtgSet[];
}[];

export function addRoutes(app: express.Express): void {
  const jsonParser = bodyParser.json();

  app.post('/api/setsForCards', jsonParser, async (req, res) => {
    const requestCards = (req.body as string[]).map((c) => c?.toLowerCase());
    if (requestCards.length > 500) {
      return res.status(400).send({data: null, error: 'Too many cards'});
    }

    const cards: SetsForCardsResponseData = [];
    const errorCards: string[] = [];
    const requestPromises: Promise<unknown>[] = [];
    requestCards.forEach((requestCard) => {
      const promise = new Promise((resolvePromise): void => {
        db.all(
          `
          SELECT
            cards.name,
            sets.code,
            sets.parentCode,
            sets.name as setName
          FROM
            cards
            JOIN SETS ON cards.setCode = sets.code
          WHERE
            cards.name like ?
            AND sets.isOnlineOnly = 0
           `,
          [requestCard],
          (err, result: {parentCode: string | null; code: string; setName: string}[]) => {
            if (err) {
              console.error(err.message);
              return res
                .status(500)
                .send({data: null, error: `Unknown error. Contact creator about "${requestCard}".`});
            }
            if (result.length === 0) {
              errorCards.push(requestCard);
            }
            console.log(result);
            cards.push({
              name: requestCard,
              sets: result.map((r) => ({
                code: r.code,
                parent: r.parentCode,
                name: r.setName,
              })),
            });

            resolvePromise(null);
          },
        );
      });
      requestPromises.push(promise);
    });
    await Promise.all(requestPromises);
    if (errorCards.length) {
      const errorString = `Cards not found: ${errorCards.reduce((a, c) => `"${a}","${c}"`)}`;
      return res.status(400).send({data: null, error: errorString});
    }

    res.send({data: cards, error: null});
  });
}
