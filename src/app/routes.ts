import { FastifyServer } from '@interfaces/index';
import { logger } from '@logger/index';
import { DataRouter } from '@controllers/data.router';

export class Routes {
  static initializeRoutes(app: FastifyServer): void {
    app.register(DataRouter.DataRoutes, { prefix: '/stonks' });
    logger.info({ message: 'Routes registered' });
  }
}
