export function getTableNameForStrategy(strategyName: string): string {
  let strategyTableName = strategyName.split(' ').join('_')
  strategyTableName = strategyTableName.split('-').join('_');

  return 'stonks_' + strategyTableName;
}