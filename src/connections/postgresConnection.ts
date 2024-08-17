import { Pool } from 'pg';
import { logger } from '@logger/index';
import { appConfigs } from '@appConfigs/index';

const pool = new Pool({
  connectionString: appConfigs.PGConnectionURI,
  max: appConfigs.PGMaxConnections,
  idleTimeoutMillis: appConfigs.PGIdleTimeout,
});

logger.info('Initialized postgres pool');

pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(0);
});

process.on('SIGINT', async () => {
  await pool.end();
  logger.error({ message: 'Postgres default connection disconnected through app termination' });
  process.exit(0);
});

export default pool;
