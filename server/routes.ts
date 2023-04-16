import * as express from 'express';

export function addRoutes(app: express.Express): void {
  app.post('/api/setsForCards', (req, res) => {
    console.log(req.params);
    console.log(req.query);
    res.send('GET request to the homepage');
  });
}
