import { strategiesConfigs } from '../strategies/strategiesConfigs';
import { backTestRepository } from '@models/backTest.repository';
import { getTableNameForStrategy } from '@utils/strategy.util';
import { getStockData, getStockSymbol } from '@utils/data.util';
import { DataOutputSizeEnum, PayloadDataTypeEnum } from '../enums';
import { DateFormatter } from '@utils/date.util';
import { CandleType } from 'candle.type';
import { transformHistoryDataPointToCandle } from '@utils/candle.util';
import { logger } from '@logger/index';

class BackTestService {
  private readonly INITIAL_CAPITAL = 50000;

  async runBackTestForStrategy(strategyName: string) {
    const [strategyConfigs] = strategiesConfigs.filter((strategyConfigs) => strategyConfigs.name === strategyName);

    const strategyTableName = getTableNameForStrategy(strategyName);
    const { results } = await backTestRepository.getBackTestResultsForStrategy(strategyTableName);

    const symbols = results.map(([row]) => row.symbol);
    const stockSymbols = await Promise.all(
      symbols.map(async (symbol) => {
        return await getStockSymbol({ symbol, name: 'Unknown' });
      }),
    );
    const filteredStockSymbols: string[] = stockSymbols.filter((stockSymbol) => stockSymbol != undefined) as any;

    const stocksHistoryData = await Promise.all(
      filteredStockSymbols.map(async (stockSymbol) => {
        return await getStockData({
          symbol: stockSymbol,
          exchange: 'BSE',
          timeFrame: strategyConfigs.verificationTimeFrame,
          outputSize: DataOutputSizeEnum.FULL,
          dataType: PayloadDataTypeEnum.JSON,
        });
      }),
    );

    results.forEach((filteredBackTestDataPoints, index) => {
      const [firstRow] = filteredBackTestDataPoints;
      const symbol = firstRow.symbol;
      // logger.info({ message: `Starting back test for symbol: ${symbol}` });

      const currentStockHistoryData = stocksHistoryData[index];
      if (!currentStockHistoryData) {
        return;
      }

      const { verificationWindow, capitalPercentage, targetPercentage, stopLossPercentage } = strategyConfigs;
      let initialCapital = this.INITIAL_CAPITAL;
      let deployingCapital = (initialCapital * capitalPercentage) / 100;

      filteredBackTestDataPoints.forEach((result, iteration) => {
        const { date: startDate } = result;
        const dateFormatter = new DateFormatter(startDate);

        const currentDayDate = dateFormatter.dataKeyFormatDate;
        const currentCandle = transformHistoryDataPointToCandle(currentStockHistoryData[currentDayDate]);

        let numberOfShares = Math.floor(deployingCapital / currentCandle.open);

        // Fix
        let previousDayDateFormatter = dateFormatter.subDays(1);
        const previousDayDate = previousDayDateFormatter.dataKeyFormatDate;
        let previousCandle: CandleType = transformHistoryDataPointToCandle(currentStockHistoryData[previousDayDate]);

        const targetPrice = (previousCandle.close * targetPercentage) / 100;
        const stopLossPrice = (previousCandle.close * stopLossPercentage) / 100;
        let returnsInPoints = 0;

        for (let i = 1; i <= verificationWindow; i++) {
          const currentDayDateFormatter = previousDayDateFormatter.addDays(1);
          const currentDayDate = currentDayDateFormatter.dataKeyFormatDate;
          const currentCandle = transformHistoryDataPointToCandle(currentStockHistoryData[currentDayDate]);

          // Stop loss hit
          if (currentCandle.low <= stopLossPrice) {
            returnsInPoints -= previousCandle.close - stopLossPrice;
            break;
          }

          // Target hit
          if (currentCandle.high >= targetPrice) {
            returnsInPoints += targetPrice - previousCandle.close;
            break;
          }

          returnsInPoints += currentCandle.close - previousCandle.close;

          previousCandle = currentCandle;
          previousDayDateFormatter = currentDayDateFormatter;
        }

        initialCapital += numberOfShares * returnsInPoints;

        if (initialCapital <= 0) {
          logger.info({
            message: `Capital blew out for strategy: ${strategyName}, symbol: ${symbol} at iteration ${iteration}`,
          });
          return;
        }

        deployingCapital = (initialCapital * capitalPercentage) / 100;
      });

      logger.info({ message: `Back test results for ${symbol} -` });
      logger.info({ message: `Initial Capital: ${this.INITIAL_CAPITAL}` });
      logger.info({ message: `Ending Capital: ${initialCapital}` });
      logger.info({ message: `Net Profit: ${initialCapital - this.INITIAL_CAPITAL}` });

      let netProfitPercentage = ((initialCapital - this.INITIAL_CAPITAL) * 100) / this.INITIAL_CAPITAL;
      netProfitPercentage = Math.round(netProfitPercentage * 100) / 100;
      logger.info({ message: `Net Profit Percentage: ${netProfitPercentage}` });
    });
  }

  async runBackTestForAllStrategies(): Promise<void> {
    const strategyNames = strategiesConfigs.map((strategyConfigs) => strategyConfigs.name);
    await Promise.all(
      strategyNames.map(async (strategyName) => {
        await this.runBackTestForStrategy(strategyName);
      }),
    );
  }
}

export const backTestService = new BackTestService();
