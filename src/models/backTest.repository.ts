import { query } from "@models/utils";
import format from "pg-format";
import { logger } from "@logger/index";
import { BackTestRow, DistinctSymbolRow, GetBackTestResultsForStrategyPayload } from "@interfaces/backtest.interface";

class BackTestRepository {
  private readonly GET_BACK_TEST_RESULTS_FOR_STRATEGY_FILTER_BY_SYMBOL = `SELECT * FROM %s WHERE symbol = %s`;
  private readonly GET_DISTINCT_SYMBOLS_FOR_STRATEGY = `SELECT DISTINCT symbol from %s`;

  async getDistinctSymbolsForStrategy(strategyName: string) {
    try {
      const distinctSymbolsPayload = await query(format(this.GET_DISTINCT_SYMBOLS_FOR_STRATEGY, strategyName));
      const distinctSymbols: DistinctSymbolRow[] = distinctSymbolsPayload.rows;

      return distinctSymbols;
    } catch (error) {
      throw error;
    }
  }

  async getBackTestResultsForStrategy(strategyName: string): Promise<GetBackTestResultsForStrategyPayload> {
    try {
      const distinctSymbols = await this.getDistinctSymbolsForStrategy(strategyName);
      const backTestResults: Array<BackTestRow[]> = [];

      const backTestPromises = distinctSymbols.map(async ({ symbol }) => {
        const filteredBackTestResultPayload = await query(format(this.GET_BACK_TEST_RESULTS_FOR_STRATEGY_FILTER_BY_SYMBOL, strategyName, `'${symbol}'`));
        const results: BackTestRow[] = filteredBackTestResultPayload.rows ?? [];
        backTestResults.push(results);
      })

      await Promise.all(backTestPromises);
      logger.info({ message: `BackTestRepository.getBackTestResultsForStrategy - Data found for strategy ${strategyName}` });

      return { results: backTestResults };
    } catch (error) {
      throw error;
    }
  }
}

export const backTestRepository = new BackTestRepository();