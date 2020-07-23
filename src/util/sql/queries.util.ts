export function getGroupedCount(tableName: string, groupByColumn: string): string {
  return `
    SELECT ${groupByColumn}, COUNT(*) 
    FROM ${tableName} 
    GROUP BY ${groupByColumn};
  `;
}