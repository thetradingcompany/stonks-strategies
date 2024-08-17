export interface BackTestRow {
  id: number,
  date: Date,
  symbol: string;
  marketcapname: string,
  sector: string,
}

export interface GetBackTestResultsForStrategyPayload {
  results: Array<BackTestRow[]>
}

export interface DistinctSymbolRow {
  symbol: string;
}