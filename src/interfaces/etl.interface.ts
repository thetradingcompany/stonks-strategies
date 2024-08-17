import { DataOutputSizeEnum, PayloadDataTypeEnum, DataSliceEnum, DataTimeFrameEnum } from '../enums';
import { CandleType } from 'candle.type';

export interface MutationPayload {
  success: boolean;
}

export interface GetStockDataInput {
  symbol: string;
  exchange: string;
  timeFrame: DataTimeFrameEnum;
  outputSize?: DataOutputSizeEnum;
  dataType?: PayloadDataTypeEnum;
  adjusted?: boolean;
  slice?: DataSliceEnum;
}

export interface DailyStockDataType extends CandleType {
  date: string;
}

export interface UpsertDailyStockDataInput {
  stockSymbol: string;
  dailyStockData: DailyStockDataType[];
}
