"use client";
import { useState, useEffect } from "react";
import ProductList from "../products/ProductList";
import { MedicineView } from "@/types/medicine";
import { useProductFilter } from "@/contexts/FilterContext";
import { searchProducts } from "@/lib/api";

export function ProductListWrapper() {
  const { filters, setFilters } = useProductFilter();
  const [products, setProducts] = useState<MedicineView[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { result, totalItems } = await searchProducts(
        filters.categories,
        filters.brandName,
        filters.keyword,
        filters.page,
        filters.itemsPerPage
      );
      setProducts(result as MedicineView[]);
      setTotalItems(totalItems);
      setIsLoading(false);
    };

    fetchProducts();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <>
      {isLoading ? (
        <div className="text-center">Loading products...</div>
      ) : (
        <ProductList
          products={products}
          totalItems={totalItems}
          currentPage={filters.page}
          itemsPerPage={filters.itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
