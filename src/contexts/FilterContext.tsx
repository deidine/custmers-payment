"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ProductFilter {
  categories: string[];
  brandName: string;
  keyword: string;
  page: number;
  itemsPerPage: number;
}

interface ProductFilterContextType {
  filters: ProductFilter;
  setFilters: React.Dispatch<React.SetStateAction<ProductFilter>>;
}

const ProductFilterContext = createContext<
  ProductFilterContextType | undefined
>(undefined);

export const useProductFilter = () => {
  const context = useContext(ProductFilterContext);
  if (!context) {
    throw new Error(
      "useProductFilter must be used within a ProductFilterProvider"
    );
  }
  return context;
};

export const ProductFilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [filters, setFilters] = useState<ProductFilter>({
    categories: [],
    brandName: "",
    keyword: "",
    page: 1,
    itemsPerPage: 8,
  });

  return (
    <ProductFilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </ProductFilterContext.Provider>
  );
};
