import { EventEmitter } from "events";
import { logger } from "./logger";

class SyncManager extends EventEmitter {
  private activeSyncs = new Set<string>();
  private syncQueue: Array<{
    key: string;
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private processing = false;

  async executeSyncOperation<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // If the same sync is already running, wait for it
    if (this.activeSyncs.has(key)) {
      return new Promise((resolve, reject) => {
        const checkAndResolve = () => {
          if (!this.activeSyncs.has(key)) {
            this.removeListener("syncComplete", checkAndResolve);
            // Re-execute the operation since we waited
            this.executeSyncOperation(key, operation)
              .then(resolve)
              .catch(reject);
          }
        };
        this.on("syncComplete", checkAndResolve);
      });
    }

    return new Promise((resolve, reject) => {
      this.syncQueue.push({ key, operation, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.syncQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.syncQueue.length > 0) {
      const { key, operation, resolve, reject } = this.syncQueue.shift()!;

      try {
        this.activeSyncs.add(key);
        logger.info(`Starting sync operation: ${key}`);

        const result = await operation();
        resolve(result);

        logger.info(`Completed sync operation: ${key}`);
      } catch (error) {
        logger.error(`Failed sync operation: ${key}`, error);
        reject(error);
      } finally {
        this.activeSyncs.delete(key);
        this.emit("syncComplete", key);

        // Add a delay between operations to prevent database locks
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    this.processing = false;
  }

  isActive(key: string): boolean {
    return this.activeSyncs.has(key);
  }

  getActiveSyncs(): string[] {
    return Array.from(this.activeSyncs);
  }
}

export const syncManager = new SyncManager();
