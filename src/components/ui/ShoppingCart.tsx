"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { CartContextType, useCartContext } from "@/contexts/CartContext";
import { MedicineView } from "@/types/medicine";
import { getProductsByUuids } from "@/lib/api";
import { getValidatedImageSrc } from "@/utils/helpers";
import DefaultImage from "../../public/images/default.jpg";

export default function ShoppingCart({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [cartProducts, setCartProducts] = useState<MedicineView[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const { state, dispatch } = useCartContext() as CartContextType;

  const router = useRouter();

  const productUuids = state.cart
    ? Array.from(state.cart.map((item) => item.productUuid))
    : [];

  useEffect(() => {
    const fetchCartProducts = async () => {
      const data = await getProductsByUuids(productUuids);
      setCartProducts(data);
      setTotalPrice(
        data.reduce((accumulator, product) => {
          const item = state.cart.find(
            (item) => item.productUuid === product.uuid
          );
          return accumulator + (item?.quantity || 0) * product.price;
        }, 0)
      );
    };
    fetchCartProducts();
  }, [state.cart]);

  const findCartItem = (productUuid: string) => {
    return state.cart.find((item) => item.productUuid === productUuid);
  };

  const handleRemoveFromCart = (productUuid: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { productUuid } });
  };

  const handleClearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const handleQuantityChange = (productUuid: string, quantity: number) => {
    dispatch({
      type: "UPDATE_CART_QUANTITY",
      payload: { productUuid, quantity },
    });
  };

  const handleOrderClick = () => {
    onClose();
    router.push("/order-confirm"); // Redirect
  };

  return (
    <div
      className={`${
        isOpen ? "block" : "hidden"
      } fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-500 bg-opacity-75`}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 overflow-hidden transform transition-all sm:my-8 sm:max-w-xl sm:w-full relative">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Shopping Cart
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full p-1"
          >
            <span className="sr-only">Close</span>
            <span aria-hidden="true" className="text-2xl">
              &times;
            </span>
          </button>
        </div>

        <div className="mt-4 text-left">
          {cartProducts.length > 0 && (
            <button className="inline text-red-500" onClick={handleClearCart}>
              Xóa toàn bộ
            </button>
          )}
          <ul className="space-y-4">
            {cartProducts.map((product) => (
              <li
                key={product.uuid}
                className="flex items-center py-4 border-b"
              >
                <div className="h-[60px] w-[80px]">
                  <img
                    src={getValidatedImageSrc(
                      product.thumbnailUrl,
                      process.env.NEXT_PUBLIC_DEFAULT_THUMBNAIL_URL ||
                        DefaultImage.src
                    )}
                    alt={product.name}
                    className="w-full rounded-md border border-gray-200 object-cover"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    <a href={`/products/${product.uuid}`}>{product.name}</a>
                  </h3>
                  <div className="mt-2 flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-white bg-green-500 border outline-1 px-4"
                        onClick={() =>
                          handleQuantityChange(
                            product.uuid,
                            (findCartItem(product.uuid)?.quantity || 1) - 1
                          )
                        }
                      >
                        -
                      </button>
                      <p className="text-sm text-gray-900">
                        Số lượng: {findCartItem(product.uuid)?.quantity || 0}
                      </p>
                      <button
                        className="text-white bg-green-500 border outline-1 px-4"
                        onClick={() =>
                          handleQuantityChange(
                            product.uuid,
                            (findCartItem(product.uuid)?.quantity || 0) + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm text-gray-900">
                      Thành tiền:
                      {(
                        product.price *
                        (findCartItem(product.uuid)?.quantity || 0)
                      ).toLocaleString("vi-VN")}{" "}
                      đ
                    </p>
                    <button
                      className="text-indigo-600 text-sm"
                      onClick={() => handleRemoveFromCart(product.uuid)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p className="text-red-500 text-lg">Tổng tiền</p>
            <p>{totalPrice.toLocaleString("vi-VN")} đ</p>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            Phí vận chuyển và thuế sẽ được tính khi xác nhận thanh toán
          </p>
          <div className="mt-6">
            <button
              onClick={handleOrderClick}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700"
            >
              Đặt hàng
            </button>
          </div>
          <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
            <p>
              <button
                type="button"
                onClick={onClose}
                className="font-medium text-indigo-600 hover:text-indigo-500"
                onClickCapture={onClose}
              >
                Tiếp tục mua hàng
                <span aria-hidden="true"> &rarr;</span>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
