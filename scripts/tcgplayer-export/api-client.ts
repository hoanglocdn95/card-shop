import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { sleep } from "./utils";
import type {
  TcgCatalogProduct,
  TcgCategory,
  TcgGroup,
  TcgProductPrice,
} from "./types";

type PagedResult<T> = {
  totalItems: number;
  success: boolean;
  errors: string[];
  results: T[];
};

type TokenCache = {
  access_token: string;
  expires_at_ms: number;
};

const API_BASE = "https://api.tcgplayer.com";
const DEFAULT_VERSION = "v1.39.0";

export class TcgplayerApiClient {
  private readonly version: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly delayMs: number;
  private readonly tokenCachePath: string;

  constructor(options: {
    publicKey: string;
    privateKey: string;
    version?: string;
    delayMs?: number;
    cacheDir: string;
  }) {
    this.publicKey = options.publicKey;
    this.privateKey = options.privateKey;
    this.version = options.version ?? DEFAULT_VERSION;
    this.delayMs = options.delayMs ?? 300;
    this.tokenCachePath = resolve(options.cacheDir, "token.json");
    mkdirSync(dirname(this.tokenCachePath), { recursive: true });
  }

  private async getBearerToken() {
    if (existsSync(this.tokenCachePath)) {
      const cached = JSON.parse(readFileSync(this.tokenCachePath, "utf8")) as TokenCache;
      if (cached.expires_at_ms > Date.now() + 60_000) {
        return cached.access_token;
      }
    }

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.publicKey,
      client_secret: this.privateKey,
    });

    const response = await fetch(`${API_BASE}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Token request failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    const cache: TokenCache = {
      access_token: data.access_token,
      expires_at_ms: Date.now() + data.expires_in * 1000,
    };
    writeFileSync(this.tokenCachePath, JSON.stringify(cache, null, 2), "utf8");
    return cache.access_token;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await this.getBearerToken();
    const response = await fetch(`${API_BASE}/${this.version}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });

    if (this.delayMs > 0) {
      await sleep(this.delayMs);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${path} failed (${response.status}): ${text}`);
    }

    return (await response.json()) as T;
  }

  async listCategories(limit = 100, offset = 0) {
    const data = await this.request<PagedResult<TcgCategory>>(
      `/catalog/categories?limit=${limit}&offset=${offset}`,
    );
    return data;
  }

  async listAllCategories() {
    const all: TcgCategory[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const page = await this.listCategories(limit, offset);
      all.push(...page.results);
      offset += limit;
      if (offset >= page.totalItems || page.results.length === 0) break;
    }

    return all;
  }

  async listCategoryGroups(categoryId: number, limit = 100, offset = 0) {
    return this.request<PagedResult<TcgGroup>>(
      `/catalog/categories/${categoryId}/groups?limit=${limit}&offset=${offset}`,
    );
  }

  async listAllCategoryGroups(categoryId: number) {
    const all: TcgGroup[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const page = await this.listCategoryGroups(categoryId, limit, offset);
      all.push(...page.results);
      offset += limit;
      if (offset >= page.totalItems || page.results.length === 0) break;
    }

    return all;
  }

  async listGroupProducts(
    categoryId: number,
    groupId: number,
    limit = 100,
    offset = 0,
  ) {
    const params = new URLSearchParams({
      categoryId: String(categoryId),
      groupId: String(groupId),
      productTypes: "Cards",
      getExtendedFields: "true",
      limit: String(limit),
      offset: String(offset),
    });
    return this.request<PagedResult<TcgCatalogProduct>>(
      `/catalog/products?${params.toString()}`,
    );
  }

  async listAllGroupProducts(categoryId: number, groupId: number) {
    const all: TcgCatalogProduct[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const page = await this.listGroupProducts(
        categoryId,
        groupId,
        limit,
        offset,
      );
      all.push(...page.results);
      offset += limit;
      if (offset >= page.totalItems || page.results.length === 0) break;
    }

    return all;
  }

  async getProductPrices(productIds: number[]) {
    if (productIds.length === 0) return [] as TcgProductPrice[];
    const joined = productIds.join(",");
    const data = await this.request<{
      success: boolean;
      errors: string[];
      results: TcgProductPrice[];
    }>(`/pricing/product/${joined}`);
    return data.results ?? [];
  }
}
