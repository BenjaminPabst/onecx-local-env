import fs from "fs";
import path from "path";
import {
  SynchronizationStep,
  SynchronizationStepOptions,
} from "../../util/synchronization-step";
import { getImportsDirectory } from "../../util/utils";
import { SyncUIData } from "./sync-ui";

export interface SyncMicroservicesParameters extends SyncUIData {
  uiName: string;
}

export class SyncMicroservices
  implements SynchronizationStep<SyncMicroservicesParameters>
{
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

  removeSynchronization(
    _: any,
    input: SyncMicroservicesParameters,
    options: SynchronizationStepOptions
  ): void {
    let importsDir = getImportsDirectory(
      "./imports/product-store/microservices/",
      options.env
    );

    const fileName = `${input.productName}_${input.uiName}.json`;
    const filePath = path.join(importsDir, fileName);

    if (options.dryRun) {
      console.log(`Dry Run: Would remove file at ${filePath}`);
    } else {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File ${filePath} removed successfully.`);
      } else {
        console.log(`File ${filePath} does not exist.`);
      }
    }

    console.log("Microservices removal completed successfully.");
  }
}
