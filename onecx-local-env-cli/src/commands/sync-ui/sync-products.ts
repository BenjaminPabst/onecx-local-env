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
  icon: string;
}

export class SyncProducts implements SynchronizationStep {
  synchronize(
    values: any,
    parameters: SyncProductsParameters,
    { dryRun, env }: SynchronizationStepOptions
  ): void {
    let importsDir = getImportsDirectory(
      "./imports/product-store/products/",
      env
    );

    // Target file
    const filePath = path.resolve(importsDir, `${parameters.productName}.json`);

    // Product JSON
    const product = {
      version: "xxx",
      description: parameters.productName.replace(/-/g, " "),
      basePath: parameters.basePath,
      displayName: parameters.productName.replace(/-/g, " "),
      iconName: parameters.icon,
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
