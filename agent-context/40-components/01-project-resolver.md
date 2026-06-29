# Component: Project Resolver

Determines which Local Brain project matches the current repository.

## Lookup chain

```
Current repository
      ↓
.opencode/locaily.json (project registry)
      ↓
Project ID
      ↓
Local Brain project record
```

## Registry file format

Location: `.opencode/locaily.json` at repository root

```json
{
  "schemaVersion": "locaily.project-link.v1",
  "projectId": "doughboy-vinyl-technologies",
  "localBrain": "D:/LocAIly/local-brain",
  "repository": "C:/Projects/doughboy-vinyl"
}
```

## Resolution logic

1. Check if `.opencode/locaily.json` exists in the repository root
2. Parse and validate against `project-link.schema.json`
3. Verify the `repository` field matches the current working directory
4. Load `projectId` and `localBrain` path
5. If the registry is missing or invalid, warn the user

## Output

```typescript
interface ResolvedProject {
  projectId: string;
  localBrainPath: string;
  repository: string;
  gitRoot: string;
  currentBranch: string;
}
```

## Error states

- No `.opencode/locaily.json` found → warn and offer to create one
- Repository mismatch → warn that the link may belong to a different checkout
- Local Brain path does not exist → warn and fall back to asking the user
