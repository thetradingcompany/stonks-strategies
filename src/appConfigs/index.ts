class AppConfigs {
  get alphaVantageApiKey(): string {
    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API Key not found');
    }
    return process.env.ALPHA_VANTAGE_API_KEY;
  }

  get alphaVantageApiKeys(): string[] {
    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API Keys not found');
    }
    return [process.env.ALPHA_VANTAGE_API_KEY];
  }

  get alphaVantageEndpoint(): string {
    return 'https://www.alphavantage.co/query';
  }

  get PGConnectionURI(): string {
    return process.env.POSTGRES_URI ?? 'postgres://localhost:5432/stonks-data';
  }

  get PGMaxConnections(): number {
    return 5;
  }

  get PGIdleTimeout(): number {
    return 60000; // 1 min
  }
}

export const appConfigs = new AppConfigs();
