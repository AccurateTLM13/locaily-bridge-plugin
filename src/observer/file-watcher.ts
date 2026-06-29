import { watch, existsSync, statSync, readdirSync } from 'fs';
import { resolve, relative } from 'path';
import type { FSWatcher } from 'fs';
import type { EvidenceStore } from './evidence-store.js';
import type { SessionEvent } from '../config/schema.js';

export interface FileWatcherOptions {
  rootDir: string;
  evidenceStore: EvidenceStore;
  sessionId: string;
  debounceMs?: number;
}

export function startFileWatcher(options: FileWatcherOptions): () => void {
  const { rootDir, evidenceStore, sessionId, debounceMs = 300 } = options;
  const watchers: FSWatcher[] = [];
  const pending = new Map<string, ReturnType<typeof setTimeout>>();

  if (!existsSync(rootDir)) {
    console.warn(`[locaily] File watcher: root directory not found "${rootDir}"`);
    return () => {};
  }

  function createOnChange(baseDir: string) {
    return function onChange(eventType: string, filename: string | null): void {
      if (!filename) return;

      const fullPath = resolve(baseDir, filename);

      try {
        if (!statSync(fullPath).isFile()) return;
      } catch {
        return;
      }

      const existing = pending.get(fullPath);
      if (existing) clearTimeout(existing);

      pending.set(
        fullPath,
        setTimeout(() => {
          pending.delete(fullPath);
          const relPath = relative(rootDir, fullPath);

          if (
            relPath.startsWith('.git') ||
            relPath.startsWith('node_modules') ||
            relPath.startsWith('dist')
          ) {
            return;
          }

          const event: SessionEvent = {
            type: 'file.changed',
            sessionId,
            timestamp: new Date().toISOString(),
            filePath: relPath,
          };
          evidenceStore.add(event);
        }, debounceMs)
      );
    };
  }

  function watchDir(dirPath: string): void {
    if (!existsSync(dirPath)) return;

    try {
      const watcher = watch(dirPath, { recursive: true });
      watcher.on('change', createOnChange(dirPath));
      watchers.push(watcher);
    } catch {
      const entries = getChildDirs(dirPath);
      for (const entry of entries) {
        watchDir(entry);
      }
    }
  }

  watchDir(rootDir);

  return () => {
    for (const [, timeout] of pending) clearTimeout(timeout);
    pending.clear();
    for (const w of watchers) w.close();
    watchers.length = 0;
  };
}

function getChildDirs(dirPath: string): string[] {
  try {
    return readdirSync(dirPath)
      .map((name) => resolve(dirPath, name))
      .filter((p) => {
        try {
          return statSync(p).isDirectory();
        } catch {
          return false;
        }
      });
  } catch {
    return [];
  }
}
