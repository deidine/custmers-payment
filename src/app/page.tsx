import { Suspense } from "react";

import ErrorBoundary from "@/components/errors/ErrorBoundary";
import { ProductSliderWrapper } from "@/components/wrappers/ProductSliderWrapper";
import Articles from "@/components/layouts/Articles";
import ReactHotToast from "@/components/ui/ReactHotToast";

export const revalidate = 10;

export default async function Home({
  searchParams,
}: {
  searchParams: { page: string };
}) {
  const page = 1;
  const itemsPerSlider = 8;

  const productSliders = [
    {
      tag: "new",
      label: "New Products",
    },
    {
      tag: "sale",
      label: "Products on Sale",
    },
    {
      tag: "popular",
      label: "Popular Products",
    },
  ];

  return (
    <div className="flex flex-col gap-4 my-8 mx-8">
      <ReactHotToast />

      <ErrorBoundary fallback={<div>Error fetching products</div>}>
        {productSliders.map((productSlider, index) => (
          <div key={index}>
            <Suspense fallback={<div>Loading...</div>}>
              <ProductSliderWrapper
                fetchBy="tag"
                identifier={productSlider.tag}
                page={page}
                limit={itemsPerSlider}
                label={productSlider.label}
              />
            </Suspense>
          </div>
        ))}
      </ErrorBoundary>
      <hr />
      {/* Articles */}
      <Articles />
    </div>
  );
}
