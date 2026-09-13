import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["evals/*.eval.ts"],
		testTimeout: 180_000,
		hookTimeout: 60_000,
	},
});
