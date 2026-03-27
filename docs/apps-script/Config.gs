const CONFIG = {
  SHEETS: {
    ORDERS: {
      name: "Orders",
      headers: [
        "orderCode",
        "createdAt",
        "customerName",
        "phone",
        "address",
        "note",
        "subtotal",
        "total",
        "status",
      ],
    },
    ORDER_ITEMS: {
      name: "OrderItems",
      headers: [
        "orderCode",
        "productId",
        "productName",
        "price",
        "quantity",
        "lineTotal",
      ],
    },
  },
  STYLE: {
    MAX_COLUMN_WIDTH: 200,
    HEADER_TEXT_COLOR: "#1F2937",
    HEADER_COLORS: [
      "#DBEAFE",
      "#E0E7FF",
      "#EDE9FE",
      "#FCE7F3",
      "#FEE2E2",
      "#FEF3C7",
      "#DCFCE7",
      "#D1FAE5",
      "#E0F2FE",
    ],
    ODD_ROW_COLOR: "#FFFFFF",
    EVEN_ROW_COLOR: "#F8FAFC",
  },
  STATUS: {
    CONFIRMED: "CONFIRMED",
  },
  SCRIPT_PROPERTIES: {
    API_TOKEN: "API_TOKEN",
  },
  DEFAULT_LIST_LIMIT: 50,
  MAX_LIST_LIMIT: 200,
};
