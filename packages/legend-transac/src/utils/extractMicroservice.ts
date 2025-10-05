/**
 * Extracts the microservice name from a queue name
 *
 * Queue names follow the pattern: `{microservice}_match_commands` or `{microservice}_saga_commands`
 * This utility extracts the microservice part from the queue name.
 *
 * @param queueName - The queue name (e.g., 'auth_match_commands', 'coins_saga_commands')
 * @returns The microservice name (e.g., 'auth', 'coins')
 *
 * @example
 * ```typescript
 * extractMicroserviceFromQueue('auth_match_commands'); // Returns: 'auth'
 * extractMicroserviceFromQueue('coins_saga_commands'); // Returns: 'coins'
 * extractMicroserviceFromQueue('audit-eda_match_commands'); // Returns: 'audit-eda'
 * ```
 */
export function extractMicroserviceFromQueue(queueName: string): string {
  // Remove common suffixes to get the microservice name
  return queueName.replace(/_match_commands$/, '').replace(/_saga_commands$/, '');
}
