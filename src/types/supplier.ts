export type Supplier = {
  supplierId: number;
  name: string;
  phoneNumber: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SupplierDTO = Omit<
  Supplier,
  "supplierId" | "createdAt" | "updatedAt"
>;

// Type guard(s)
export function isSupplier(data: any): data is Supplier {
  return (
    data !== null &&
    typeof data === "object" &&
    "supplierId" in data &&
    "name" in data &&
    "phoneNumber" in data &&
    "createdAt" in data &&
    "updatedAt" in data
  );
}
