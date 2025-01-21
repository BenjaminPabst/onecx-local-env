export interface SynchronizationStepOptions {
  dryRun: boolean;
  pathToLocalEnv?: string | undefined;
}

export interface SynchronizationStep {
  synchronize(input: any, options: SynchronizationStepOptions): void;
}
