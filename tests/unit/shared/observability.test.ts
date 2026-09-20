import { afterEach, describe, expect, it, vi } from "vitest";
import { dispatch } from "../../../src/shared/observability.js";

afterEach(() => vi.restoreAllMocks());

describe("safe dispatch traces", () => {
	it.each([false, true])(
		"logs exactly one outcome line for returned isError=%s",
		async (isError) => {
			const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);
			const clock = vi
				.spyOn(performance, "now")
				.mockReturnValueOnce(20)
				.mockReturnValueOnce(21.1234);
			const secret = "SECRET-RESPONSE";
			const original = { content: [{ type: "text" as const, text: secret }], isError };
			const result = await dispatch("instances_list_servers", () => original);
			expect(result.content).toBe(original.content);
			expect(stderr).toHaveBeenCalledOnce();
			const line = String(stderr.mock.calls[0][0]);
			expect(line.endsWith("\n")).toBe(true);
			expect(JSON.parse(line)).toEqual({
				event: "operation",
				op: "instances_list_servers",
				outcome: isError ? "error" : "success",
				durationMs: 1.123,
			});
			expect(line).not.toContain(secret);
			expect(clock).toHaveBeenCalledTimes(2);
		},
	);
	it("never logs raw thrown values and preserves the original exception", async () => {
		const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);
		const failure = new Error("SECRET-EXCEPTION");
		await expect(
			dispatch("instances_list_servers", () => {
				throw failure;
			}),
		).rejects.toBe(failure);
		expect(stderr).toHaveBeenCalledOnce();
		expect(String(stderr.mock.calls[0][0])).not.toContain(failure.message);
		expect(JSON.parse(String(stderr.mock.calls[0][0])).outcome).toBe("error");
	});
	it("does not let log stream errors fail a successful operation", async () => {
		vi.spyOn(process.stderr, "write").mockImplementation(() => {
			throw new Error("stream closed");
		});
		await expect(dispatch("scaleway_search", () => ({ content: [] }))).resolves.toMatchObject({
			content: [],
			structuredContent: { format: "content", data: [] },
		});
	});
});
