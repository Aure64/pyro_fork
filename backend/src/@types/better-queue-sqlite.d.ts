import { Store } from "better-queue";

declare class SqlLiteStore<T> implements Store<T> {
  constructor(options?: SqlLiteStore.Options);

  connect(cb: (error: unknown, length: number) => void): void;

  getTask(taskId: unknown, cb: (error: unknown, task: T) => void): void;

  deleteTask(taskId: unknown, cb: () => void): void;

  putTask(
    taskId: unknown,
    task: T,
    priority: number,
    cb: (error: unknown) => void
  ): void;

  takeFirstN(n: number, cb: (error: unknown, lockId: string) => void): void;

  takeLastN(n: number, cb: (error: unknown, lockId: string) => void): void;

  getLock(
    lockId: string,
    cb: (error: unknown, tasks: { [taskId: string]: T }) => void
  ): void;

  releaseLock(lockId: string, cb: (error: unknown) => void): void;
}

declare namespace SqlLiteStore {
  type Options = {
    path?: string;
    tableName?: string;
  };
}

export = SqlLiteStore;
