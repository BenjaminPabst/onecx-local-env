export interface SynchronizationStepOptions {
  dryRun: boolean;
  env?: string | undefined;
}

export interface SynchronizationStep {
  synchronize(valuesYaml: string, input: any, options: SynchronizationStepOptions): void;
}
