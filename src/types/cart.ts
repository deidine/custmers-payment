export type CartItem = {
  productUuid: string;
  quantity: number;
};

export type Cart = {
  cartId: number;
  userUuid?: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
};

export type CartDTO = Omit<Cart, "cartId" | "createdAt" | "updatedAt">;
