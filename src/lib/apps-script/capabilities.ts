type AppsScriptCapabilityState = {
  listProducts: boolean | null;
};

const state: AppsScriptCapabilityState = {
  listProducts: null,
};

export function isListProductsEnabled() {
  if (process.env.CATALOG_PROVIDER === "local") {
    return false;
  }
  if (process.env.CATALOG_PROVIDER === "apps_script") {
    return true;
  }
  return state.listProducts !== false;
}

export function markListProductsUnsupported() {
  state.listProducts = false;
}

export function markListProductsSupported() {
  state.listProducts = true;
}

export function shouldLogListProductsFallback() {
  return state.listProducts === null;
}
