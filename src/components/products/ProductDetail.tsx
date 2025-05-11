"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { MedicineView } from "@/types/medicine";
import { MedicineImage } from "@/types/medicines-image";
import ReviewStars from "../ui/ReviewStars";
import { CartContextType, useCartContext } from "@/contexts/CartContext";
import { getValidatedImageSrc } from "@/utils/helpers";
import DefaultImage from "../../public/images/default.jpg";
import { MedicineDetailView } from "@/types/medicine-detail";

export default function ProductDetail({
  product,
  productImages,
}: {
  product: MedicineDetailView;
  productImages: MedicineImage[];
}) {
  const navLinks = [
    { href: "#general-info", label: "General Information" },
    { href: "#dosage-and-administration", label: "Dosage and Administration" },
    { href: "#contraindications", label: "Contraindications" },
    { href: "#adverse-reactions", label: "Adverse Reactions" },
    { href: "#usage-precautions", label: "Usage Precautions" },
    { href: "#overdose-management", label: "Overdose Management" },
    { href: "#storage-and-preservation", label: "Storage and Preservation" },
  ];

  const thumbnailUrl = getValidatedImageSrc(
    product.thumbnailUrl,
    process.env.NEXT_PUBLIC_DEFAULT_THUMBNAIL_URL || DefaultImage.src
  );

  const [currentThumbnail, setCurrentThumbnail] = useState(thumbnailUrl);
  const [quantity, setQuantity] = useState(1);
  const [isActiveLink, setIsActiveLink] = useState(navLinks[0].href);
  const { dispatch } = useCartContext() as CartContextType;

  const addProductToCart = (product: MedicineView) => {
    console.log(product);
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
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-10 mb-4 sm:w-3/4 md:w-full mx-auto">
        {/* Product thumbnail */}
        <div className="w-full md:w-1/2">
          {/* <div className="relative h-[300px] w-full overflow-hidden rounded-lg mb-2"> */}
          <div className="relative aspect-w-4 aspect-h-3 w-full overflow-hidden rounded-lg mb-2">
            <Image
              src={currentThumbnail}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center"
            />
          </div>

          {/* Images slider */}
          <div className="overflow-x-auto h-[120px] border border-gray-300 rounded-lg">
            <div className="flex flex-nowrap -mx-1">
              {productImages.length > 0 ? (
                productImages.map((image) => (
                  <div
                    key={image.imageId}
                    className="relative flex-shrink-0 w-1/3 lg:w-1/4 mx-1 h-[100px]"
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.medicineUuid}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="absolute top-0 left-0 hover:cursor-pointer rounded-lg object-cover object-center"
                      onClick={() => setCurrentThumbnail(image.imageUrl)}
                    />
                  </div>
                ))
              ) : (
                <div className="relative flex-shrink-0 w-1/3 lg:w-1/4 mx-1">
                  <Image
                    src={currentThumbnail}
                    alt={"Default Thumbnail"}
                    width={150}
                    height={100}
                    className="absolute top-0 left-0 hover:cursor-pointer rounded-lg object-cover object-center"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buy details */}
        <div className="w-full md:w-1/2">
          <h2 className="text-4xl font-bold mb-2">{product.name}</h2>
          <h3 className="text-xl text-blue-500 font-bold mb-2">
            {Number(product.price).toLocaleString("vi-VN")} đ/
            {product.quantityUnit}
          </h3>
          <p className="text-lg text-gray-700 line-clamp-6 overflow-y-auto">
            {product.description}
          </p>
          <div className="flex flex-col lg:flex-row justify-start items-center gap-4 mt-4 mb-4">
            <div className="md:w-1/3">
              <span className="text-lg mr-2">Quantity </span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 border border-gray-400 rounded-lg px-2 py-1"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:w-2/3">
              <button className="flex-grow bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                Buy Now
              </button>
              <button
                className="flex-grow bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => addProductToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
          <p className="text-lg text-gray-500 mb-4">
            Available: {product.totalQuantity}
          </p>
          <div className="flex flex-wrap items-center gap-4 w-full">
            <span className="text-lg">Reviews: </span>
            <ReviewStars rating={3.5} />
            <span>(5 reviews)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-start gap-4 text-lg bg-blue-100 p-4 rounded-md">
        {navLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={`${
              isActiveLink === link.href
                ? "text-blue-500 font-bold"
                : "text-gray-500"
            } hover:cursor-pointer hover:underline`}
            onClick={() => setIsActiveLink(link.href)}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className=" min-h-[40vh] mt-4">
        <div>
          <h2 id="general-info" className="text-2xl font-bold mb-2">
            General Information
          </h2>
          <table className="table-fixed w-full border-separate border border-gray-400">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 p-2 w-1/3">
                  Information
                </th>
                <th className="border border-gray-300 p-2 w-2/3">Details</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border border-gray-300 font-bold text-center p-2">
                  Generic Name
                </td>
                <td className="border border-gray-300 p-2">
                  {product.genericName || "-"}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 font-bold text-center p-2">
                  Brand Name
                </td>
                <td className="border border-gray-300 p-2">
                  {product.brandName || "-"}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 font-bold text-center p-2">
                  Manufacturer Name
                </td>
                <td className="border border-gray-300 p-2">
                  {product.manufacturerName || "-"}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 font-bold text-center p-2">
                  Packaging Specification
                </td>
                <td className="border border-gray-300 p-2">
                  {product.packagingSpecification || "-"}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 font-bold text-center p-2">
                  Substance Name
                </td>
                <td className="border border-gray-300 p-2">
                  {product.substanceName || "-"}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 font-bold text-center p-2">
                  Usage Route
                </td>
                <td className="border border-gray-300 p-2">
                  {product.usageRoute || "-"}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 font-bold text-center p-2">
                  Composition
                </td>
                <td className="border border-gray-300 p-2">
                  {product.composition || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2
            id="dosage-and-administration"
            className="text-2xl font-bold mb-2"
          >
            Dosage and Administration
          </h2>
          <p className="text-lg text-gray-700 whitespace-pre-line">
            {product.dosageAndAdministration || "-"}
          </p>
        </div>

        <div className="mt-8">
          <h2 id="contraindications" className="text-2xl font-bold mb-2">
            Contraindications
          </h2>
          <p className="text-lg text-gray-700 whitespace-pre-line">
            {product.contraindications || "-"}
          </p>
        </div>

        <div className="mt-8">
          <h2 id="adverse-reactions" className="text-2xl font-bold mb-2">
            Adverse Reactions
          </h2>
          <p className="text-lg text-gray-700 whitespace-pre-line">
            {product.adverseReactions || "-"}
          </p>
        </div>

        <div className="mt-8">
          <h2 id="usage-precautions" className="text-2xl font-bold mb-2">
            Usage Precautions
          </h2>
          <p className="text-lg text-gray-700 whitespace-pre-line">
            {product.usagePrecautions || "-"}
          </p>
          <p className="text-lg text-gray-700 whitespace-pre-line">
            {product.usagePrecautionsPregnant || "-"}
          </p>
        </div>

        <div className="mt-8">
          <h2 id="overdose-management" className="text-2xl font-bold mb-2">
            Overdose Management
          </h2>
          <p className="text-lg text-gray-700 whitespace-pre-line">
            {product.overdoseManagement || "-"}
          </p>
        </div>

        <div className="mt-8">
          <h2 id="storage-and-preservation" className="text-2xl font-bold mb-2">
            Storage and Preservation
          </h2>
          <p className="text-lg text-gray-700 whitespace-pre-line">
            {product.storageAndPreservation || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
