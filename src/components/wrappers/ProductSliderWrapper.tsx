import ProductSlider from "../ui/ProductSlider";
import { searchProducts } from "@/lib/api";
import { getProductsWithTag } from "@/lib/api";

// Wrapper function
export async function ProductSliderWrapper({
  fetchBy,
  identifier,
  page,
  limit,
  label,
}: {
  fetchBy: string | undefined;
  identifier: string;
  page?: number;
  limit?: number;
  label: string;
}) {
  if (fetchBy === "category") {
    const { result } = await searchProducts(
      [identifier],
      null,
      null,
      page,
      limit
    );
    return <ProductSlider products={result} label={label} />;
  }

  if (fetchBy === "tag") {
    const products = await getProductsWithTag(identifier, page, limit);
    return <ProductSlider products={products} label={label} />;
  }
  return (
    <div className="text-xl font-bold text-center text-red-500">Error</div>
  );
}
