import { Command } from "commander"; // add this line
import { SyncUICommand } from "./commands/sync-ui/sync-ui";

console.log(process.argv);

//add the following line
const program = new Command();
const cli = program
  .version("1.0.0")
  .description(
    "The onecx-local-env CLI helps to work with the local environment"
  );

cli
  .command("sync-ui")
  .argument("<productName>", "The name of the product")
  .argument("<basePath>", "The base path of the product")
  .argument("<pathToValues>", "The path to the values.yaml file of the UI")
  .option("-e, --env <path>", "Path to the local environment", "./")
  .option(
    "-n, --name <name>",
    "Custom name for the UI, if repository should not be used"
  )
  .option("-r, --role <role>", "Role name for the assignments", "onecx-admin")
  .option("-i, --icon <iconName>", "The icon of the product", "pi-briefcase")
  .action((productName, basePath, pathToValues, options) => {
    console.log("Syncing UI: ", pathToValues, productName, options);
    new SyncUICommand().run(
      {
        pathToValues,
        productName,
        basePath,
      },
      options
    );
  });

cli.parse(process.argv, {
  from: "node",
});
