import { MedicineView } from "@/types/medicine";
import { MedicineDetailView } from "@/types/medicine-detail";
import { MedicineImage } from "@/types/medicines-image";

// export async function getAllProducts(
//   page: number = 1,
//   limit: number = 10
// ): Promise<ProductResponse> {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_API_URL}/medicines?page=${page}&limit=${limit}`
//     );
//     const { result, totalItems } = await response.json();
//     const medicines = result as MedicineView[];
//     return { result: medicines, totalItems: totalItems };
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     return { result: [], totalItems: 0 };
//   }
// }

export async function getProductDetailViewByProductUuid(
  uuid: string
): Promise<MedicineDetailView | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/medicine-details/view?medicineUuid=${uuid}`
    );
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as MedicineDetailView;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getProductsByUuids(
  uuids: string[]
): Promise<MedicineView[]> {
  try {
    if (uuids.length === 0) return [];
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/medicines/bulk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uuids: uuids }),
      }
    );
    const { result } = await response.json();
    return result as MedicineView[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getAllProductCategories(): Promise<string[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/medicines/fetch-categories`
    );
    return (await response.json()) as string[];
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
}

export async function getAllMedicinesBrandName(): Promise<string[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/medicines/fetch-brand-names`
    );
    return (await response.json()) as string[];
  } catch (error) {
    console.error("Error fetching product brand names:", error);
    return [];
  }
}

// export async function getAllMedcinesTags(): Promise<string[]> {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_API_URL}/medicines/fetch-tags`
//     );
//     return (await response.json()) as string[];
//   } catch (error) {
//     console.error("Error fetching product tags:", error);
//     return [];
//   }
// }

export async function searchProducts(
  categories: string[] | null,
  brandName: string | null,
  keyword: string | null,
  page: number = 1,
  limit: number = 10
): Promise<{
  result: MedicineDetailView[];
  totalItems: number;
}> {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (categories && categories.length > 0) {
      params.append("categories", categories.join(","));
    }

    if (brandName) {
      params.append("brandName", brandName);
    }

    if (keyword) {
      params.append("keyword", keyword);
    }

    const url = `${
      process.env.NEXT_PUBLIC_BASE_API_URL
    }/medicines/search?${params.toString()}`;
    const response = await fetch(url);
    return (await response.json()) as {
      result: MedicineDetailView[];
      totalItems: number;
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { result: [], totalItems: 0 };
  }
}

export async function getProductImages(
  productUuid: string
): Promise<MedicineImage[] | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/medicines/images?medicineUuid=${productUuid}`
    );
    return (await response.json()) as MedicineImage[];
  } catch (error) {
    console.error("Error fetching product images:", error);
    return null;
  }
}

export async function getProductQuantityInStock(
  productUuid: string
): Promise<number> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/medicine-batches/quantity-in-stock?medicineUuid=${productUuid}`
    );
    const { totalQuantity } = await response.json();
    return totalQuantity;
  } catch (error) {
    console.error("Error fetching product quantity in stock:", error);
    return 0;
  }
}

export async function getProductsWithTag(
  tag: string,
  page: number = 1,
  limit: number = 10
): Promise<MedicineView[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/medicines/tags?tags=["${tag}"]&page=${page}&limit=${limit}`
    );
    const { result } = await response.json();
    return Array.isArray(result) ? (result as MedicineView[]) : [];
  } catch (error: any) {
    console.error("Failed to fetch products with tag:", error);
    return [];
  }
}
