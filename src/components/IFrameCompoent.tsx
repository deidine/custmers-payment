import React from 'react'

export default function IFrameCompoent({pdfBase64,pdfName}:any) {
  return (
   
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
              download={ pdfName+".pdf" }
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Télécharger le PDF
            </a>
          </div>
        </div>
  )
}
