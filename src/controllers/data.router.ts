import { FastifyServer } from '@interfaces/index';
import { upsertDailyFullData, insertStocksMetadata } from '@controllers/routeHandlers/dataOps';
import { runBackTestForAllStrategies } from "@controllers/routeHandlers/backTests";

export class DataRouter {
  static DataRoutes(app: FastifyServer, opts: object, done: Function): void {
    app.post('/metadata', insertStocksMetadata);
    app.post('/fullData/daily', upsertDailyFullData);
    app.get('/backtest/all', runBackTestForAllStrategies);
    app.get('/', (req, res) => {
      res.send('Welcome to Data Ops API');
    });
    done();
  }
}
