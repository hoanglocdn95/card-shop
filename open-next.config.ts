// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// `opennextjs-cloudflare build` runs the package.json "build" script by default.
// We set "build" to the OpenNext pipeline, so the inner Next.js compile must use
// an explicit command (avoid infinite recursion: build → opennext → build → …).
export default {
	...defineCloudflareConfig({
		// For best results consider enabling R2 caching
		// See https://opennext.js.org/cloudflare/caching for more details
		// incrementalCache: r2IncrementalCache
	}),
	buildCommand: "npx next build",
};
