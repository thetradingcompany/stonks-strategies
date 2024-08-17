import { logger } from '@logger/index';
import format from 'pg-format';
import { query } from '@models/utils';
import { UpsertDailyStockDataInput } from '@interfaces/etl.interface';
import { convertObjectToArray } from '@utils/transformation.util';
import { getValidStockTableName } from '@models/utils/etl.util';

class EtlRepository {
  private readonly INSERT_STOCKS_METADATA = `INSERT INTO stocks_metadata (symbol, company_name, industry, exchange) VALUES %L`;
  private readonly GET_STOCKS_METADATA = `SELECT %L FROM stocks_metadata`;

  private readonly CHECK_IF_TABLE_EXISTS = `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = %s)`;
  private readonly CREATE_STOCK_TABLE = `CREATE TABLE %s (date DATE PRIMARY KEY, high NUMERIC (9, 2) DEFAULT 0 NOT NULL, low NUMERIC (9, 2) DEFAULT 0 NOT NULL, open NUMERIC (9, 2) DEFAULT 0 NOT NULL, close NUMERIC (9, 2) DEFAULT 0 NOT NULL, volume INT DEFAULT 0 NOT NULL)`;
  private readonly UPSERT_DAILY_STOCK_DATA = `INSERT INTO %s (high, low, open, close, volume, date) VALUES %L ON CONFLICT (date) DO NOTHING`;

  async bulkInsertStocksMetadata(metadata: Array<Array<string>>): Promise<void> {
    try {
      await query(format(this.INSERT_STOCKS_METADATA, metadata));
      logger.info({ message: 'EtlRepository.bulkInsertStocksMetadata - Metadata inserted' });
    } catch (error) {
      throw error;
    }
  }

  async getStocksMetadata(projections: Array<string>) {
    try {
      return await query(format(this.GET_STOCKS_METADATA, projections));
    } catch (error) {
      throw error;
    }
  }

  async createStockTableIfNotExists(tableName: string): Promise<void> {
    try {
      const validTableName = getValidStockTableName(tableName);
      const tableExistsPayload = await query(format(this.CHECK_IF_TABLE_EXISTS, `'${validTableName}'`));
      const [tableExistsObject] = tableExistsPayload.rows;
      const tableExists = tableExistsObject['exists'];
      if (tableExists) {
        logger.info({ message: `EtlRepository.createStockTableIfNotExists: Table already exists` });
        return;
      }

      logger.info({ message: `EtlRepository.createStockTableIfNotExists: Creating new table with name: ${validTableName}` });
      await query(format(this.CREATE_STOCK_TABLE, validTableName));
    } catch (error) {
      throw error;
    }
  }

  async upsertDailyStockData({ dailyStockData, stockSymbol }: UpsertDailyStockDataInput): Promise<void> {
    try {
      const upsertQueryDataInput = dailyStockData.map((data) => convertObjectToArray(data));
      const validTableName = getValidStockTableName(stockSymbol);
      // FIX: Destruct each row and pass each row manually to prevent wrong column issues
      await query(format(this.UPSERT_DAILY_STOCK_DATA, validTableName, upsertQueryDataInput));
      logger.info({
        message: `EtlRepository.upsertDailyStockData - ${dailyStockData.length} rows upserted for ${stockSymbol}`,
      });
    } catch (error) {
      throw error;
    }
  }
}

export const etlRepository = new EtlRepository();
