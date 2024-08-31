import * as izly from "../src";
import { credentials } from "./_credentials";
import { persist } from "./_persisted-session";

void async function main () {
  const { uid } = await izly.login(credentials.identifier, credentials.secret);

  // NOTE: `prompt` is only available on Bun
  // TODO: replace with inquirer probably...
  const url = prompt(`Please, enter the URL you want to tokenize for UID '${uid}':`);
  if (!url) throw new Error("No URL provided");

  const { configuration, identification, profile, balance } = await izly.tokenize(url);

  // Let's save the objects for usage in other files without
  // re-doing the whole authentication...
  await persist(identification, configuration);

  // Greet the user !
  console.log(`Welcome ${profile.firstName} ${profile.lastName} (${profile.email}) !`);
  console.log(`You're currently in the ${configuration.currency} currency.`);

  // Explain the configuration.
  console.log("\nHere's the configuration of your instance:");
  console.log("- Money can get in between", configuration.moneyInMin, "and", configuration.moneyInMax);
  console.log("- Money can get out between", configuration.moneyOutMin, "and", configuration.moneyOutMax);
  console.log("- You can P2P pay between", configuration.p2pPayMin, "and", configuration.p2pPayMax);
  console.log("- You can P2P partially pay between", configuration.p2pPayPartMin, "and", configuration.p2pPayPartMax);

  // Show the current balance.
  console.log("\nYour balance is currently at", balance.value, configuration.currency);
  console.log("Your cash balance is currently at", balance.cashValue, configuration.currency);

  // A bit more of explanations on the current context.
  console.log("\nThis session", identification.sessionID, "has been saved to be reused with the keys in the 'identification' variable.");
  console.log("You can also use this variable to make further requests.");
  console.warn("Note that there's no way to retrieve again 'configuration' and 'identification' values so make sure to store everything you need from them.");

  console.log("\nAnyway, since you're in the examples, I've exported the objects in a JSON file so you can run");
  console.log("other examples without re-doing the whole authentication process !");
}();
