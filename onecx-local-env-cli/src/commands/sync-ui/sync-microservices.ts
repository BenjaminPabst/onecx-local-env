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

export interface SyncMicroservicesParameters extends SyncUIData {
  customUiName: string;
}

export class SyncMicroservices implements SynchronizationStep {
  synchronize(
    input: SyncMicroservicesParameters,
    options: SynchronizationStepOptions
  ): void {
    let importsDir = path.resolve("./imports/product-store/microservices/");
    if (options.env) {
      const localEnvPath = path.resolve(options.env);
      importsDir = path.resolve(
        localEnvPath,
        "imports/product-store/microservices"
      );
    }

    const valuesFilePath = input.pathToValues;
    const dryRun = options.dryRun || false;

    if (!fs.existsSync(valuesFilePath)) {
      throw new Error(`Values file not found at path: ${valuesFilePath}`);
    }

    const valuesFile = fs.readFileSync(valuesFilePath, "utf8");
    const values = yaml.load(valuesFile) as any;

    if (
      !values.app ||
      !values.app.operator ||
      !values.app.operator.microfrontend
    ) {
      throw new Error("Invalid values file format");
    }

    let uiName = values.app.image.repository.split("/").pop();
    if (input.customUiName) {
      uiName = input.customUiName;
    }

    const fileName = `${input.productName}_${uiName}.json`;
    const filePath = path.join(importsDir, fileName);

    const jsonContent = {
      version: "xxx",
      description: uiName,
      name: uiName,
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
