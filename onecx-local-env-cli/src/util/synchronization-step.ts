export interface SynchronizationStepOptions {
  dryRun: boolean;
  env?: string | undefined;
}

export interface SynchronizationStep {
  synchronize(input: any, options: SynchronizationStepOptions): void;
}
