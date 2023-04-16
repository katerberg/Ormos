import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import {AddressInfo} from 'net';
import {setup} from './express';
import {addRoutes} from './routes';

let server: http.Server | https.Server;
const app = setup();

if (process.env.ENV === 'development') {
  server = new http.Server(app);
} else {
  const httpsOptions = {
    key: fs.readFileSync(process.env.KEY || 'creds/fastify.key'),
    cert: fs.readFileSync(process.env.CERT || 'creds/fastify.crt'),
  };
  server = new https.Server(httpsOptions, app);
}

addRoutes(app);

const args = process.argv.slice(2);
server.listen(args[0] || 8081, () => {
  const address = server.address() as AddressInfo;
  console.log(`Listening on ${address.port}`); //eslint-disable-line no-console
});
