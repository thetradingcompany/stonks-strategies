import axios, { AxiosResponse } from 'axios';
import { appConfigs } from '@appConfigs/index';
import { GetStockDataInput } from '@interfaces/index';
import { DataOutputSizeEnum, PayloadDataTypeEnum } from '../enums';
import { logger } from '@logger/index';
import { getRotatedAlphaVantageApiKey } from '@utils/apiKeys.util';
import { StockType } from 'stock.type';

async function axiosGet(endpoint: string): Promise<AxiosResponse<any> | void> {
  return await axios.get(endpoint).catch((error) => {
    logger.error({ message: `axiosGet.data.util - Error: ${error.message}`, payload: error.stack });
  });
}

function parseStockData(data: object): object | undefined {
  // API Response = { 'Meta Data': {...}, 'Time Series (<timeFrame>)': {...} }
  const filteredKeys = Object.keys(data).filter((key) => key !== 'Meta Data');
  const canBeData = data[filteredKeys[0]];

  if (typeof canBeData === 'string' || canBeData instanceof String) {
    return undefined;
  }

  return canBeData;
}

function parseSearchPayload(data: object): string | undefined {
  // API Response = { 'bestMatches': [ {...}, {...} ] }
  if (!data['bestMatches']) {
    return;
  }

  const bestMatchSymbols: string[] = [];
  data['bestMatches'].forEach((bestMatch) => {
    const [symbol, exchange] = bestMatch['1. symbol'].split('.');
    if (exchange === 'BSE' || exchange === 'NSE') {
      bestMatchSymbols.unshift(symbol);
    }

    if (bestMatch['4. region'] === 'India/Bombay') {
      bestMatchSymbols.push(symbol);
    }
  });

  const [bestMatchSymbol] = bestMatchSymbols;
  return bestMatchSymbol;
}

function getAlphaVantageEndpoint(): string {
  const alphaVantageApiKey = getRotatedAlphaVantageApiKey();
  const alphaVantageEndpoint = appConfigs.alphaVantageEndpoint;

  return `${alphaVantageEndpoint}?apikey=${alphaVantageApiKey}`;
}

function getDataEndpoint({ symbol, exchange, timeFrame, outputSize, dataType, adjusted, slice }: GetStockDataInput): string {
  let endpoint = getAlphaVantageEndpoint();
  endpoint += `&symbol=${symbol}.${exchange}`;
  endpoint += `&function=${timeFrame}`;
  endpoint += `&outputsize=${outputSize ?? DataOutputSizeEnum.COMPACT}`;
  endpoint += `&datatype=${dataType ?? PayloadDataTypeEnum.JSON}`;

  if (adjusted) {
    endpoint += `&adjusted=${adjusted}`;
  }
  if (slice) {
    endpoint += `&slice=${slice}`;
  }

  return endpoint;
}

function getSearchEndpoint(keywords: string): string {
  let endpoint = getAlphaVantageEndpoint();
  endpoint += `&function=SYMBOL_SEARCH`;
  endpoint += `&keywords=${keywords}`;

  return endpoint;
}

export async function getStockData(input: GetStockDataInput): Promise<object | undefined> {
  const endpoint = getDataEndpoint(input);
  try {
    const getStockDataPayload = await axiosGet(endpoint);
    if (!getStockDataPayload) {
      return;
    }

    const { data } = getStockDataPayload;

    return parseStockData(data);
  } catch (err) {
    logger.error({ message: `getStockData.data.util - ${err.message}`, payload: err.stack });
    throw err;
  }
}

function trimCompanyName(companyName: string): string {
  let modifiedCompanyName = companyName.replace(' Ltd.', '');
  modifiedCompanyName = modifiedCompanyName.replace('(India)', '');
  modifiedCompanyName = modifiedCompanyName.replace('India', '');

  return modifiedCompanyName;
}

export async function getStockSymbol(stock: StockType): Promise<string | undefined> {
  const { symbol, name } = stock;
  try {
    const symbolEndpoint = getSearchEndpoint(symbol);
    let getStockSymbolPayload = await axiosGet(symbolEndpoint);

    if (getStockSymbolPayload && getStockSymbolPayload.data) {
      const { data } = getStockSymbolPayload;
      return parseSearchPayload(data);
    }

    const modifiedName = trimCompanyName(name);
    const nameEndpoint = getSearchEndpoint(modifiedName);
    getStockSymbolPayload = await axiosGet(nameEndpoint);

    if (!getStockSymbolPayload) {
      return;
    }

    const { data } = getStockSymbolPayload;
    return parseSearchPayload(data);
  } catch (err) {
    logger.error({ message: `getStockSymbol.data.util - ${err.message}`, payload: err.stack });
    throw err;
  }
}
