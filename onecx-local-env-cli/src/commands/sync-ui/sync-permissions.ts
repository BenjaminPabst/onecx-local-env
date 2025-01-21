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
import { getImportsDirectory } from "../../util/utils";

export interface SyncPermissionsParameters extends SyncUIData {
  uiName: string;
  roleName: string;
}

export class SyncPermissions implements SynchronizationStep {
  synchronize(
    values: any,
    parameters: SyncPermissionsParameters,
    { dryRun, env }: SynchronizationStepOptions
  ): void {
    let importsDir = getImportsDirectory("./imports/permissions", env);

    if (
      !values.app ||
      !values.app.operator ||
      !values.app.operator.permission ||
      !values.app.operator.permission.spec ||
      !values.app.operator.permission.spec.permissions ||
      Object.keys(values.app.operator.permission.spec.permissions).length === 0
    ) {
      console.log(
        "No permissions found in values file. Skipping synchronization."
      );
      return;
    }
    const fileName = `${parameters.productName}_${parameters.uiName}.json`;
    const filePath = path.join(importsDir, fileName);

    const permissionFile: {
      name: string;
      permissions: { resource: string; action: string }[];
    } = { name: parameters.uiName, permissions: [] };

    // Build permissions array
    for (const [resource, uiPermissions] of Object.entries(
      values.app.operator.permission.spec.permissions
    ) as [string, any][]) {
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

    // Sync assignments
    let assignmentsDir = getImportsDirectory("./imports/assignments", env);
    const assignmentsFilePath = path.join(assignmentsDir, "onecx.json");

    if (!fs.existsSync(assignmentsFilePath)) {
      throw new Error(
        `Assignments file not found at path: ${assignmentsFilePath}`
      );
    }

    const assignmentsFile = fs.readFileSync(assignmentsFilePath, "utf8");
    const assignments = JSON.parse(assignmentsFile);

    // Section for product in assignments
    if (!assignments.assignments[parameters.productName]) {
      assignments.assignments[parameters.productName] = {};
    }
    const productSection = assignments.assignments[parameters.productName];
    // Section for UI in product section
    if (!productSection[parameters.uiName]) {
      productSection[parameters.uiName] = {};
    }
    const uiSection = productSection[parameters.uiName];
    // Target role
    const targetRole = parameters.roleName;
    // Clear & Set permissions
    uiSection[targetRole] = {};
    for (const [resource, uiPermissions] of Object.entries(
      values.app.operator.permission.spec.permissions
    ) as [string, any][]) {
      uiSection[targetRole][resource] = Object.keys(uiPermissions);
    }

    if (dryRun) {
      console.log(
        `Dry Run: Would write to ${assignmentsFilePath} with content:`,
        JSON.stringify(assignments, null, 2)
      );
    } else {
      fs.writeFileSync(
        assignmentsFilePath,
        JSON.stringify(assignments, null, 2)
      );
    }

    console.log("Permissions synchronized successfully.");
  }
}
