import { StrategyConfigs } from "@interfaces/strategy.interface";
import { DataTimeFrameEnum, StrategyNameEnum, TimeFrameEnum } from "../enums";

export const strategiesConfigs: StrategyConfigs[] = [
  {
    name: StrategyNameEnum.GRANDFATHER_FATHER_SON_BEARISH_REVERSAL,
    verificationWindow: 10,
    verificationTimeFrame: DataTimeFrameEnum.DAILY_ADJUSTED,
    capitalPercentage: 5,
    targetPercentage: 20,
    stopLossPercentage: 10,
    trailingStopLoss: {
      afterConsecutiveSuccess: 4,
      trailBy: 2
    }
  }
]