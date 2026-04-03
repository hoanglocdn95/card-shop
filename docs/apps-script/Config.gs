const CONFIG = {
  SHEETS: {
    ORDERS: {
      name: "Orders",
      headers: [
        "orderCode",
        "createdAt",
        "facebookName",
        "note",
        "total",
      ],
    },
    ORDER_ITEMS: {
      name: "OrderItems",
      headers: [
        "orderCode",
        "productName",
        "price",
        "quantity",
        "rarity",
        "lineTotal",
      ],
    },
    KHO: {
      name: "Kho",
      headers: ["key", "stock"],
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
  SCRIPT_PROPERTIES: {
    API_TOKEN: "API_TOKEN",
  },
  DEFAULT_LIST_LIMIT: 50,
  MAX_LIST_LIMIT: 200,
};
