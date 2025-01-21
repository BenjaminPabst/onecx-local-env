import fs from "fs";
import yaml from "js-yaml";
import { OnecxCommand } from "../onecx-command";
import { SyncMicrofrontends } from "./sync-microfrontends";
import { SyncMicroservices } from "./sync-microservices";
import { SyncPermissions } from "./sync-permissions";
import { SyncProducts } from "./sync-products";
import { SyncSlots } from "./sync-slots";
export interface SyncUIData {
  productName: string;
  pathToValues: string;
  basePath: string;
}

export class RemoveSyncUICommand implements OnecxCommand<SyncUIData> {
  run(data: SyncUIData, options: { [key: string]: string }): void {
    console.log(
      "Removing Sync UI with data: ",
      data,
      " and options: ",
      options
    );

    // Validate if the values file exists
    if (!fs.existsSync(data.pathToValues)) {
      throw new Error(`Values file not found at path: ${data.pathToValues}`);
    }

    const valuesFile = fs.readFileSync(data.pathToValues, "utf8");
    const values = yaml.load(valuesFile) as any;

    // Check if repository is provided or custom name is provided
    if (!values.app.image.repository && !options["name"]) {
      throw new Error(
        "No repository found in values file and no custom name provided."
      );
    }
    let uiName = options["name"];
    if (values.app.image.repository) {
      uiName = values.app.image.repository.split("/").pop();
    }

    // Microfrontends
    new SyncMicrofrontends().removeSynchronization(
      values,
      {
        ...data,
        uiName,
      },
      options
    );
    // Permissions
    new SyncPermissions().removeSynchronization(
      values,
      {
        ...data,
        uiName,
        roleName: options["role"],
      },
      options
    );
    // Microservices
    new SyncMicroservices().removeSynchronization(
      values,
      {
        ...data,
        uiName,
      },
      options
    );

    // Products
    new SyncProducts().removeSynchronization(
      values,
      {
        ...data,
        icon: options["icon"],
      },
      options
    );
    // Slots
    new SyncSlots().removeSynchronization(
      values,
      {
        ...data,
        uiName,
      },
      options
    );

    console.log("UI removed successfully.");
  }
}
