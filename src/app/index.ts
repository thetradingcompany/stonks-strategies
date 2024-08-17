import { FastifyServer } from '@interfaces/index';
import fastify from 'fastify';
import { logger } from '@logger/index';
import { setCors } from '@app/middlewares/setCors';
import { Routes } from '@app/routes';

class App {
  public app: FastifyServer;

  constructor() {
    this.app = fastify();
  }

  public async initializeApp(): Promise<void> {
    this.loadMiddlewares();
    this.loadRoutes();
    this.listen();
  }

  loadMiddlewares(): void {
    this.app.use(setCors);
  }

  loadRoutes(): void {
    Routes.initializeRoutes(this.app);
  }

  listen(): void {
    const port = process.env.HTTP_PORT || '3000';
    this.app.listen(port, () => {
      logger.info(`Server connected to port: ${port}`);
    });
  }
}

export default new App();
