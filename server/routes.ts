import * as bodyParser from 'body-parser';
import * as express from 'express';
// import * as _defaultCards from '../data/default-cards.json';

// type DefaultCard = {
//   name: string;
//   set: string;
//   set_name: string;
//   collector_number: string;
// };

// const defaultCards = _defaultCards as DefaultCard[];

export function addRoutes(app: express.Express): void {
  const jsonParser = bodyParser.json();

  app.post('/api/setsForCards', jsonParser, (req, res) => {
    const requestCards = (req.body as string[]).map((c) => c?.toLowerCase());
    console.log(requestCards);

    // console.log(defaultCards.find((c) => c.name.toLowerCase() === 'opt'));
    // const cards = defaultCards.filter((card) => requestCards.includes(card.name.toLowerCase()));
    // console.log(cards.length);

    res.send([]);
  });
}
