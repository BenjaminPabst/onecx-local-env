/*
Source is a values.yaml file at a certain path (e.g. /path/to/values.yaml)
Goal is to adapt / create relevant json files in ./imports/ of the local environment

Permissions:
./imports/permissions/
Each ui has own file:
onecx-workspace_onecx-workspace-ui.json:
{
    "name": "onecx-workspace-ui",
    "permissions": [
        {"resource": "MENU", "action": "CREATE"},
        {"resource": "MENU", "action": "DELETE"},
        {"resource": "MENU", "action": "EDIT"},
        {"resource": "MENU", "action": "SAVE"},
        {"resource": "MENU", "action": "DRAG_DROP"},
        {"resource": "MENU", "action": "VIEW"},
        {"resource": "MENU", "action": "EXPORT"},
        {"resource": "MENU", "action": "IMPORT"},
        {"resource": "MENU", "action": "GRANT"},
        {"resource": "WORKSPACE", "action": "CREATE"},
        {"resource": "WORKSPACE", "action": "DELETE"},
        {"resource": "WORKSPACE", "action": "EDIT"},
        {"resource": "WORKSPACE", "action": "SAVE"},
        {"resource": "WORKSPACE", "action": "SEARCH"},
        {"resource": "WORKSPACE", "action": "VIEW"},
        {"resource": "WORKSPACE", "action": "EXPORT"},
        {"resource": "WORKSPACE", "action": "IMPORT"},
        {"resource": "WORKSPACE_CONTACT", "action": "VIEW"},
        {"resource": "WORKSPACE_INTERNAL", "action": "VIEW"},
        {"resource": "WORKSPACE_PRODUCTS", "action": "VIEW"},
        {"resource": "WORKSPACE_PRODUCTS", "action": "REGISTER"},
        {"resource": "WORKSPACE_ROLE", "action": "CREATE"},
        {"resource": "WORKSPACE_ROLE", "action": "DELETE"},
        {"resource": "WORKSPACE_ROLE", "action": "EDIT"},
        {"resource": "WORKSPACE_ROLE", "action": "VIEW"},
        {"resource": "WORKSPACE_SLOT", "action": "CREATE"},
        {"resource": "WORKSPACE_SLOT", "action": "DELETE"},
        {"resource": "WORKSPACE_SLOT", "action": "EDIT"},
        {"resource": "WORKSPACE_SLOT", "action": "VIEW"}
    ]
}

Corresponds to values.yml at
app.operator.permission:
permission:
      enabled: true
      spec:
        permissions:
          WORKSPACE:
            CREATE: Create workspace
            DELETE: Delete workspace
            EDIT: Edit workspace
            SEARCH: Search workspace
            VIEW: View mode for workspace
            EXPORT: Export workspace
            IMPORT: Import workspace
            GOTO_PERMISSION: Go to Permission Management
            GOTO_APP_STORE: Go to Application Store
          WORKSPACE_CONTACT:
            VIEW: View workspace contact
          WORKSPACE_INTERNAL:
            VIEW: View workspace internal
          WORKSPACE_ROLE:
            CREATE: Create a workspace role
            DELETE: Delete a workspace role
            EDIT: Change workspace role
            VIEW: View workspace roles
          WORKSPACE_SLOT:
            CREATE: Create a workspace slot
            DELETE: Delete a workspace slot
            EDIT: Change workspace slot
            VIEW: View workspace slots
          WORKSPACE_PRODUCTS:
            VIEW: View workspace products
            REGISTER: Register/Deregister products
          MENU:
            CREATE: Create menu
            DELETE: Delete menu
            EDIT: Edit menu
            VIEW: View menu
            DRAG_DROP: Drag & drop menu item
            GRANT: Assign roles to menu item
            EXPORT: Export menu
            IMPORT: Import menu

Folder ./imports/assignments/
One file for all: onecx.json

Needs to be adapted at path:
assignments.onecx-workspace looking like
"onecx-workspace": {
			"onecx-workspace-bff": {
				"onecx-admin": {
					"assignment": [ "read", "write", "delete" ],
					"menu": [ "read", "write", "delete" ],
					"role": [ "read", "write", "delete" ],
					"slot": [ "read", "write", "delete" ],
					"workspace": [ "read", "write", "delete" ],
					"product": [ "read", "write", "delete" ]
				}
			},
			"onecx-workspace-ui": {
				"onecx-admin": {
					"MENU": [ "CREATE", "DELETE", "EDIT", "SAVE", "DRAG_DROP", "VIEW", "EXPORT", "IMPORT", "GRANT" ],
					"WORKSPACE": [ "CREATE", "DELETE", "EDIT", "SAVE", "SEARCH", "VIEW", "EXPORT", "IMPORT" ],
					"WORKSPACE_CONTACT": [ "VIEW" ],
					"WORKSPACE_INTERNAL": [ "VIEW" ],
					"WORKSPACE_PRODUCTS": [ "VIEW", "REGISTER" ],
					"WORKSPACE_ROLE": [ "CREATE", "DELETE", "EDIT", "VIEW" ],
					"WORKSPACE_SLOT": [ "CREATE", "DELETE", "EDIT", "VIEW" ]
				}
			}
		},

For UI only second section inside object is relevant, needs to be synchronized to values.yml content        
*/

import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import {
  SynchronizationStep,
  SynchronizationStepOptions,
} from "../../util/synchronization-step";
import { SyncUIData } from "./sync-ui";

export interface SyncPermissionsParameters extends SyncUIData {
  customUiName: string;
}

export class SyncPermissions implements SynchronizationStep {
  synchronize(
    input: SyncPermissionsParameters,
    options: SynchronizationStepOptions
  ): void {
    let importsDir = path.resolve("./imports/permissions");
    if (options.pathToLocalEnv) {
      const localEnvPath = path.resolve(options.pathToLocalEnv);
      importsDir = path.resolve(localEnvPath, "imports/permissions");
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
      !values.app.operator.permission
    ) {
      throw new Error("Invalid values file format");
    }

    const permissions = values.app.operator.permission.spec.permissions;

    // Check if permissions are empty
    if (!permissions || Object.keys(permissions).length === 0) {
      console.log(
        "No permissions found in values file. Skipping synchronization."
      );
      return;
    }
    // Check if repository is provided or custom name is provided
    if (!values.app.image.repository && !input.customUiName) {
      throw new Error(
        "No repository found in values file and no custom name provided."
      );
    }
    let uiName = input.customUiName;
    if (values.app.image.repository) {
      uiName = values.app.image.repository.split("/").pop();
    }

    const fileName = `${input.productName}_${uiName}.json`;
    const filePath = path.join(importsDir, fileName);

    const permissionFile: {
      name: string;
      permissions: { resource: string; action: string }[];
    } = { name: uiName, permissions: [] };

    // Build permissions array
    for (const [resource, uiPermissions] of Object.entries(permissions) as [
      string,
      any
    ][]) {
      permissionFile.permissions.push(
        ...Object.keys(uiPermissions).map((action: string) => ({
          resource,
          action,
        }))
      );
    }

    if (dryRun) {
      console.log(
        `Dry Run: Would write to ${filePath} with content:`,
        JSON.stringify(permissionFile, null, 2)
      );
    } else {
      fs.writeFileSync(filePath, JSON.stringify(permissionFile, null, 2));
    }

    console.log("Permissions synchronized successfully.");
  }
}
