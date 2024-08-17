import { appConfigs } from '@appConfigs/index';

const alphaVantageApiKeys = appConfigs.alphaVantageApiKeys;
let alphaVantageRotateIndex = 0;

export function getRotatedAlphaVantageApiKey(): string {
  const apiKey = alphaVantageApiKeys[alphaVantageRotateIndex++];
  alphaVantageRotateIndex = alphaVantageRotateIndex % alphaVantageApiKeys.length;

  return apiKey;
}
