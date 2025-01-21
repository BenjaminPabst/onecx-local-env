import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import {
  SynchronizationStep,
  SynchronizationStepOptions,
} from "../../util/synchronization-step";

import { SyncUIData } from "./sync-ui";

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
  customUiName: string;
}

export class SyncSlots implements SynchronizationStep {
  synchronize(
    input: SyncSlotsParameters,
    options: SynchronizationStepOptions
  ): void {
    let importsDir = path.resolve("./imports/product-store/slots/");
    if (options.env) {
      const localEnvPath = path.resolve(options.env);
      importsDir = path.resolve(localEnvPath, "imports/product-store/slots");
    }

    const valuesFilePath = input.pathToValues;
    const dryRun = options.dryRun || false;

    if (!fs.existsSync(valuesFilePath)) {
      throw new Error(`Values file not found at path: ${valuesFilePath}`);
    }

    const valuesFile = fs.readFileSync(valuesFilePath, "utf8");
    const values = yaml.load(valuesFile) as any;

    if (!values.app || !values.app.operator || !values.app.operator.slot) {
      console.log("No slots found in values file. Skipping synchronization.");
      return;      
    }

    let uiName = values.app.image.repository.split("/").pop();
    if (input.customUiName) {
      uiName = input.customUiName;
    }

    const slots = values.app.operator.slot.specs;

    for (const [key, spec] of Object.entries(slots) as [string, any][]) {
      const fileName = `${input.productName}_${uiName}_${key}.json`;
      const filePath = path.join(importsDir, fileName);

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
