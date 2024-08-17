import { createLogger, transports, config, format } from 'winston';

export const logger = createLogger({
  levels: config.syslog.levels,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
  exceptionHandlers: [new transports.Console()],
});
