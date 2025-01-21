import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import {
  SynchronizationStep,
  SynchronizationStepOptions,
} from "../../util/synchronization-step";

import { SyncUIData } from "./sync-ui";
import { getImportsDirectory } from "../../util/utils";

/**
 * Folder ./imports/product-store/slots/
onecx-workspace_onecx-workspace-ui_onecx-avatar-image.json:
{
    "description": "User Profile avatar image",
    "name": "onecx-avatar-image",
    "deprecated": false,
    "undeployed": false
}

Corresponds to values.yml at
app.operators.slot:

    slot:
      enabled: true
      specs:
        onecx-avatar-image:
          name: 'onecx-avatar-image'
          description: 'User Profile avatar image'
 */

export interface SyncSlotsParameters extends SyncUIData {
  uiName: string;
}

export class SyncSlots implements SynchronizationStep {
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
}
