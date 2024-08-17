import fs from 'fs';
import parse from 'csv-parse/lib/sync';
import { logger } from '@logger/index';

export async function parseCSVFile(filePath: string): Promise<Array<any>> {
  const csvRows = parse(fs.readFileSync(filePath), { delimiter: ',' });
  logger.info(`files.util.parseCSVFile - ${csvRows.length} records found`);
  return csvRows;
}
