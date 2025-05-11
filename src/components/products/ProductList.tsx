"use client";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";

import { CartContextType, useCartContext } from "@/contexts/CartContext";
import { MedicineView } from "@/types/medicine";
import DefaultImage from "../../public/images/default.jpg";
import Pagination from "../ui/Pagination";
import { getValidatedImageSrc } from "@/utils/helpers";

interface ProductListProps {
  products: MedicineView[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function ProductList({
  products,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: ProductListProps) {
  const { dispatch } = useCartContext() as CartContextType;

  // Calculate total number of pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const addProductToCart = (product: MedicineView) => {
    // Check if product is out of stock
    if (product.totalQuantity <= 0) {
      toast("Sản phẩm đã hết hàng", {
        icon: "⚠",
      });
      return;
    }
    dispatch({
      type: "ADD_TO_CART",
      payload: { productUuid: product.uuid, quantity: 1 },
    });
    toast.success("Thêm vào giỏ hàng thành công");
  };

  return (
    <div className="relative">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-10 lg:max-w-7xl lg:px-8">
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div
              key={product.uuid}
              className="max-h-[520px] border-none shadow-lg shadow-slate-300 rounded-lg overflow-hidden p-4"
            >
              <div className="mx-auto max-w-[420px]">
                <Link href={`/products/${product.uuid}`}>
                  <div className="relative aspect-w-4 aspect-h-3">
                    <Image
                      src={getValidatedImageSrc(
                        product.thumbnailUrl,
                        process.env.NEXT_PUBLIC_DEFAULT_THUMBNAIL_URL ||
                          DefaultImage.src
                      )}
                      alt={product.name}
                      priority
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                      className="w-full object-cover object-center rounded-lg"
                      onError={() => {
                        // Image failed to load
                        return DefaultImage;
                      }}
                      onLoad={(event) => {
                        const imgElement = event.target as HTMLImageElement;
                        if (imgElement.naturalWidth === 0) {
                          // Image failed to load
                          return DefaultImage;
                        }
                        // Image loaded successfully
                      }}
                    />
                  </div>
                </Link>
                <Link href={`/products/${product.uuid}`}>
                  <h4 className="mt-2 text-xl font-medium text-gray-900 line-clamp-2 h-16">
                    {product.name}
                  </h4>
                </Link>
                <h5 className="mt-1 text-lg text-green-600 font-medium">
                  {Number(product.price).toLocaleString("vi-VN")} đ/
                  {product.quantityUnit}
                </h5>
                <p className="mt-1 text-lg text-gray-500 font-medium">
                  Available: {product.totalQuantity}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mt-2">
                  <button className="py-2 px-4 bg-green-500 text-white w-full sm:w-auto rounded-md">
                    Mua ngay
                  </button>
                  <button
                    className="py-2 px-4 bg-pink-500 text-white w-full sm:w-auto rounded-md"
                    onClick={() => addProductToCart(product)}
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
