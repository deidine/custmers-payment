export type MedicineImage = {
  imageId: number;
  medicineUuid: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MedicineImageDTO = Omit<
  MedicineImage,
  "imageId" | "createdAt" | "updatedAt"
>;
