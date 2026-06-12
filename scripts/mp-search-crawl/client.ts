import type { MpSearchResponse } from "./types";

const SEARCH_BASE = "https://mp-search-api.tcgplayer.com";
const DEFAULT_MPFEv = "5199";

export type MpSearchRequestOptions = {
  productLineName: string;
  from: number;
  size: number;
  query?: string;
  inStockOnly?: boolean;
  shippingCountry?: string;
  mpfev?: string;
  cookie?: string;
};

export function buildSearchBody(options: {
  productLineName: string;
  from: number;
  size: number;
  inStockOnly: boolean;
  shippingCountry: string;
}) {
  const listingFilters: Record<string, unknown> = {
    term: {
      sellerStatus: "Live",
      channelId: 0,
    },
    range: options.inStockOnly ? { quantity: { gte: 1 } } : {},
    exclude: {
      channelExclusion: 0,
    },
  };

  return {
    algorithm: "sales_dismax",
    from: options.from,
    size: options.size,
    filters: {
      term: {
        productLineName: [options.productLineName],
      },
      range: {},
      match: {},
    },
    listingSearch: {
      context: {
        cart: {
          packages: {},
        },
      },
      filters: listingFilters,
    },
    context: {
      cart: {
        packages: {},
      },
      shippingCountry: options.shippingCountry,
      userProfile: {},
    },
    settings: {
      useFuzzySearch: true,
      didYouMean: {},
    },
    sort: {},
  };
}

export class MpSearchClient {
  constructor(
    private readonly options: {
      delayMs: number;
      mpfev: string;
      cookie?: string;
    },
  ) {}

  private async delay() {
    if (this.options.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.options.delayMs));
    }
  }

  async searchPage(request: MpSearchRequestOptions): Promise<MpSearchResponse> {
    await this.delay();

    const q = encodeURIComponent(request.query ?? "");
    const isList = "false";
    const mpfev = request.mpfev ?? this.options.mpfev;
    const url = `${SEARCH_BASE}/v1/search/request?q=${q}&isList=${isList}&mpfev=${mpfev}`;

    const body = buildSearchBody({
      productLineName: request.productLineName,
      from: request.from,
      size: request.size,
      inStockOnly: request.inStockOnly ?? true,
      shippingCountry: request.shippingCountry ?? "VN",
    });

    const headers: Record<string, string> = {
      accept: "application/json, text/plain, */*",
      "content-type": "application/json",
      origin: "https://www.tcgplayer.com",
      referer: `https://www.tcgplayer.com/search/${request.productLineName}/product`,
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    };

    if (request.cookie ?? this.options.cookie) {
      headers.cookie = request.cookie ?? this.options.cookie ?? "";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `mp-search-api ${response.status}: ${text.slice(0, 300)}`,
      );
    }

    const json = (await response.json()) as {
      errors?: unknown[];
      results?: MpSearchResponse[];
    };

    const page = json.results?.[0];
    if (!page) {
      throw new Error("mp-search-api: response khong co results[0]");
    }

    return page;
  }
}

export function resolveMpfev() {
  return process.env.TCG_MP_FEV ?? DEFAULT_MPFEv;
}
