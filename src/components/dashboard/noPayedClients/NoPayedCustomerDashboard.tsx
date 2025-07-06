"use client";
 import type React from "react";

import { useState, useEffect } from "react";
import toast from "react-hot-toast"; 
import type { Customer,   } from "@/types/customer";
import { dashboardSideItems } from "@/lib/dashboard-items";
 import CustomerTable from "./CustomerTable";
import LoadingTable from "../LoadingTable";
import Pagination from "@/components/ui/Pagination";
import { useUser } from "@/contexts/UserContext";
  
 

export default function NoPayedCustomerDashboard() {
  const [tableData, setTableData] = useState<Customer[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
const {user}= useUser()
   
  const rowOptions =
    dashboardSideItems({ role: user?.role ?? "" }).find((item) => item.id === "customers")?.options || [];

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const buildQueryParams = (page = 1) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", itemsPerPage.toString());
 params.set("unpaidThisMonth", "true");
    return params.toString();
  };

  const fetchTableData = async (page = 1) => {
    try {
      setIsLoadingData(true);
      const queryString = buildQueryParams(page);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers?${queryString}`
      );
      if (response.ok) {
        const { result, totalItems } = await response.json();

        setTotalPages(Math.ceil(totalItems / itemsPerPage));
        setTableData(result as Customer[]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching customer data");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, []);

 

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchTableData(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTableData(page);
  };
 

  return (
    <>
     

      {/* Table */}
      {isLoadingData ? (
        <LoadingTable />
      ) : (
        <CustomerTable
          tableData={tableData}
          rowOptions={rowOptions}
          onRefresh={handleRefresh}
        />
      )}
 
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
