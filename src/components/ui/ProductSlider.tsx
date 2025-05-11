"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { MedicineView } from "@/types/medicine";
import ReviewStars from "./ReviewStars";
import { CartContextType, useCartContext } from "@/contexts/CartContext";
import { getValidatedImageSrc } from "@/utils/helpers";
import DefaultImage from "../../public/images/default.jpg";

interface ProductSliderProps {
  products: MedicineView[];
  label?: string;
}

export default function ProductSlider({ products, label }: ProductSliderProps) {
  const { dispatch } = useCartContext() as CartContextType;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4); // default items: 4

  const updateItemsToShow = () => {
    if (!window) return;
    if (window.innerWidth >= 1280) {
      setItemsToShow(4); // X-Large screens
    } else if (window.innerWidth >= 1024) {
      setItemsToShow(3); // Large screens
    } else if (window.innerWidth >= 768) {
      setItemsToShow(2); // Medium screens (tablet)
    } else {
      setItemsToShow(1); // Small screens
    }
  };

  useEffect(() => {
    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);
    return () => {
      window.removeEventListener("resize", updateItemsToShow);
    };
  }, []);

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

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? products.length - itemsToShow : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= products.length - itemsToShow ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between mb-4">
        {label && <h2 className="text-xl font-bold mb-4">{label}</h2>}
        <Link
          href={"/products"}
          className="text-blue-500 font-bold hover:text-blue-700 hover:underline"
        >
          Xem thêm
        </Link>
      </div>
      <div className="relative bg-slate-200 w-full rounded-lg overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
          }}
        >
          {products.map((product, index) => (
            <div
              key={product.uuid}
              style={{ width: `${100 / itemsToShow}%` }}
              className={`flex-shrink-0 p-4`}
            >
              <div className="p-4 h-full bg-white rounded-lg shadow-md text-center">
                <Link href={`/products/${product.uuid}`} className="block mb-4">
                  <div className="aspect-h-3 aspect-w-4 w-full">
                    <img
                      src={getValidatedImageSrc(
                        product.thumbnailUrl,
                        process.env.NEXT_PUBLIC_DEFAULT_THUMBNAIL_URL ||
                          DefaultImage.src
                      )}
                      alt={product.name}
                      className="object-center object-cover mb-4 rounded mx-auto"
                    />
                  </div>
                </Link>
                <ReviewStars rating={5} />
                <Link href={`/products/${product.uuid}`}>
                  <h3 className="text-lg font-semibold line-clamp-2 min-h-[4rem]">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-2">
                  {Number(product.price).toLocaleString("vi-VN")} đ
                </p>
                <p className="text-gray-600 mb-2">
                  Available: {product.totalQuantity}
                </p>
                <div>
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white text-xl py-2 px-4 rounded"
                    onClick={() => addProductToCart(product)}
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-900"
        >
          ‹
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-900"
        >
          ›
        </button>
      </div>
    </div>
  );
}
