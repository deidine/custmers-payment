type Order = {
  orderId: number;
  uuid?: string;
  customerId: number;
  status?: string; // default: "Pending"
  createdAt: Date;
  updatedAt: Date;
};

export type OrderSummaryView = Omit<Order, "orderId" | "customerId"> & {
  totalAmount: number;
  customerName: string;
};

export type OrderDTO = Omit<
  Order,
  "orderId" | "uuid" | "createdAt" | "updatedAt"
>;
