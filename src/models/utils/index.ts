import pool from '@connections/postgresConnection';

export async function query(queryStatement: string): Promise<any> {
  const client = await pool.connect();
  let payload;
  try {
    await client.query('BEGIN');
    try {
      payload = await client.query(queryStatement);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    client.release();
  }

  return payload;
}
