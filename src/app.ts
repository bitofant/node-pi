import logger from 'standalone-logger';
const log = logger(module);

import express from 'express';
import config from './config';
const app = express();

app.use(express.static('htdocs/'));
app.use('js/', express.static('dist/frontend/'));

app.listen(config.PORT, () => {
  log(`listening on port ${config.PORT}...`);
});
