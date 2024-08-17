import { FastifyReply, FastifyRequest } from "fastify";
import { ServerResponse } from "http";
import { logger } from "@logger/index";
import { backTestService } from "@services/backTest.service";

export async function runBackTestForAllStrategies(
  req: FastifyRequest,
  res: FastifyReply<ServerResponse>
): Promise<FastifyReply<ServerResponse>> {
  try {
    await backTestService.runBackTestForAllStrategies();
    return res.send({ success: true });
  } catch (error) {
    logger.error({
      message: "Error in routeHandlers.backTests.runBackTestForAllStrategies",
      payload: { message: error.message, stack: error.stack }
    });
    throw error;
  }
}