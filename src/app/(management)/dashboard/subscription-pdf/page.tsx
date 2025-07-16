"use client"

import { generateAllSubscriptionsPdf, generateSubscriptionPdf } from "@/db/statistics"
import { useState } from "react" 
export default function SubscriptionPdfPage() {
  const [customerId, setCustomerId] = useState<string>("")
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [loadingSingle, setLoadingSingle] = useState(false)
  const [loadingAll, setLoadingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateSinglePdf = async () => {
    setLoadingSingle(true)
    setPdfBase64(null)
    setError(null)
    try {
      const id = Number.parseInt(customerId, 10)
      if (isNaN(id)) {
        throw new Error("Veuillez entrer un ID client valide.")
      }
      const result = await generateSubscriptionPdf(id)
      if (result) {
        setPdfBase64(result)
      } else {
        setError("Impossible de générer le PDF. Vérifiez l'ID client ou si une souscription existe.")
      }
    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue.")
    } finally {
      setLoadingSingle(false)
    }
  }

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
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8 lg:p-10 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">Générer les PDFs de Souscription</h1>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Générer pour un client spécifique</h2>
        <div className="mb-4">
          <label htmlFor="customerId" className="block text-gray-700 text-sm font-bold mb-2">
            ID Client:
          </label>
          <input
            type="number"
            id="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Ex: 1, 2, 3..."
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleGenerateSinglePdf}
          disabled={loadingSingle || !customerId}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingSingle ? "Génération..." : "Générer le PDF pour ce client"}
        </button>
        {error && !loadingAll && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

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
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Aperçu du PDF</h2>
          <div className="w-full h-[600px] border border-gray-300 rounded overflow-hidden">
            <iframe
              src={`data:application/pdf;base64,${pdfBase64}`}
              width="100%"
              height="100%"
              title="PDF de Souscription"
              className="border-none"
            >
              Votre navigateur ne supporte pas les iframes. Vous pouvez{" "}
              <a
                href={`data:application/pdf;base64,${pdfBase64}`}
                download="souscription_client.pdf"
                className="text-blue-600 hover:underline"
              >
                télécharger le PDF ici
              </a>
              .
            </iframe>
          </div>
          <div className="mt-4 text-center">
            <a
              href={`data:application/pdf;base64,${pdfBase64}`}
              download={loadingAll ? "toutes_les_souscriptions.pdf" : "souscription_client.pdf"}
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Télécharger le PDF
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
