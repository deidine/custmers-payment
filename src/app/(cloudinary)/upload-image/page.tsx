"use client";
import ImageUpload from "@/components/forms/ImageUpload";

export default function UploadImage() {
  return (
    <div className="mx-auto">
      <ImageUpload
        onSuccess={(result) => {
          console.log(result);
        }}
        onError={(error) => {
          console.log(error);
        }}
      />
    </div>
  );
}
