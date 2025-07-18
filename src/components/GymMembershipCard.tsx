"use client"

import { forwardRef, useRef, useImperativeHandle } from "react"
import { Dumbbell, Phone, Mail, Home, QrCode } from "lucide-react"
import { formatDate } from "@/utils/helpers"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import toast from "react-hot-toast"

interface GymMembershipCardProps {
  clientData: {
    customerId?: number
    firstName: string
    lastName: string
    membershipType: string
    membershipStartDate?: string
    membershipEndDate?: string
    phoneNumber?: string
    email?: string
    address?: string
    profilePictureUrl?: string
  }
}

export interface GymMembershipCardRef {
  generatePdf: () => Promise<void>
}

const GymMembershipCard = forwardRef<GymMembershipCardRef, GymMembershipCardProps>(({ clientData }, ref) => {
  const cardRef = useRef<HTMLDivElement>(null)

  const fullName = `${clientData.firstName || ""} ${clientData.lastName || ""}`.trim()
  const membershipStart = clientData.membershipStartDate ? formatDate(clientData.membershipStartDate) : "N/A"
  const membershipEnd = clientData.membershipEndDate ? formatDate(clientData.membershipEndDate) : "N/A"

  useImperativeHandle(ref, () => ({
    generatePdf: async () => {
      if (!cardRef.current) {
        toast.error("Membership card element not found for PDF generation.")
        return
      }

      const toastId = toast.loading("Generating Membership Card PDF...")
      try {
        const downloadButton = cardRef.current.querySelector(".download-button") as HTMLElement
        if (downloadButton) {
          downloadButton.style.display = "none"
        }

        const canvas = await html2canvas(cardRef.current, {
          scale: 2, // Increase scale for better quality
          useCORS: true,
          logging: false,
        })

        if (downloadButton) {
          downloadButton.style.display = ""
        }

        const imgData = canvas.toDataURL("image/png")

        // Define standard credit card dimensions in mm
        const cardWidthMm = 85.6
        const cardHeightMm = 53.98

        // Create a new jsPDF instance with the desired card dimensions
        // Orientation 'l' for landscape (width > height)
        const pdf = new jsPDF("l", "mm", [cardWidthMm, cardHeightMm])

        // Calculate image dimensions to fit within the PDF page while maintaining aspect ratio
        const imgCanvasWidth = canvas.width
        const imgCanvasHeight = canvas.height
        const imgAspectRatio = imgCanvasWidth / imgCanvasHeight

        let imgPdfWidth = cardWidthMm
        let imgPdfHeight = cardHeightMm

        if (imgAspectRatio > cardWidthMm / cardHeightMm) {
          // Image is wider than the PDF page, scale by width
          imgPdfHeight = cardWidthMm / imgAspectRatio
        } else {
          // Image is taller than the PDF page, scale by height
          imgPdfWidth = cardHeightMm * imgAspectRatio
        }

        // Center the image on the PDF page
        const xOffset = (cardWidthMm - imgPdfWidth) / 2
        const yOffset = (cardHeightMm - imgPdfHeight) / 2

        pdf.addImage(imgData, "PNG", xOffset, yOffset, imgPdfWidth, imgPdfHeight)

        pdf.save(`Gym_Membership_Card_${fullName.replace(/\s/g, "_")}.pdf`)
        toast.success("Membership card PDF generated successfully!", { id: toastId })
      } catch (error) {
        console.error("Error generating membership card PDF:", error)
        toast.error("Failed to generate membership card PDF.", { id: toastId })
      }
    },
  }))

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-md mx-auto bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
    >
      {/* Background pattern - simplified with dots */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#333 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      ></div>

      {/* Front of the card */}
      <div className="relative p-6 flex flex-col items-center text-center z-10">
        <Dumbbell className="w-16 h-16 text-white mb-4" />
        <h2 className="text-3xl font-bold uppercase tracking-wider mb-2">Gym Membership</h2>
        <p className="text-lg font-semibold text-gray-300 mb-6">{clientData.membershipType || "Standard"}</p>

        {/* Gym silhouettes placeholder */}
     <img
          src={`${process.env.NEXT_PUBLIC_BASE_URL}${clientData.profilePictureUrl || ""}`}
          alt="Gym silhouettes"
          className="w-full  h-48 object-cover object-bottom opacity-80 mb-6"
        />

        <div className="w-full text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Member Name:</span>
            <span className="text-lg font-semibold">{fullName || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Membership ID:</span>
            <span className="text-lg font-semibold">{clientData.customerId || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Start Date:</span>
            <span className="text-lg font-semibold">{membershipStart}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">End Date:</span>
            <span className="text-lg font-semibold">{membershipEnd}</span>
          </div>
        </div>
      </div>

      {/* Back of the card (simplified, could be a separate component or hidden) */}
      <div className="relative p-6 border-t border-gray-700 flex flex-col items-center text-center z-10">
        <h3 className="text-xl font-bold mb-4">{fullName || "Client Name"}</h3>
        <div className="w-full text-left space-y-2 text-gray-300">
          {clientData.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{clientData.phoneNumber}</span>
            </div>
          )}
          {clientData.address && (
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-400" />
              <span>{clientData.address}</span>
            </div>
          )}
          {clientData.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{clientData.email}</span>
            </div>
          )}
        </div>
        <div className="mt-6 p-2 bg-white rounded-md">
          {/* QR Code Placeholder */}
          <QrCode className="w-20 h-20 text-gray-800" />
          <p className="text-xs text-gray-600 mt-1">Scan for details</p>
        </div>
      </div>
    </div>
  )
})

GymMembershipCard.displayName = "GymMembershipCard"

export default GymMembershipCard
