import fs from "fs";
import path from "path";
import {
  SynchronizationStep,
  SynchronizationStepOptions,
} from "../../util/synchronization-step";
import { getImportsDirectory } from "../../util/utils";
import { SyncUIData } from "./sync-ui";

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
