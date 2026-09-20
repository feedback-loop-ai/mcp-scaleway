import { checkHealth, startServer } from "./server.js";

const health = process.argv.slice(2).includes("--health");
const action = health
	? checkHealth().then((status) => console.log(JSON.stringify(status)))
	: startServer();

action.catch(() => {
	const status = JSON.stringify({ status: "error", check: health ? "local" : "startup" });
	if (health) console.log(status);
	else console.error(status);
	process.exit(1);
});
