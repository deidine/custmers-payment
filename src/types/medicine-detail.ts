export type MedicineDetail = {
  detailId: number;
  medicineUuid: string;
  brandName?: string | null;
  genericName?: string | null;
  manufacturerName?: string | null;
  packagingSpecification?: string | null;
  substanceName?: string | null;
  composition?: string | null;
  usageRoute?: string | null;
  dosageAndAdministration?: string | null;
  contraindications?: string | null;
  adverseReactions?: string | null;
  usagePrecautions?: string | null;
  usagePrecautionsPregnant?: string | null;
  overdoseManagement?: string | null;
  storageAndPreservation?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MedicineDetailDTO = Omit<
  MedicineDetail,
  "detailId" | "createdAt" | "updatedAt"
>;

export type MedicineDetailView = {
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
  brandName?: string | null;
  genericName?: string | null;
  manufacturerName?: string | null;
  packagingSpecification?: string | null;
  substanceName?: string | null;
  composition?: string | null;
  usageRoute?: string | null;
  dosageAndAdministration?: string | null;
  contraindications?: string | null;
  adverseReactions?: string | null;
  usagePrecautions?: string | null;
  usagePrecautionsPregnant?: string | null;
  overdoseManagement?: string | null;
  storageAndPreservation?: string | null;
  totalQuantity: number;
};

// Type guard(s)
export function isMedicineDetail(data: any): data is MedicineDetail {
  return (
    data !== null &&
    typeof data === "object" &&
    "detailId" in data &&
    "medicineUuid" in data &&
    typeof data.detailId === "number" &&
    typeof data.medicineUuid === "string"
  );
}
