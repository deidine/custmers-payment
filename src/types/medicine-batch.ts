export type MedicineBatch = {
  batchId: number;
  medicineUuid: string;
  expirationDate: Date;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type MedicineBatchDTO = Omit<
  MedicineBatch,
  "batchId" | "createdAt" | "updatedAt"
>;

// Type guard(s)
export function isMedicineBatch(data: any): data is MedicineBatch {
  return (
    data !== null &&
    typeof data === "object" &&
    "batchId" in data &&
    "medicineUuid" in data &&
    "expirationDate" in data &&
    "quantity" in data &&
    "createdAt" in data &&
    "updatedAt" in data
  );
}

export function isMedicineBatchDTO(data: any): data is MedicineBatchDTO {
  return (
    data !== null &&
    typeof data === "object" &&
    "medicineUuid" in data &&
    "expirationDate" in data &&
    "quantity" in data
  );
}
