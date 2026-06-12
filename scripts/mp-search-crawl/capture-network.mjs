import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const url =
  "https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&view=grid&page=1";

const captures = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
  locale: "en-US",
});
const page = await context.newPage();

page.on("response", async (response) => {
  const reqUrl = response.url();
  if (!reqUrl.includes("mp-search-api.tcgplayer.com")) return;
  if (!reqUrl.includes("search")) return;

  let postData;
  try {
    postData = response.request().postData();
  } catch {
    postData = null;
  }

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  const r0 = body?.results?.[0];
  captures.push({
    url: reqUrl,
    method: response.request().method(),
    postData: postData ? JSON.parse(postData) : null,
    status: response.status(),
    totalResults: r0?.totalResults,
    resultsCount: r0?.results?.length ?? 0,
    sample: r0?.results?.[0] ?? null,
    resultId: r0?.resultId,
  });
});

await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
await page.waitForTimeout(3000);

writeFileSync(
  "scripts/mp-search-crawl/.capture-output.json",
  JSON.stringify(captures, null, 2),
);
console.log(JSON.stringify(captures, null, 2));

await browser.close();
