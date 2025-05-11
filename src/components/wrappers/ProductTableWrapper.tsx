"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { getProductsByUuids } from "@/lib/api";
import { CartContextType, useCartContext } from "@/contexts/CartContext";
import ProductTable from "../products/ProductTable";
import { MedicineView } from "@/types/medicine";
import toast from "react-hot-toast";
import { OrderDTO } from "@/types/order";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function ProductTableWrapper() {
  const { state, dispatch } = useCartContext() as CartContextType;
  const { cart } = state;

  const [cartProducts, setCartProducts] = useState<MedicineView[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  useEffect(() => {
    const fetchCartProducts = async () => {
      if (cart.length > 0) {
        const productUuids = cart.map((item) => item.productUuid);
        const data = await getProductsByUuids(productUuids);
        setCartProducts(data);
      }
      setIsLoading(false);
    };
    fetchCartProducts();
  }, [cart]);

  // Calculate total price without discount
  const totalPrice = cartProducts.reduce((accumulator, product) => {
    const item = cart.find((item) => item.productUuid === product.uuid);
    return accumulator + (item?.quantity || 0) * product.price;
  }, 0);

  if (cartProducts.length === 0) {
    return <div className="text-center">No products in cart</div>;
  }

  const handleDiscountCodeSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    // Feature not implemented
    toast("Tính năng này chưa khả dụng", {
      icon: "❗",
    });
  };

  const handleConfirmOrder = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // fetch current customer
    const customerResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/me`
    );

    if (!customerResponse.ok) {
      const { error } = await customerResponse.json();
      console.error(error);
      toast.error("Đã có lỗi xảy ra!");
      return;
    }

    const { custmerId } = await customerResponse.json();
    const orderDto: OrderDTO = {
      customerId: custmerId,
      status: "Pending",
    };
    const items = cart.map((item) => {
      return {
        medicineUuid: item.productUuid,
        quantity: item.quantity,
      };
    });

    // create order
    const orderResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderDto, items, paymentMethod }),
      }
    );

    if (orderResponse.ok) {
      toast.success("Tạo order thành công!");
      // clear cart
      dispatch({ type: "CLEAR_CART" });
      setIsOrderConfirmed(true);
    } else {
      const { error } = await orderResponse.json();
      console.error(error);
      toast.error("Đã có lỗi khi tạo order!");
    }
  };

  if (isOrderConfirmed) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-center text-lg">Đơn hàng đã đặt thành công!</h2>
        <Link
          href="/products"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mx-auto"
        >
          Tiếp tục mua hàng
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Xác nhận đơn hàng</h1>
      {isLoading ? (
        <div className="text-center">Loading products...</div>
      ) : (
        <ProductTable products={cartProducts} totalPrice={totalPrice} />
      )}

      {/* Mã giảm giá */}
      <form className="my-8" onSubmit={handleDiscountCodeSubmit}>
        <label htmlFor="discount-code" className="block mb-2">
          Mã giảm giá:
        </label>
        <div className="flex">
          <input
            type="text"
            id="discount-code"
            className="flex-grow border border-gray-300 rounded-l px-4 py-2"
            placeholder="Nhập mã giảm giá"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          >
            Áp dụng
          </button>
        </div>
      </form>

      {/* Phương thức thanh toán */}
      <form className="space-y-6" onSubmit={handleConfirmOrder}>
        <div>
          <h2 className="text-xl font-bold mb-2">Phương thức thanh toán</h2>
          <div>
            <label className="inline-flex items-center mr-4">
              <input
                type="radio"
                name="payment-method"
                className="form-radio"
                value="Cash"
                checked={paymentMethod === "Cash"}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <span className="ml-2">Tiền mặt</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="payment-method"
                className="form-radio"
                value="Credit"
                checked={paymentMethod === "Credit"}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <span className="ml-2">Thẻ tín dụng</span>
            </label>
          </div>
        </div>

        {/* Nút xác nhận */}
        <div className="flex justify-start h-12 gap-4">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
          >
            Xác nhận đặt hàng
          </button>

          <Link
            href="/products"
            className="bg-indigo-500 text-white px-6 py-3 rounded hover:bg-indigo-600"
          >
            Tiếp tục mua hàng
          </Link>
        </div>
      </form>
    </>
  );
}
