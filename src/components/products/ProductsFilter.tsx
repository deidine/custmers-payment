"use client";
import { useState, useEffect } from "react";
import Dropdown from "../ui/Dropdown";
import SearchBar from "../ui/SearchBar";
import { useProductFilter, ProductFilter } from "@/contexts/FilterContext";

export default function ProductsFilter({
  categories,
  brandNames,
}: {
  categories: string[];
  brandNames: string[];
}) {
  const { filters, setFilters } = useProductFilter();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.categories || ["All"]
  );
  const [selectedBrandName, setSelectedBrandName] = useState<string>(
    filters.brandName || "All"
  );

  const handleCategoryChange = (value: string) => {
    // Update the filter state
    setFilters((prevFilters: ProductFilter) => {
      const updatedCategories =
        value === "All"
          ? []
          : prevFilters.categories.includes(value)
          ? prevFilters.categories.filter((category) => category !== value)
          : [...prevFilters.categories, value];

      return {
        ...prevFilters,
        categories: updatedCategories,
        page: 1,
      };
    });

    // Update the selected state
    setSelectedCategories((prevCategories) => {
      if (value === "All") return ["All"];
      const updatedCategories = prevCategories.filter(
        (category) => category !== "All"
      );
      return updatedCategories.includes(value)
        ? updatedCategories.filter((cat) => cat !== value)
        : [...updatedCategories, value];
    });
  };

  const handleBrandNameChange = (value: string) => {
    // Update the filter state
    setFilters((prevFilters: ProductFilter) => {
      const updatedBrandName = value === "All" ? "" : value;
      return {
        ...prevFilters,
        brandName: updatedBrandName,
        page: 1,
      };
    });

    // Update the selected state
    setSelectedBrandName(value);
  };

  const handleSearchInputChange = (keyword: string) => {
    // Update the filter state
    setFilters((prevFilters: ProductFilter) => ({
      ...prevFilters,
      keyword: keyword,
      page: 1,
    }));
  };

  useEffect(() => {
    setSelectedCategories(
      filters.categories.length > 0 ? filters.categories : ["All"]
    );
    setSelectedBrandName(filters.brandName || "All");
  }, [filters]);

  return (
    <div className="max-w-full grid grid-cols-1 sm:grid-cols-2 gap-4 border border-b-2 shadow-sm p-4">
      <div className="w-full">
        <div className="flex flex-wrap flex-col md:flex-row justify-start gap-4">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Dropdown
            options={["All", ...categories]}
            onSelect={handleCategoryChange}
          />
        </div>

        {/* Selected categories */}
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedCategories.map((category, index) => (
            <span
              key={index}
              className="text-white bg-green-600 px-2 py-1 rounded-md"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-wrap flex-col sm:flex-row justify-start gap-4">
          <h1 className="text-2xl font-bold">Brand Name</h1>
          <Dropdown
            options={["All", ...brandNames]}
            onSelect={handleBrandNameChange}
          />
        </div>

        <div className="self-start w-full flex flex-row justify-start gap-4">
          <h1 className="text-2xl font-bold">Name</h1>
          <SearchBar
            initValue={filters.keyword || ""}
            placeholder="Search..."
            onSearch={handleSearchInputChange}
          />
        </div>
      </div>
    </div>
  );
}
