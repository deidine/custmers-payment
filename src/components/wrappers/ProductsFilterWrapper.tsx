import { getAllProductCategories, getAllMedicinesBrandName } from "@/lib/api";
import ProductsFilter from "../products/ProductsFilter";

export async function ProductsFilterWrapper() {
  const [categories, brandNames] = await Promise.all([
    getAllProductCategories(),
    getAllMedicinesBrandName(),
  ]);
  return <ProductsFilter categories={categories} brandNames={brandNames} />;
}
