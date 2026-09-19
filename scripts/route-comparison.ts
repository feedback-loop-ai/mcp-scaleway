/**
 * OpenAPI paths do not include a request's query string. Keep that metadata for
 * separate parameter review while comparing the exact HTTP method and path.
 * Do not normalize hosts, namespaces, template names, case, or trailing slashes.
 */
export function comparePublishedRoute(api: string, published: ReadonlySet<string>) {
	const queryStart = api.indexOf("?");
	const endpoint = queryStart === -1 ? api : api.slice(0, queryStart);
	const query = queryStart === -1 ? undefined : api.slice(queryStart + 1);
	return { endpoint, query, published: published.has(endpoint) };
}
