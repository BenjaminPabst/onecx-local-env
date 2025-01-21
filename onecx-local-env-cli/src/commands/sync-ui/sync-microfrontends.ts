/*
Source is a values.yaml file at a certain path (e.g. /path/to/values.yaml)
Goal is to adapt / create relevant json files in ./imports/ of the local environment


Folder ./imports/product-store/microfrontends/
Contains microfronted JSON Configurations, for new UI, new file is created with the following content:
onecx-workspace_onecx-workspace-ui_main.json
{
    "appVersion": "xxx",
    "appName": "onecx-workspace-ui",
    "description": "onecx-workspace-ui",
    "remoteBaseUrl": "/mfe/workspace/",
    "remoteEntry": "/mfe/workspace/remoteEntry.js",
    "note": "Imported MFE",
    "exposedModule": "./OneCXWorkspaceModule",
    "technology": "WEBCOMPONENTMODULE",
    "remoteName": "onecx-workspace",
    "tagName": "ocx-workspace-component",
    "type": "MODULE",
    "deprecated": false,
    "undeployed": false
}

This matches the values.yml section under app:
  operator:
    # Microfrontend
    microfrontend:
      enabled: true
      specs:
        main:
          exposedModule: "./OneCXWorkspaceModule"
          description: "OneCX Workspace UI"
          note: "OneCX Workspace UI auto import via MF operator"
          type: MODULE
          technology: WEBCOMPONENTMODULE
          remoteName: onecx-workspace
          tagName: ocx-workspace-component
          endpoints:
            - name: workspace-detail
              path: /{workspace-name}
        user-avatar-menu:
          exposedModule: "./OneCXUserAvatarMenuComponent"
          description: "User avatar menu component"
          type: COMPONENT
          technology: WEBCOMPONENTMODULE
          remoteName: onecx-workspace
          tagName: ocx-user-avatar-menu-component

Each microfrontend is a separate file in the folder ./imports/product-store/microfrontends/,
with the suffix for the respective key          
*/

import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import {
  SynchronizationStep,
  SynchronizationStepOptions,
} from "../../util/synchronization-step";
import { SyncUIData } from "./sync-ui";

export interface SyncMicrofrontendsParameters extends SyncUIData {
  customUiName: string;
}

export class SyncMicrofrontends implements SynchronizationStep {
  synchronize(
    input: SyncMicrofrontendsParameters,
    options: SynchronizationStepOptions
  ): void {
    let importsDir = path.resolve("./imports/product-store/microfrontends/");
    if (options.env) {
      const localEnvPath = path.resolve(options.env);
      importsDir = path.resolve(
        localEnvPath,
        "imports/product-store/microfrontends"
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
    const microfrontends = values.app.operator.microfrontend.specs;

    for (const [key, spec] of Object.entries(microfrontends) as [
      string,
      any
    ][]) {
      const fileName = `${input.productName}_${uiName}-${key}.json`;
      const filePath = path.join(importsDir, fileName);

      const jsonContent = {
        appVersion: "xxx",
        appName: spec.remoteName,
        description: spec.description,
        remoteBaseUrl: `/mfe/${spec.remoteName}/`,
        remoteEntry: `/mfe/${spec.remoteName}/remoteEntry.js`,
        note: spec.note || "Imported MFE",
        exposedModule: spec.exposedModule,
        technology: spec.technology,
        remoteName: spec.remoteName,
        tagName: spec.tagName,
        type: spec.type,
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

    console.log("Microfrontends synchronized successfully.");
  }
}
