import type { Operation, OperationRegistry } from "../gateway/registry.js";

const ALIASES: Readonly<Record<string, string>> = {
	vm: "instance server",
	vms: "instance server",
	virtual: "instance",
	machine: "server",
	machines: "server",
	show: "list",
	find: "list",
	retrieve: "get",
	provision: "create",
	postgres: "postgresql",
	s3: "object storage",
	kubernetes: "k8s",
	kapsule: "k8s",
	kosmos: "k8s",
	restart: "action",
	reboot: "action",
};
const AREA_ALIASES: Readonly<Record<string, string>> = {
	rdb: "postgresql postgres mysql",
};
const STOPWORDS = new Set([
	"a",
	"an",
	"the",
	"my",
	"me",
	"in",
	"inside",
	"of",
	"on",
	"for",
	"to",
	"at",
	"with",
	"all",
	"cloud",
	"existing",
	"this",
	"please",
	"managed",
	"scaleway",
]);
const ACTIONS = new Set([
	"list",
	"get",
	"create",
	"update",
	"delete",
	"set",
	"add",
	"remove",
	"enable",
	"disable",
	"action",
	"read",
	"write",
	"start",
	"stop",
	"run",
]);

function words(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean)
		.flatMap((word) => (ALIASES[word] ?? word).split(" "))
		.filter((word) => !STOPWORDS.has(word))
		.map((word) =>
			word.length > 3 && word.endsWith("s") && word !== "redis" ? word.slice(0, -1) : word,
		);
}

/** Local retrieval only. Scores rank suggestions and are never model probabilities. */
export function localCandidates(
	registry: OperationRegistry,
	intent: string,
	context: string | undefined,
	limit: number,
): Operation[] {
	if (!Number.isInteger(limit) || limit < 1) return [];
	const query = [...new Set(words(`${intent} ${context ?? ""}`))];
	const resources = query.filter((word) => !ACTIONS.has(word));
	if (resources.length === 0) return [];
	return registry.operations
		.map((operation) => {
			const identity = new Set(
				words(`${operation.op} ${operation.area} ${AREA_ALIASES[operation.area] ?? ""}`),
			);
			const description = new Set(words(operation.description));
			const relevant = resources.some((word) => identity.has(word) || description.has(word));
			const score = relevant
				? query.reduce(
						(sum, word) => sum + (identity.has(word) ? 3 : description.has(word) ? 1 : 0),
						0,
					)
				: 0;
			return { operation, score };
		})
		.filter((hit) => hit.score > 0)
		.sort(
			(a, b) =>
				b.score - a.score ||
				a.operation.op.length - b.operation.op.length ||
				a.operation.op.localeCompare(b.operation.op),
		)
		.slice(0, Math.min(limit, 5))
		.map((hit) => hit.operation);
}
