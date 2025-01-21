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

Folder ./imports/product-store/microservices/
Each UI has own file:
onecx-workspace_onecx-workspace-ui.json:
{
    "version": "xxx",
    "description": "onecx-workspace-ui",
    "name": "onecx-workspace-ui",
    "type": "ui"
}

Folder ./imports/product-store/products/
Each Product has own file:
onecx-workspace.json:
{
    "version": "xxx",
    "description": "OneCX Workspace",
    "basePath": "/workspace",
    "displayName": "OneCX Workspace",
    "iconName": "pi-ellipsis-h"
}

Folder ./imports/product-store/slots/
onecx-workspace_onecx-workspace-ui_onecx-avatar-image.json:
{
    "description": "User Profile avatar image",
    "name": "onecx-avatar-image",
    "deprecated": false,
    "undeployed": false
}

Corresponds to values.yml at
app.operators.slot:

    slot:
      enabled: true
      specs:
        onecx-avatar-image:
          name: 'onecx-avatar-image'
          description: 'User Profile avatar image'

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

*/

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

export class SyncUICommand implements OnecxCommand<SyncUIData> {
  run(data: SyncUIData, options: { [key: string]: string }): void {
    console.log("Syncing UI with data: ", data, " and options: ", options);

    // Splitting sync into steps: Microfrontends, Microservices, Products, Slots, Permissions

    // Microfrontends
    new SyncMicrofrontends().synchronize(
      {
        ...data,
        customUiName: options["name"],
      },
      { dryRun: true, ...options }
    );
    // Permissions
    new SyncPermissions().synchronize(
      {
        ...data,
        customUiName: options["name"],
        roleName: options["role"],
      },
      { dryRun: true, ...options }
    );
    // Microservices
    new SyncMicroservices().synchronize(
      {
        ...data,
        customUiName: options["name"],
      },
      { dryRun: true, ...options }
    );

    // Products
    new SyncProducts().synchronize(
      {
        ...data,
        customUiName: options["name"],
        icon: options["icon"],
      },
      { dryRun: true, ...options }
    );
    // Slots
    new SyncSlots().synchronize(
      {
        ...data,
        customUiName: options["name"],
      },
      { dryRun: true, ...options }
    );
  }
}
