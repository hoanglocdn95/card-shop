function doGet(e) {
  try {
    assertAuth_(e, null);

    const action = sanitizeString_(e.parameter.action);

    if (action === "setup") {
      const result = setupCardShopSheets();
      return jsonSuccess_({ result: result });
    }

    if (action === "listOrders") {
      const limit = e.parameter.limit;
      const orders = listOrders_(limit);
      return jsonSuccess_({ orders: orders });
    }

    if (action === "getOrder") {
      const orderCode = e.parameter.orderCode;
      const result = getOrderByCode_(orderCode);
      if (!result) return jsonError_("Order not found", "NOT_FOUND");
      return jsonSuccess_(result);
    }

    return jsonError_("Invalid action for GET", "INVALID_ACTION");
  } catch (err) {
    return jsonError_(err.message, "GET_FAILED");
  }
}

function doPost(e) {
  try {
    const body = parseJsonBody_(e);
    assertAuth_(e, body);

    const action = sanitizeString_(body.action);

    if (action === "createOrder") {
      const result = createOrder_(body.payload || {});
      return jsonSuccess_({ result: result });
    }

    if (action === "setup") {
      const result = setupCardShopSheets();
      return jsonSuccess_({ result: result });
    }

    return jsonError_("Invalid action for POST", "INVALID_ACTION");
  } catch (err) {
    return jsonError_(err.message, "POST_FAILED");
  }
}
