/* eslint-disable no-console */
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as sqlite3 from 'sqlite3';
import {SetsForCardsResponseData} from '../shared/sharedTypes';
const db = new sqlite3.Database('./data/AllPrintings.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('connected to db');
});

function trimPercentages(dirtyCard: string): string {
  return dirtyCard.replace(/^%/, '').replace(/%$/, '');
}

function matchesDatabaseResult(databaseName: string, cardName: string): boolean {
  const strippedCardName = trimPercentages(cardName.toLowerCase());
  const lowerDatabase = databaseName.toLowerCase();
  return (
    strippedCardName === lowerDatabase ||
    strippedCardName === lowerDatabase.replace(/^.*\/\/ /, '') ||
    strippedCardName === lowerDatabase.replace(/ \/\/.*$/, '')
  );
}

async function getCardInfo(cardName: string): Promise<SetsForCardsResponseData> {
  const promise = new Promise<SetsForCardsResponseData>((resolvePromise, rejectPromise): void => {
    db.all(
      `
          SELECT
            cards.name,
            sets.code,
            sets.parentCode,
            sets.name as setName,
            sets.releaseDate
          FROM
            cards
            JOIN SETS ON cards.setCode = sets.code
          WHERE
            cards.name like ?
            AND sets.isOnlineOnly = 0
          GROUP BY code, parentCode
           `,
      [cardName],
      (err, result: {name: string; parentCode: string | null; code: string; setName: string; releaseDate: Date}[]) => {
        if (err) {
          console.error(err.message);
          rejectPromise(`Unknown error. Contact creator about "${cardName}".`);
        }
        const sets = result
          .filter((r) => matchesDatabaseResult(r.name, cardName))
          .map((r) => ({
            cardName: r.name,
            code: r.code,
            parent: r.parentCode,
            name: r.setName,
            releaseDate: r.releaseDate,
          }));
        if (sets.length === 0) {
          return resolvePromise({
            name: cardName,
            sets: [],
          });
        }

        resolvePromise({
          name: sets[0].cardName,
          sets,
        });
      },
    );
  });
  return promise;
}

async function getCards(requestCards: string[]): Promise<{cards: SetsForCardsResponseData[]; errorCards: string[]}> {
  const cards: SetsForCardsResponseData[] = [];
  const errorCards: string[] = [];
  const requestPromises: Promise<unknown>[] = [];
  requestCards.forEach((requestCard) => {
    requestPromises.push(getCardInfo(requestCard));
  });
  const promiseResults = await Promise.all(requestPromises);
  (promiseResults as SetsForCardsResponseData[]).forEach((result) => {
    if (result.sets.length !== 0) {
      cards.push(result);
    } else {
      errorCards.push(result.name);
    }
  });

  if (requestCards.length && !requestCards[0].startsWith('%')) {
    const fuzzyResults = await getCards(errorCards.map((c) => `%${c}%`));
    return {
      cards: [...cards, ...fuzzyResults.cards],
      errorCards: fuzzyResults.errorCards.map((ec) => trimPercentages(ec)),
    };
  }

  return {cards, errorCards};
}

export function addRoutes(app: express.Express): void {
  const jsonParser = bodyParser.json();

  app.post('/api/setsForCards', jsonParser, async (req, res) => {
    const requestCards = (req.body as string[]).map((c) => c?.toLowerCase());
    if (requestCards.length > 500) {
      return res.status(400).send({data: null, error: 'Too many cards'});
    }

    let cards, errorCards;
    try {
      ({cards, errorCards} = await getCards(requestCards));
    } catch (e) {
      console.error(`Unknown issue in promise for cards: ${requestCards}:`, e);
      return res.status(500).send({data: null, error: 'Unknown error. Contact creator.'});
    }

    if (errorCards.length) {
      const errorString = `Cards not found: “${errorCards.reduce((a, c) => `${a}”,“${c}`)}”`;
      return res.status(400).send({data: null, error: errorString});
    }

    res.send({data: cards, error: null});
  });
}
