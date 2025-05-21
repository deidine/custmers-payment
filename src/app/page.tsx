import { Suspense } from "react";

import ErrorBoundary from "@/components/errors/ErrorBoundary";
  import ReactHotToast from "@/components/ui/ReactHotToast";

export const revalidate = 10;

export default async function Home({
  searchParams,
}: {
  searchParams: { page: string };
}) {
   
  return (
    <div className="flex flex-col gap-4 my-8 mx-8">
      <ReactHotToast />

 
   
    </div>
  );
}
