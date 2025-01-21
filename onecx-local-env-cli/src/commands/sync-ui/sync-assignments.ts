/**
 * 
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
