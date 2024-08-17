import { getStockSymbol, parseCSVFile } from '@utils/index';
import { etlRepository } from '@models/etl.repository';
import { DailyStockDataType, MutationPayload } from '@interfaces/etl.interface';
import { getStockData } from '@utils/data.util';
import { DataOutputSizeEnum, DataTimeFrameEnum, PayloadDataTypeEnum } from '../enums';
import { transformHistoryDataPointToCandle } from '@utils/candle.util';
import { logger } from '@logger/index';
import { StockType } from 'stock.type';

class ETLService {
  private readonly STOCKS_METADATA_FILE_PATH = 'data/bse_metadata.csv';
  private readonly API_TIMEOUT_INTERVAL = 5000; // 5 sec

  async insertStocksMetadata(): Promise<MutationPayload> {
    const csvRows = await parseCSVFile(this.STOCKS_METADATA_FILE_PATH);
    await etlRepository.bulkInsertStocksMetadata(csvRows);

    return { success: true };
  }

  private async populateDailyStockData(stockSymbol: string, stockData: object | undefined): Promise<void> {
    if (!stockData) {
      return;
    }

    const dailyStockData: DailyStockDataType[] = [];

    Object.keys(stockData).forEach((date) => {
      const candle = transformHistoryDataPointToCandle(stockData[date]);
      dailyStockData.push({ ...candle, date });
    });

    logger.info({ message: `Populating data for stock ${stockSymbol}` });
    await etlRepository.createStockTableIfNotExists(stockSymbol);
    await etlRepository.upsertDailyStockData({ dailyStockData, stockSymbol });
  }

  private async fetchAndPopulateDailyStockDataWithTimeout(
    stocks: Array<StockType>,
    stocksData: (object | undefined)[],
  ): Promise<void> {
    if (stocks.length <= 0) {
      return;
    }

    const [stock, ...remainingStocks] = stocks;

    setTimeout(async () => {
      const { symbol: stockSymbol } = stock;
      const symbol = await getStockSymbol(stock);
      if (!symbol) {
        logger.error({
          message: `fetchAndPopulateDailyStockDataWithTimeout.etl.service: No symbol found for given stockSymbol: ${stockSymbol}`,
        });
      } else {
        const stockData = await getStockData({
          symbol,
          exchange: 'BSE',
          timeFrame: DataTimeFrameEnum.DAILY_ADJUSTED,
          outputSize: DataOutputSizeEnum.FULL,
          dataType: PayloadDataTypeEnum.JSON,
        });

        await this.populateDailyStockData(symbol, stockData);
      }

      await this.fetchAndPopulateDailyStockDataWithTimeout(remainingStocks, stocksData);
    }, this.API_TIMEOUT_INTERVAL);
  }

  async upsertDailyFullData(): Promise<MutationPayload> {
    const csvRows = await parseCSVFile(this.STOCKS_METADATA_FILE_PATH);
    const stocks: Array<StockType> = [];
    csvRows.forEach((csvRow) => stocks.push({ symbol: csvRow[0], name: csvRow[1] }));

    await this.fetchAndPopulateDailyStockDataWithTimeout(stocks, []);

    return { success: true };
  }
}

export const etlService = new ETLService();
