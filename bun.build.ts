import { readFileSync, writeFileSync } from "node:fs";
import packageJson from "./package.json";

const externalPackages = [
	...Object.keys(packageJson.dependencies ?? {}),
	...Object.keys(packageJson.devDependencies ?? {}),
];

const result = await Bun.build({
	entrypoints: ["./src/main.ts"],
	outdir: "./dist",
	target: "node",
	format: "esm",
	external: externalPackages,
	naming: "index.[ext]",
});

if (!result.success) {
	console.error("Build failed:");
	for (const log of result.logs) {
		console.error(log);
	}
	process.exit(1);
}

// Prepend shebang to dist/index.js
const outputPath = "./dist/index.js";
const content = readFileSync(outputPath, "utf-8");
writeFileSync(outputPath, `#!/usr/bin/env node\n${content}`);

console.log("Build complete: dist/index.js");
