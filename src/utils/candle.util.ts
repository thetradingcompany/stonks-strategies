import { CandleType } from 'candle.type';

export function transformHistoryDataPointToCandle(data: object): CandleType {
  if (!data) {
    return {
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      volume: 0,
    };
  }

  return {
    open: data['1. open'] ? parseFloat(data['1. open']) : 0,
    high: data['2. high'] ? parseFloat(data['2. high']) : 0,
    low: data['3. low'] ? parseFloat(data['3. low']) : 0,
    close: data['4. close'] ? parseFloat(data['4. close']) : 0,
    volume: data['6. volume'] ? parseFloat(data['6. volume']) : 0,
  };
}
