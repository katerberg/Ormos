import {getServerPort} from './debug';

const isProd = process.env.NODE_ENV === 'production';
const SERVER_BASE = isProd ? 'https://api.stlotus.org:448' : `http://localhost:${getServerPort()}`;
export const API_BASE = `${SERVER_BASE}/api`;
