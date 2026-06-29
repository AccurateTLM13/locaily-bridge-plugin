# Component: Local Brain Client

Handles all communication with the LocAIly Local Brain.

## Operations

```typescript
interface LocalBrainClient {
  resolveProject(): Promise<ResolvedProject>;
  getProjectContext(): Promise<ProjectContext>;
  getActiveObjective(): Promise<Objective>;
  getActiveSlice(): Promise<BuildSlice>;
  createSession(session: SessionRecord): Promise<string>;
  appendSessionEvent(sessionId: string, event: SessionEvent): Promise<void>;
  submitHandoff(handoff: HandoffRecord): Promise<void>;
  reportBlocker(sessionId: string, blocker: Blocker): Promise<void>;
  closeSession(sessionId: string): Promise<void>;
}
```

## Implementation strategy

### Phase 1-3: File-based client

Reads and writes JSON files directly on the Local Brain filesystem.

```
{localBrain}/
├── projects/
│   └── {projectId}/
│       ├── project.json
│       ├── objectives/
│       │   └── active.json
│       ├── sessions/
│       │   └── {sessionId}.json
│       └── handoffs/
│           └── {handoffId}.json
```

### Phase 4+: HTTP client

Replaces file access with REST API calls:

```
POST /sessions
POST /sessions/:id/events
GET  /projects/:id/context
POST /projects/:id/handoffs
```

## Interface segregation

Both file and HTTP clients implement the same `LocalBrainClient` interface. The plugin selects which client to use based on configuration or availability.

```typescript
interface ClientConfig {
  mode: 'file' | 'http';
  // file mode
  localBrainPath?: string;
  // http mode
  apiBaseUrl?: string;
  apiKey?: string;
}
```
