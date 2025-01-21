import fs from "fs";
import path from "path";
import {
  SynchronizationStep,
  SynchronizationStepOptions,
} from "../../util/synchronization-step";

import { getImportsDirectory } from "../../util/utils";
import { SyncUIData } from "./sync-ui";

export interface SyncSlotsParameters extends SyncUIData {
  uiName: string;
}

export class SyncSlots implements SynchronizationStep<SyncSlotsParameters> {
  synchronize(
    values: any,
    parameters: SyncSlotsParameters,
    { env, dryRun }: SynchronizationStepOptions
  ): void {
    let importsDirectory = getImportsDirectory(
      "./imports/product-store/slots",
      env
    );

    if (!values.app || !values.app.operator || !values.app.operator.slot) {
      console.log("No slots found in values file. Skipping synchronization.");
      return;
    }

    const slots = values.app.operator.slot.specs;

    for (const [key, spec] of Object.entries(slots) as [string, any][]) {
      const fileName = `${parameters.productName}_${parameters.uiName}_${key}.json`;
      const filePath = path.join(importsDirectory, fileName);

      const jsonContent = {
        description: spec.description,
        name: spec.name,
        deprecated: false,
        undeployed: false,
      };

      if (dryRun) {
        console.log(
          `Dry Run: Would write to ${filePath} with content:`,
          JSON.stringify(jsonContent, null, 2)
        );
      } else {
        fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2));
      }
    }

    console.log("Slots synchronized successfully.");
  }

  removeSynchronization(
    values: any,
    input: SyncSlotsParameters,
    options: SynchronizationStepOptions
  ): void {
    let importsDirectory = getImportsDirectory(
      "./imports/product-store/slots",
      options.env
    );

    if (!values.app || !values.app.operator || !values.app.operator.slot) {
      console.log("No slots found in values file. Skipping removal.");
      return;
    }

    const slots = values.app.operator.slot.specs;

    for (const key of Object.keys(slots)) {
      const fileName = `${input.productName}_${input.uiName}_${key}.json`;
      const filePath = path.join(importsDirectory, fileName);

      if (options.dryRun) {
        console.log(`Dry Run: Would remove file at ${filePath}`);
      } else {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Removed file at ${filePath}`);
        } else {
          console.log(`File not found at ${filePath}, skipping removal.`);
        }
      }
    }

    console.log("Slots removal completed successfully.");
  }
}
