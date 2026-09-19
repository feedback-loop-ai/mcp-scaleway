/** Build first. Install the actual tarball in isolation and check every stdio mode. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const exec = promisify(execFile);
const root = resolve(import.meta.dir, "..");
const directory = await mkdtemp(join(tmpdir(), "mcp-scaleway-packed-"));
const childEnv = {
	PATH: process.env.PATH ?? "",
	...(process.env.HOME ? { HOME: process.env.HOME } : {}),
};
const command = (file: string, args: string[], cwd = directory) =>
	exec(file, args, { cwd, env: childEnv, timeout: 90_000, maxBuffer: 2 * 1024 * 1024 });

try {
	const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
	const matrix = JSON.parse(await readFile(join(root, "tests/parity-matrix.json"), "utf8"));
	const gateway: string[] = matrix.meta.gateway_tools.map((row: { tool: string }) => row.tool);
	const flat = Object.entries(matrix)
		.filter(([area]) => area !== "meta")
		.flatMap(([, rows]) =>
			Object.values(rows as Record<string, { tool: string }>).map((row) => row.tool),
		);
	const { stdout: packOutput } = await command(
		"npm",
		["pack", "--json", "--pack-destination", directory],
		root,
	);
	const [packed] = JSON.parse(packOutput);
	assert.deepEqual(packed.files.map((file: { path: string }) => file.path).sort(), [
		"CHANGELOG.md",
		"LICENSE",
		"README.md",
		"dist/index.js",
		"dist/server.js",
		"package.json",
	]);
	await writeFile(join(directory, "package.json"), '{"private":true,"type":"module"}\n');
	await command(process.execPath, ["add", "--ignore-scripts", join(directory, packed.filename)]);
	const installed = join(directory, "node_modules", "mcp-scaleway");
	const sdk = JSON.parse(
		await readFile(join(directory, "node_modules/@modelcontextprotocol/sdk/package.json"), "utf8"),
	);
	const nodeVersion = (await command("node", ["--version"])).stdout.trim();
	await command("node", [
		"--input-type=module",
		"-e",
		'import { createServer } from "mcp-scaleway"; await createServer().close();',
	]);
	const modes = [];
	for (const mode of ["gateway", "flat", "both"] as const) {
		const errors: string[] = [];
		const client = new Client({ name: "packed-install-smoke", version: "1" });
		client.onerror = (error) => errors.push(error.message);
		const transport = new StdioClientTransport({
			command: "node",
			args: [join(installed, "dist/index.js")],
			cwd: directory,
			env: { ...childEnv, SCW_MCP_MODE: mode, SCW_ROUTER: "off" },
			stderr: "pipe",
		});
		let stderr = "";
		transport.stderr?.on("data", (chunk: Buffer) => {
			stderr += chunk.toString();
		});
		try {
			await client.connect(transport, { timeout: 15_000 });
			assert.equal(client.getServerVersion()?.version, pkg.version);
			const tools: Tool[] = [];
			const seenCursors = new Set<string>();
			let cursor: string | undefined;
			do {
				const listing = await client.listTools(cursor ? { cursor } : undefined);
				tools.push(...listing.tools);
				cursor = listing.nextCursor;
				if (cursor) {
					assert(!seenCursors.has(cursor), "Repeated pagination cursor");
					seenCursors.add(cursor);
				}
			} while (cursor);
			const expected =
				mode === "gateway" ? gateway : mode === "flat" ? flat : [...gateway, ...flat];
			assert.deepEqual(tools.map((tool) => tool.name).sort(), [...expected].sort());
			assert.deepEqual(errors, [], "Unexpected stdio protocol errors");
			assert.equal(stderr, "", "Unexpected server stderr");
			modes.push({
				mode,
				tools: tools.length,
				listingBytes: Buffer.byteLength(JSON.stringify(tools)),
			});
		} finally {
			await client.close();
			await transport.close();
		}
	}
	console.log(
		JSON.stringify(
			{ bun: Bun.version, node: nodeVersion, sdk: sdk.version, libraryImport: true, modes },
			null,
			2,
		),
	);
} finally {
	await rm(directory, { recursive: true, force: true });
}
