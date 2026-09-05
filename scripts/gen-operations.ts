import { readFileSync, writeFileSync } from "node:fs";
import { deriveOperationMetadata } from "../src/gateway/metadata.js";

const matrix = JSON.parse(
	readFileSync(new URL("../tests/parity-matrix.json", import.meta.url), "utf8"),
);
writeFileSync(
	new URL("../src/gateway/operations.json", import.meta.url),
	`${JSON.stringify(deriveOperationMetadata(matrix), null, "\t")}\n`,
);
