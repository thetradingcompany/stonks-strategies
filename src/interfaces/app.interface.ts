import fastify = require('fastify');
import { IncomingMessage, Server, ServerResponse } from 'http';

export type FastifyServer = fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>;
