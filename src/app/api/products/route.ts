import { NextRequest, NextResponse } from "next/server";

import { fetchProducts } from "@/lib/tcg-api";
import { Product, ProductSort } from "@/types/product";

function sortProducts(products: Product[], sort: ProductSort) {
  if (sort === "price-asc") {
    return [...products].sort((a, b) => a.price - b.price);
  }
  if (sort === "price-desc") {
    return [...products].sort((a, b) => b.price - a.price);
  }
  if (sort === "name-asc") {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sort === "name-desc") {
    return [...products].sort((a, b) => b.name.localeCompare(a.name));
  }
  return products;
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") ?? undefined;
    const sortParam = request.nextUrl.searchParams.get("sort");
    const sort: ProductSort =
      sortParam === "price-asc" ||
      sortParam === "price-desc" ||
      sortParam === "name-asc" ||
      sortParam === "name-desc" ||
      sortParam === "relevance"
        ? (sortParam as ProductSort)
        : "relevance";

    const pageParam = Number(request.nextUrl.searchParams.get("page") ?? "1");
    const pageSizeParam = Number(
      request.nextUrl.searchParams.get("pageSize") ?? "20",
    );
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const allowedPageSizes = new Set([50, 100]);
    const pageSize =
      Number.isFinite(pageSizeParam) && allowedPageSizes.has(pageSizeParam)
        ? pageSizeParam
        : 50;

    const result = await fetchProducts({ searchQuery: query, page, pageSize });
    const response = {
      products: sortProducts(result.products, sort),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        totalCount: result.totalCount,
        hasNextPage: result.hasNextPage,
      },
      sort,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ message }, { status: 500 });
  }
}
