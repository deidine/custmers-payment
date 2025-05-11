"use client";
import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

export default function ImageUpload({
  onSuccess,
  onError,
}: {
  onSuccess: (result: any) => void;
  onError: (error: any) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <CldUploadWidget
        signatureEndpoint={"/api/cloudinary-image-upload"}
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          folder: "product_images",
          singleUploadAutoClose: true,
        }}
        onSuccess={(result) => {
          setIsLoading(false);
          onSuccess(result);
        }}
        onError={(error) => {
          setIsLoading(false);
          onError(error);
        }}
        onOpen={() => setIsLoading(true)}
        onClose={() => setIsLoading(false)}
      >
        {({ open }) => {
          return (
            <button
              type="button"
              disabled={isLoading}
              className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => open()}
            >
              {isLoading ? "Uploading..." : "Upload Image"}
            </button>
          );
        }}
      </CldUploadWidget>
    </>
  );
}
