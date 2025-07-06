"use client";
import dynamic from "next/dynamic";
import type React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { format, parse } from "date-fns";

import type { PaymentWithCustomer, PaymentStatus } from "@/types/payment";
import { dashboardSideItems } from "@/lib/dashboard-items";
import RefreshIcon from "../../../public/images/refresh-cw-alt.svg";
import { Filter } from "lucide-react";

import LoadingTable from "../LoadingTable";
import Pagination from "@/components/ui/Pagination";
import { useScrollLock } from "@/hooks/useScrollLock";
import PaymentTable from "./PaymentTable";
import { fr } from "date-fns/locale";
import PaymentFilterModal from "./PaymentFilterModal";
import { useUser } from "@/contexts/UserContext";

const PaymentFormModal = dynamic(() => import("./PaymentFormModal"), {
  loading: () => <div>Loading modal...</div>,
  ssr: false,
});

export default function PaymentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tableData, setTableData] = useState<PaymentWithCustomer[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
type StatusStats = {
  [key in PaymentStatus]?: {
    count: number;
    totalAmount: number;
  };
};

const [statistics, setStatistics] = useState<StatusStats>({});
  // Initialize filter states from URL parameters
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [customerId, setCustomerId] = useState(
    searchParams.get("customerId") || ""
  );
  const [unpaidInMonth, setUnpaidInMonth] = useState(
    searchParams.get("unpaidInMonth") || ""
  );
  const { user } = useUser();

  useScrollLock(isCreateModalOpen);
  const formattedMonth = useMemo(() => {
    if (!unpaidInMonth) return "";
    const date = parse(unpaidInMonth, "yyyy-MM", new Date());
    return format(date, "MMMM yyyy", { locale: fr });
  }, [unpaidInMonth]);
  const rowOptions =
    dashboardSideItems({ role: user?.role ?? "" }).find((item) => item.id === "payments")?.options || [];

  const [currentPage, setCurrentPage] = useState(
    Number.parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const buildQueryParams = (page = 1) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: itemsPerPage.toString(),
    });

    if (status) params.append("status", status);
    if (customerId) params.append("customerId", customerId);
    if (unpaidInMonth) params.append("unpaidInMonth", unpaidInMonth);

    return params.toString();
  };

  // Update URL with current filter state
  const updateURL = (page = currentPage) => {
    const params = new URLSearchParams();

    if (page > 1) params.set("page", page.toString());
    if (status) params.set("status", status);
    if (customerId) params.set("customerId", customerId);
    if (unpaidInMonth) params.set("unpaidInMonth", unpaidInMonth);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    // Update URL without triggering a page reload
    router.replace(newUrl, { scroll: false });
  };

  const fetchTableData = async (page = 1) => {
    setIsLoadingData(true);
    const queryParams = buildQueryParams(page);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments?${queryParams}`
      );

      if (response.ok) {
        const { data, totalItems } = await response.json();
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
        const tableData = data as PaymentWithCustomer[];
        setTableData(tableData);
        calculateStatistics(tableData);
      } else {
        throw new Error("Failed to fetch payments.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching payment data");
    } finally {
      setIsLoadingData(false);
      if (tableData.length > 0) {
        calculateStatistics(tableData);
      }
    }
  };

  // Update URL whenever filter states change
  useEffect(() => {
    updateURL(currentPage);
    fetchTableData(currentPage);
  }, [status, customerId, unpaidInMonth]);

  // Update URL when page changes
  useEffect(() => {
    updateURL(currentPage);
  }, [currentPage]);

  const calculateStatistics = (data: PaymentWithCustomer[]) => {
    const statusStats = data.reduce((acc, payment) => {
      const statusKey = payment.status as keyof StatusStats;
      if (!acc[statusKey]) {
        acc[statusKey] = { count: 0, totalAmount: 0 };
      }
      acc[statusKey].count += 1;
      acc[statusKey].totalAmount += parseFloat(payment.amount);
      return acc;
    }, {});

    setStatistics(statusStats as StatusStats);
  };

  const handleCreateSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    data: any
  ) => {
    event.preventDefault();

    const toastId = toast.loading("Creating payment...");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      toast.success("Payment created successfully");
      setIsCreateModalOpen(false);
      handleRefresh();
    } catch (error) {
      console.error("Failed to create payment:", error);
      toast.error(error instanceof Error ? error.message : "Create failed");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleRefresh = () => {
    setIsLoadingData(true);
    setCurrentPage(1); // Reset to the first page
    fetchTableData(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTableData(page);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchTableData(1);
  };

  const handleClearFilters = () => {
    setStatus("");

    setCustomerId("");
    setUnpaidInMonth("");
    setCurrentPage(1);
    fetchTableData(1);
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const handleFilterUnpaidThisMonth = () => {
    setUnpaidInMonth(getCurrentMonth());
    setCurrentPage(1);
    fetchTableData(1);
  };

  // Add this state for the modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <>
      {/* Options du tableau de bord */}
      <div className="flex justify-start items-start gap-2 mb-2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center w-12 h-10"
          onClick={handleRefresh}
        >
          <RefreshIcon className="w-5 h-5" fill="none" stroke="white" />
        </button>

        {rowOptions.includes("CREATE") && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center h-10 text-nowrap"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Ajouter un paiement
          </button>
        )}
        <div className="mb-4 w-full flex items-end justify-end">
          <button
            className="flex bg-yellow-500 items-center gap-2 px-4 py-2  rounded-md hover:bg-gray-200"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter className="w-4 h-4" />
            Filtres des paiements
          </button>
        </div>
      </div>

      {/* Tableau */}
      {isLoadingData ? (
        <LoadingTable />
      ) : (
        <PaymentTable
          tableData={tableData}
          rowOptions={rowOptions}
          onRefresh={handleRefresh}
        />
      )}

      {/* Modal pour ajouter un paiement */}
      {isCreateModalOpen && (
        <PaymentFormModal
          mode={"create"}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <PaymentFilterModal
        isOpen={isFilterModalOpen}
        statistics={statistics} 
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        status={status}
        setStatus={setStatus}
        customerId={customerId}
        setCustomerId={setCustomerId}
        unpaidInMonth={unpaidInMonth}
        setUnpaidInMonth={setUnpaidInMonth}
        onClearFilters={handleClearFilters}
        onFilterUnpaidThisMonth={handleFilterUnpaidThisMonth}
      />
    </>
  );
}
