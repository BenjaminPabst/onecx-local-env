/*
Folder ./imports/product-store/microservices/
Each UI has own file:
productName_uiName.json:

onecx-workspace_onecx-workspace-ui.json:
{
    "version": "xxx",
    "description": "onecx-workspace-ui",
    "name": "onecx-workspace-ui",
    "type": "ui"
}
*/
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { SyncUIData } from "./sync-ui";
import {
  SynchronizationStep,
  SynchronizationStepOptions,
} from "../../util/synchronization-step";
import { getImportsDirectory } from "../../util/utils";

export interface SyncMicroservicesParameters extends SyncUIData {
  uiName: string;
}

export class SyncMicroservices implements SynchronizationStep {
  synchronize(
    values: any,
    parameters: SyncMicroservicesParameters,
    { dryRun, env }: SynchronizationStepOptions
  ): void {
    let importsDir = getImportsDirectory(
      "./imports/product-store/microservices/",
      env
    );

    const fileName = `${parameters.productName}_${parameters.uiName}.json`;
    const filePath = path.join(importsDir, fileName);

    const jsonContent = {
      version: "xxx",
      description: parameters.uiName,
      name: parameters.uiName,
      type: "ui",
    };

    if (dryRun) {
      console.log(
        `Dry Run: Would write to ${filePath} with content:`,
        JSON.stringify(jsonContent, null, 2)
      );
    } else {
      fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2));
    }

    console.log("Microservices synchronized successfully.");
  }
}
