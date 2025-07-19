"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { useFormStatus } from "react-dom" // Still useFormStatus for pending state
import { useUser } from "@/contexts/UserContext"

import { useSearchParams } from 'next/navigation';

export default function FindClientPage() {
  const searchParams = useSearchParams();
  const showOnlyInput = searchParams.get('showOnlyInput');
  const [error, setError] = useState<string | null>(null)
  const { pending } = useFormStatus() 
  const router = useRouter() 
 
   async function handleSubmit(formData: FormData) {
    setError(null) // Clear previous errors

    const clientId = formData.get("clientId")
    if (!clientId) {
      setError("Please enter a Client ID.")
      return
    }

    try {
      // Assuming your API has an endpoint to find a client by ID
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${clientId}`,
        {
          method: "GET", // Or POST if your API expects it for search
        },
      )

      if (!response.ok) {
        // Handle cases where the client is not found or other API errors
        if (response.status === 404) {
          setError("Client not found. Please check the ID.")
        } else {
          const errorData = await response.json()
          setError(errorData.message || "An error occurred while searching for the client.")
        }
        return
      }

      const client = await response.json() // Assuming the API returns the client object
 
      // If client is found, redirect to their attendance page
      router.push(`http://localhost:3000/dashboard/clientPresence/${client.customerId}`)
    } catch (err) {
      console.error("Error finding client:", err)
      setError("Failed to connect to the server. Please try again.")
    }
  }
 

  if (showOnlyInput) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
                 <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Client ID
              </label>
              <input
                id="clientId"
                name="clientId"
                type="number"
                placeholder="e.g., 123"
                required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50 dark:ring-offset-gray-950 dark:placeholder:text-gray-600 dark:focus-visible:ring-blue-400"
              />
            </div>
            {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white ring-offset-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-blue-400"
              disabled={pending}
            >
              {pending ? "Searching..." : "Find Client"}
            </button>
          </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Find Client</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the client ID to view their attendance record.
          </p>
        </div>
         <div>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Client ID
              </label>
              <input
                id="clientId"
                name="clientId"
                type="number"
                placeholder="e.g., 123"
                required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50 dark:ring-offset-gray-950 dark:placeholder:text-gray-600 dark:focus-visible:ring-blue-400"
              />
            </div>
            {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white ring-offset-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-blue-400"
              disabled={pending}
            >
              {pending ? "Searching..." : "Find Client"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
