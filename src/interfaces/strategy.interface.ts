import { DataTimeFrameEnum, StrategyNameEnum } from "../enums";

export interface StrategyConfigs {
  name: StrategyNameEnum,
  verificationWindow: number, // candles
  verificationTimeFrame: DataTimeFrameEnum,
  capitalPercentage: number,
  targetPercentage: number,
  stopLossPercentage: number,
  trailingStopLoss: {
    afterConsecutiveSuccess: number,
    trailBy: number, // candles
  }
  extraProperties?: Record<string, any>,
}