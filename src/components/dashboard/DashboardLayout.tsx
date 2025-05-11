import Link from "next/link";

import { dashboardSideItems } from "@/lib/dashboard-items";
import ReactHotToast from "../ui/ReactHotToast";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  activeSlug?: string;
}

export default function DashboardLayout({
  children,
  title,
  activeSlug,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-md overflow-y-auto">
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Manager Dashboard
          </h2>
        </div>
        <nav className="mt-4">
          {dashboardSideItems.map((sideItem) => (
            <Link
              key={sideItem.id}
              href={`/dashboard/${sideItem.id}`}
              className={`block p-4 hover:bg-gray-200 cursor-pointer ${
                activeSlug === sideItem.id ? "bg-gray-200" : ""
              }`}
            >
              {sideItem.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="relative flex-1 px-10 py-8 overflow-x-hidden min-h-full">
        <ReactHotToast duration={5000} />

        <h2 className="text-3xl font-semibold text-gray-800 mb-6">{title}</h2>

        {children}
      </div>
    </div>
  );
}
