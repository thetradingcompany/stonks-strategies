import { CandleType } from 'candle.type';
import { TimeFrameEnum } from '../enums';

export abstract class BaseStrategy {
  protected candle: CandleType;
  protected abstract timeFrame: TimeFrameEnum;
  // Number of history candles required for a single run
  protected abstract candleFrame: number;

  protected abstract entry();

  protected abstract exit();

  protected abstract strategy();
}
