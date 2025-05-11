type Medicine = {
  medicineId: number;
  uuid: string;
  name: string;
  category: string;
  description?: string | null;
  price: number;
  quantityUnit: string;
  tags?: string[];
  thumbnailUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MedicineView = Omit<Medicine, "medicineId"> & {
  totalQuantity: number;
};

export type MedicineDTO = Omit<
  Medicine,
  "medicineId" | "uuid" | "createdAt" | "updatedAt"
>;

// Type guard(s)
export function isMedicineView(
  data: MedicineView | MedicineDTO
): data is MedicineView {
  return "createdAt" in data && "updatedAt" in data && "uuid" in data;
}
