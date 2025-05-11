import { MedicineView } from "@/types/medicine";
import { getValidatedImageSrc } from "@/utils/helpers";
import DefaultImage from "../../public/images/default.jpg";
import { CartContextType, useCartContext } from "@/contexts/CartContext";

export default function ProductTable({
  products,
  totalPrice,
}: {
  products: MedicineView[];
  totalPrice: number;
}) {
  const { state } = useCartContext() as CartContextType;
  const { cart } = state;

  const VATRate = 0.1;
  const VAT = VATRate * totalPrice;

  const findCartItem = (productUuid: string) => {
    return cart.find((item) => item.productUuid === productUuid);
  };

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Sản phẩm</th>
            <th className="p-2 text-right">Số lượng</th>
            <th className="p-2 text-right">Đơn giá</th>
            <th className="p-2 text-right">Thành tiền</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.uuid}>
              <td className="p-2">
                <div className="flex items-center">
                  <img
                    src={getValidatedImageSrc(
                      product.thumbnailUrl,
                      process.env.NEXT_PUBLIC_DEFAULT_THUMBNAIL_URL ||
                        DefaultImage.src
                    )}
                    alt={product.name}
                    className="w-16 h-12 mr-2"
                  />

                  <div>
                    <p className="font-bold">{product.name}</p>
                  </div>
                </div>
              </td>
              <td className="p-2 text-right">
                {findCartItem(product.uuid)?.quantity || 0}
              </td>
              <td className="p-2 text-right">
                {product.price.toLocaleString("vi-VN")} đ
              </td>
              <td className="p-2 text-right">
                {(
                  product.price * (findCartItem(product.uuid)?.quantity || 0)
                ).toLocaleString("vi-VN")}{" "}
                đ
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot className="border-t border-b border-gray-300">
          <tr className="font-bold">
            <td colSpan={3} className="p-2 text-right text-red-500">
              Thuế VAT ({VATRate * 100} %):
            </td>
            <td className="p-2 text-right text-red-500">
              {VAT.toLocaleString("vi-VN")} đ
            </td>
          </tr>
          <tr className="font-bold">
            <td colSpan={3} className="p-2 text-right">
              Tổng cộng:
            </td>
            <td className="p-2 text-right">
              {totalPrice.toLocaleString("vi-VN")} đ
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}
