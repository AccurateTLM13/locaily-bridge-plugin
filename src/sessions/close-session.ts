import type { SessionRecord } from '../config/schema.js';
import type { LocalBrainClient } from '../brain/client.js';

export async function closeSession(
  client: LocalBrainClient,
  sessionId: string,
  status: SessionRecord['status'] = 'completed'
): Promise<void> {
  await client.closeSession(sessionId, status);
}
