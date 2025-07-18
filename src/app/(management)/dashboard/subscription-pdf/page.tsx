"use client"

import DashboardLayout from "@/components/dashboard/DashboardLayout"
import IFrameCompoent from "@/components/IFrameCompoent"
import { generateAllSubscriptionsPdf, generateSubscriptionPdf } from "@/db/statistics"
import { useState } from "react" 
export default function SubscriptionPdfPage() {
  const [customerId, setCustomerId] = useState<string>("")
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [loadingSingle, setLoadingSingle] = useState(false)
  const [loadingAll, setLoadingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateAllPdfs = async () => {
    setLoadingAll(true)
    setPdfBase64(null) // Clear previous PDF
    setError(null)
    try {
      const result = await generateAllSubscriptionsPdf()
      if (result) {
        setPdfBase64(result)
      } else {
        setError("Impossible de générer le PDF pour tous les clients.")
      }
    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue lors de la génération de tous les PDFs.")
    } finally {
      setLoadingAll(false)
    }
  }

  return (
              <DashboardLayout title={"subscription-pdf"} activeSlug={"subscription-pdf"}>
    
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8 lg:p-10 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">Générer les PDFs de Souscription</h1>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md border border-gray-200 mb-8">
    
       
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Générer pour tous les clients</h2>
          <button
            onClick={handleGenerateAllPdfs}
            disabled={loadingAll || loadingSingle}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAll ? "Génération de tous les PDFs..." : "Générer tous les PDFs de souscription"}
          </button>
          {error && loadingAll && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
      </div>

      {pdfBase64 && (
        <IFrameCompoent pdfBase64={pdfBase64} pdfName={"souscription"} />
      )}
    </div>
    </DashboardLayout>
  )
}
