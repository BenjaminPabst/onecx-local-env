import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import {
  SynchronizationStep,
  SynchronizationStepOptions,
} from "../../util/synchronization-step";
import { SyncUIData } from "./sync-ui";

/**
 * Folder ./imports/product-store/products/
Each Product has own file:
onecx-workspace.json:
{
    "version": "xxx",
    "description": "OneCX Workspace",
    "basePath": "/workspace",
    "displayName": "OneCX Workspace",
    "icon": "pi-ellipsis-h"
}
 */

export interface SyncProductsParameters extends SyncUIData {
  customUiName: string;
  basePath: string;
  icon: string;
}

export class SyncProducts implements SynchronizationStep {
  synchronize(
    input: SyncProductsParameters,
    options: SynchronizationStepOptions
  ): void {
    let importsDir = path.resolve("./imports/product-store/products/");
    if (options.env) {
      const localEnvPath = path.resolve(options.env);
      importsDir = path.resolve(localEnvPath, "imports/product-store/products");
    }

    const valuesFilePath = input.pathToValues;
    const dryRun = options.dryRun || false;

    if (!fs.existsSync(valuesFilePath)) {
      throw new Error(`Values file not found at path: ${valuesFilePath}`);
    }

    const valuesFile = fs.readFileSync(valuesFilePath, "utf8");
    const values = yaml.load(valuesFile) as any;

    // Target file
    const filePath = path.resolve(importsDir, `${input.productName}.json`);

    // Product JSON
    const product = {
      version: "xxx",
      description: input.productName.replace(/-/g, " "),
      basePath: input.basePath,
      displayName: input.productName.replace(/-/g, " "),
      iconName: input.icon,
    };

    if (dryRun) {
      console.log(
        `Dry Run: Would write to ${filePath} with content:`,
        JSON.stringify(product, null, 2)
      );
    } else {
      fs.writeFileSync(filePath, JSON.stringify(product, null, 2));
    }

    console.log("Product synchronized successfully.");
  }
}
