import { BaseStrategy } from '../baseStrategy';
import { TimeFrameEnum } from '../../enums';

class GrandFatherStrategy extends BaseStrategy {
  protected timeFrame = TimeFrameEnum.MONTHLY;
  protected candleFrame = 1;

  protected entry() {}

  protected exit() {}

  protected strategy() {}
}
