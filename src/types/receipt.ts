type Receipt = {
  receiptId: number;
  uuid?: string;
  supplierId: number | null;
  batchId: number | null;
  quantity: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
};

export type ReceiptView = Omit<Receipt, "receiptId"> & {
  quantityUnit: string;
};

export type ReceiptDTO = Omit<
  Receipt,
  "receiptId" | "uuid" | "createdAt" | "updatedAt"
>;

// Type guard(s)
export function isReceiptView(data: any): data is ReceiptView {
  return (
    data !== null &&
    typeof data === "object" &&
    "quantityUnit" in data &&
    typeof data.quantityUnit === "string"
  );
}

export function isReceiptDTO(data: any): data is ReceiptDTO {
  return (
    data !== null &&
    typeof data === "object" &&
    "supplierId" in data &&
    typeof data.supplierId === "number"
  );
}
