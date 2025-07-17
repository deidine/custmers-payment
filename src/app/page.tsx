import { Suspense } from "react";

import ErrorBoundary from "@/components/errors/ErrorBoundary";
  import ReactHotToast from "@/components/ui/ReactHotToast";
import DashboardPage from "./(management)/dashboard/[[...slug]]/page";

export const revalidate = 10;

export default async function Home({
  searchParams,
}: {
  searchParams: { page: string };
}) {
   
  return (
    <div >
      <ReactHotToast />
        <DashboardPage params={{ slug: [] }} />

 
   
    </div>
  );
}
