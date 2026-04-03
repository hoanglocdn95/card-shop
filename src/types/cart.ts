export type CartItem = {
  productId: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
  rarity?: string;
};
