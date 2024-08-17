import { ServerResponse } from 'http';
import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '@logger/index';
import { etlService } from '@services/etl.service';

export async function insertStocksMetadata(
  req: FastifyRequest,
  res: FastifyReply<ServerResponse>,
): Promise<FastifyReply<ServerResponse>> {
  try {
    const insertStocksMetadataPayload = await etlService.insertStocksMetadata();
    return res.send(insertStocksMetadataPayload);
  } catch (error) {
    logger.error({
      message: 'Error in routeHandlers.dataOps.insertStocksMetadata',
      payload: { message: error.message, stack: error.stack },
    });
    throw error;
  }
}

export async function upsertDailyFullData(
  req: FastifyRequest,
  res: FastifyReply<ServerResponse>,
): Promise<FastifyReply<ServerResponse>> {
  try {
    const generateReportsPayload = await etlService.upsertDailyFullData();
    return res.send(generateReportsPayload);
  } catch (error) {
    logger.error({
      message: 'Error in routeHandlers.dataOps.populateFullData',
      payload: { message: error.message, stack: error.stack },
    });
    throw error;
  }
}
