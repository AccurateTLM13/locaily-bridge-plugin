import type { SessionRecord, FileConflictRecord, SessionEvent } from '../config/schema.js';
import type { LocalBrainClient } from '../brain/client.js';

export class ConflictDetector {
  private client: LocalBrainClient;
  private projectId: string;

  constructor(client: LocalBrainClient, projectId: string) {
    this.client = client;
    this.projectId = projectId;
  }

  async detectConflicts(activeSessionIds: string[]): Promise<FileConflictRecord[]> {
    const fileMap = new Map<string, { sessions: string[]; workerIds: string[] }>();

    for (const sessionId of activeSessionIds) {
      const session = await this.client.getSession(sessionId);
      if (session.status !== 'active') continue;

      const events = await this.client.getSessionEvents(sessionId);
      const changedFiles = events
        .filter((e: SessionEvent) => e.type === 'file.changed' && e.filePath)
        .map((e: SessionEvent) => e.filePath as string);

      const uniqueFiles = [...new Set(changedFiles)];
      for (const file of uniqueFiles) {
        if (!fileMap.has(file)) {
          fileMap.set(file, { sessions: [], workerIds: [] });
        }
        const entry = fileMap.get(file)!;
        if (!entry.sessions.includes(sessionId)) {
          entry.sessions.push(sessionId);
        }
        if (session.workerId && !entry.workerIds.includes(session.workerId)) {
          entry.workerIds.push(session.workerId);
        }
      }
    }

    const conflicts: FileConflictRecord[] = [];
    for (const [filePath, data] of fileMap.entries()) {
      if (data.sessions.length > 1) {
        conflicts.push({
          filePath,
          sessions: data.sessions,
          workerIds: data.workerIds,
          detectedAt: new Date().toISOString(),
          status: 'pending',
        });
      }
    }

    return conflicts;
  }

  async checkForConflictsWith(
    sessionId: string,
    otherSessionIds: string[]
  ): Promise<FileConflictRecord[]> {
    return this.detectConflicts([sessionId, ...otherSessionIds]);
  }

  async resolveConflict(filePath: string): Promise<void> {
    await this.client.updateConflictStatus(this.projectId, filePath, 'resolved');
  }
}
