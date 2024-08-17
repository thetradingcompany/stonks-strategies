export function getValidStockTableName(tableName: string): string {
  let validTableName = tableName.replace(' ', '_');
  validTableName = validTableName.toLowerCase();
  // FIX: Add proper exchange
  validTableName = 'bse_' + validTableName;

  return validTableName;
}
