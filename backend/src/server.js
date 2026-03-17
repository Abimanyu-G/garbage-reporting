import { createApp } from './app.js';
import { openDb, initDb } from './db/database.js';
import { env } from './utils/env.js';

const db = openDb();
initDb(db);

const app = createApp({ db });

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${env.port}`);
});

