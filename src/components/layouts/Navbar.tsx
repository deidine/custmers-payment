"use client";
import Link from "next/link";
import { useState } from "react";

import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const [clientId, setClientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Filter states
  const router = useRouter();
  const isAllowed = user && (user.role === "ADMIN" || user.role === "MANAGER");
  async function handleSubmitClient(formData: FormData) {
    setError(null); // Clear previous errors

    if (!clientId) {
      setError("Please enter a Client ID.");
      return;
    }

    try {
      // Assuming your API has an endpoint to find a client by ID
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${clientId}`,
        {
          method: "GET", // Or POST if your API expects it for search
        }
      );

      if (!response.ok) {
        // Handle cases where the client is not found or other API errors
        if (response.status === 404) {
          setError("Client not found. Please check the ID.");
        } else {
          const errorData = await response.json();
          setError(
            errorData.message ||
              "An error occurred while searching for the client."
          );
        }
        return;
      }

      const client = await response.json(); // Assuming the API returns the client object

      // If client is found, redirect to their attendance page
      router.push(
        `http://localhost:3000/dashboard/clientPresence/${client.customerId}`
      );
    } catch (err) {
      console.error("Error finding client:", err);
      setError("Failed to connect to the server. Please try again.");
    }
  }

  return (
    <nav className="bg-gray-800 p-4">
      <div className="flex justify-between items-center">
        {/* Hamburger menu button for small screens */}

        <div className="sm:hidden mr-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              {isOpen ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
              )}
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Require permission to access */}
          {isAllowed && (
            <Link
              href={"/dashboard"}
              className="bg-red-800 px-2 py-1 rounded text-white hover:bg-red-500 block"
            >
              Dashboard
            </Link>
          )}
         
        </div>
        <form
          action={handleSubmitClient}
          className=" flex items-center space-x-4"
        > 
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-white dark:text-gray-300"
            >
              Client ID
            </label>
            <input
              id="clientId"
              name="clientId"
              type="number"
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g., 123"
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50 dark:ring-offset-gray-950 dark:placeholder:text-gray-600 dark:focus-visible:ring-blue-400"
            /> 
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white ring-offset-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-blue-400"
          >
            trouver client
          </button>
        </form>
      </div>
    </nav>
  );
}
