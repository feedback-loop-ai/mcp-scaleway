import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/unit/**/*.test.ts", "tests/contract/**/*.test.ts"],
		coverage: {
			provider: "v8",
			include: ["src/**/*.ts"],
			exclude: ["src/**/*.d.ts", "src/main.ts"],
			thresholds: {
				lines: 100,
				branches: 100,
			},
		},
	},
});
