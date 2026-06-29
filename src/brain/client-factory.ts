import type { LocalBrainClient } from './client.js';
import type { ResolvedProject } from '../config/schema.js';
import { FileBrainClient } from './file-client.js';
import { HttpBrainClient } from './http-client.js';

export class ClientFactoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientFactoryError';
  }
}

export function createBrainClient(project: ResolvedProject): LocalBrainClient {
  switch (project.brainMode) {
    case 'http':
      return new HttpBrainClient(project);
    case 'file':
      return new FileBrainClient(project);
    default:
      throw new ClientFactoryError(
        `Unknown brain mode: "${project.brainMode}". Expected "file" or "http".`
      );
  }
}
