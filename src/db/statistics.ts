"use server"

import pool from "./dbconnect"
import type { PaymentRow, CustomerRow, SubscriptionRow } from "@/types"
 import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { Buffer } from "buffer"

 
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // Dimanche - 0, Lundi - 1, ..., Samedi - 6
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajuster pour le dimanche
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

 
export async function getPaymentStatistics() {
  // Récupère un nombre raisonnable de paiements pour les calculs statistiques
  const { data: payments } = await getAllPayments(1, 1000)

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Réinitialise l'heure pour une comparaison précise

  const startOfWeek = getStartOfWeek(today)
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  startOfMonth.setHours(0, 0, 0, 0)

  let totalPaymentsToday = 0
  let totalPaymentsThisWeek = 0
  let totalPaymentsThisMonth = 0

  const dailyPaymentsMap = new Map<string, number>() // YYYY-MM-DD -> montant

  payments.forEach((payment) => {
    const paymentDate = new Date(payment?.payment_date)
    paymentDate.setHours(0, 0, 0, 0) // Réinitialise l'heure pour une comparaison précise

    // Agrégation pour aujourd'hui
    if (paymentDate.toDateString() === today.toDateString()) {
      totalPaymentsToday += payment?.amount
    }

    // Agrégation pour cette semaine
    if (paymentDate >= startOfWeek && paymentDate <= today) {
      totalPaymentsThisWeek += payment?.amount
    }

    // Agrégation pour ce mois
    if (paymentDate >= startOfMonth && paymentDate <= today) {
      totalPaymentsThisMonth += payment?.amount
    }

    // Pour les données du graphique (30 derniers jours)
    const dateKey = paymentDate.toISOString().split("T")[0]
    dailyPaymentsMap.set(dateKey, (dailyPaymentsMap.get(dateKey) || 0) + payment?.amount)
  })

  // Génère les données pour les 30 derniers jours pour le graphique
  const dailyPaymentData = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateKey = d.toISOString().split("T")[0]
    dailyPaymentData.push({
      date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }), // Format pour l'étiquette du graphique
      amount: dailyPaymentsMap.get(dateKey) || 0,
    })
  }

  return {
    totalPaymentsToday,
    totalPaymentsThisWeek,
    totalPaymentsThisMonth,
    dailyPaymentData,
    recentPayments: payments.slice(0, 5), // Récupère les 5 paiements les plus récents
  }
}

 
export async function getCustomerStatistics() {
  const { data: customers } = await getAllCustomers(1, 1000) // Récupère tous les clients

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  startOfMonth.setHours(0, 0, 0, 0)

  let newCustomersThisMonth = 0
  customers.forEach((customer) => {
    const joinDate = new Date(customer?.date_of_joining)
    joinDate.setHours(0, 0, 0, 0)
    if (joinDate >= startOfMonth && joinDate <= today) {
      newCustomersThisMonth++
    }
  })

  return {
    totalCustomers: customers.length,
    newCustomersThisMonth,
  }
}

// Type pour les filtres de paiement
type Filters = {
  status?: string
  dateFrom?: string
  dateTo?: string
  customerId?: string
  unpaidInMonth?: string
}

 
export async function getAllPayments(
  page = 1,
  limit = 10,
  filters: Filters = {},
): Promise<{ data: PaymentRow[]; totalItems: number }> {
  const offset = (page - 1) * limit
  const whereClauses: string[] = []
  const values: any[] = []
  let idx = 1

  if (filters.status) {
    whereClauses.push(`p.status = $${idx++}`)
    values.push(filters.status)
  }
  if (filters.dateFrom) {
    whereClauses.push(`p.payment_date >= $${idx++}`)
    values.push(filters.dateFrom)
  }
  if (filters.dateTo) {
    whereClauses.push(`p.payment_date <= $${idx++}`)
    values.push(filters.dateTo)
  }
  if (filters.customerId) {
    whereClauses.push(`p.customer_id = $${idx++}`)
    values.push(filters.customerId)
  }
  if (filters.unpaidInMonth) {
    whereClauses.push(`p.status = 'PENDING'`)
    whereClauses.push(`TO_CHAR(p.payment_date, 'YYYY-MM') = $${idx++}`)
    values.push(filters.unpaidInMonth)
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : ""

  const queryData = `
    SELECT
      p.*,
      c.first_name || ' ' || c.last_name AS customer_name
    FROM "public"."payments" p
    LEFT JOIN "public"."customers" c ON p.customer_id = c.customer_id
    ${where}
    ORDER BY p.payment_date DESC
    LIMIT $${idx++} OFFSET $${idx}
  `
  const queryCount = `
    SELECT COUNT(*) AS "totalItems"
    FROM "public"."payments" p
    ${where}
  `

  try {
    const [resultData, resultCount] = await Promise.all([
      pool.query(queryData, [...values, limit, offset]),
      pool.query(queryCount, values),
    ])
    const data = resultData.rows as PaymentRow[]
    const totalItems = Number.parseInt(resultCount.rows[0].totalItems, 10)
    return { data, totalItems }
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

 
export async function getAllCustomers(page = 1, limit = 10): Promise<{ data: CustomerRow[]; totalItems: number }> {
  const offset = (page - 1) * limit
  const queryData = `
    SELECT *
    FROM "public"."customers"
    ORDER BY updated_at DESC
    LIMIT $1 OFFSET $2
  `
  const queryCount = `SELECT COUNT(*) AS "totalItems" FROM "public"."customers"`
  try {
    const [resultData, resultCount] = await Promise.all([
      pool.query(queryData, [limit, offset]),
      pool.query(queryCount),
    ])
    const data = resultData.rows as CustomerRow[]
    const totalItems = Number.parseInt(resultCount.rows[0].totalItems, 10)
    return { data, totalItems }
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

 
export async function getCustomerById(customerId: number): Promise<CustomerRow | null> {
  const query = `
    SELECT *
    FROM "public"."customers"
    WHERE customer_id = $1
  `
  try {
    const result = await pool.query(query, [customerId])
    return result.rows[0] || null
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

 
export async function getSubscriptionByCustomerId(customerId: number): Promise<SubscriptionRow | null> {
  const query = `SELECT * FROM "public"."customers" WHERE "customer_id" = $1 ORDER BY updated_at DESC LIMIT 1`
  try {
    const result = await pool.query(query, [customerId])
    return result.rows[0] || null
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}


 
export async function generateSubscriptionPdf(customerId: number): Promise<string | null> {
  try {
    const customer = await getCustomerById(customerId)
    const subscription = await getSubscriptionByCustomerId(customerId)

    if (!customer) {
      throw new Error(`Client avec l'ID ${customerId} non trouvé.`)
    }
    if (!subscription) {
      throw new Error(`Aucune souscription trouvée pour le client avec l'ID ${customerId}.`)
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const { width, height } = page.getSize()
    const margin = 50
    let y = height - margin

    // En-tête de l'entreprise
    page.drawText("Votre Entreprise de Cours", {
      x: margin,
      y: y,
      font: boldFont,
      size: 24,
      color: rgb(0.1, 0.1, 0.4), // Bleu foncé
    })
    y -= 20
    page.drawText("Service de Souscription", {
      x: margin,
      y: y,
      font: font,
      size: 14,
      color: rgb(0.3, 0.3, 0.3),
    })
    y -= 40

    // Titre du document
    page.drawText("Détails de la Souscription Client", {
      x: margin,
      y: y,
      font: boldFont,
      size: 20,
      color: rgb(0, 0, 0),
    })
    y -= 30

    // Informations du client
    page.drawText("Informations du Client:", {
      x: margin,
      y: y,
      font: boldFont,
      size: 14,
      color: rgb(0, 0, 0),
    })
    y -= 20
page.drawText(`Nom: ${customer?.first_name || 'N/A'} ${customer?.last_name || ''}`, {
  x : margin,
  y,
  font,
  size: 12,
})
    y -= 15
    page.drawText(`Email: ${customer?.email || "N/A"}`, {
      x: margin,
      y: y,
      font: font,
      size: 12,
      color: rgb(0, 0, 0),
    })
    y -= 15
    page.drawText(`Téléphone: ${customer?.phone_number || "N/A"}`, {
      x: margin,
      y: y,
      font: font,
      size: 12,
      color: rgb(0, 0, 0),
    })
    y -= 30

    // Informations de la souscription
    page.drawText("Détails de la Souscription:", {
      x: margin,
      y: y,
      font: boldFont,
      size: 14,
      color: rgb(0, 0, 0),
    })
    y -= 20
 
    // page.drawText(
    //   `Montant: ${subscription?.price_to_pay.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} / ${
    //     subscription?.frequency === "monthly" ? "mois" : subscription?.frequency === "quarterly" ? "trimestre" : "an"
    //   }`,
    //   {
    //     x: margin,
    //     y: y,
    //     font: font,
    //     size: 12,
    //     color: rgb(0, 0, 0),
    //   },
    // )
    // y -= 15
    page.drawText(
      `Statut: ${subscription?.status == "active" ? "Actif" : subscription?.status == "expired" ? "Expiré" : "Annulé"}`,
      {
        x: margin,
        y: y,
        font: font,
        size: 12,
        color: rgb(0, 0, 0),
      },
    )
    y -= 15
     if (subscription?.membership_start_date) {
         page.drawText(`Date de début: ${new Date(subscription?.membership_start_date).toLocaleDateString("fr-FR")}`, {
      x: margin,
      y: y,
      font: font,
      size: 12,
      color: rgb(0, 0, 0),
    })
    y -= 15
  }
    if (subscription?.end_date) {
      page.drawText(`Date de fin: ${new Date(subscription?.end_date).toLocaleDateString("fr-FR")}`, {
        x: margin,
        y: y,
        font: font,
        size: 12,
        color: rgb(0, 0, 0),
      })
      y -= 15
    }
    if (subscription?.next_payment_date) {
      page.drawText(`Prochain paiement: ${new Date(subscription?.next_payment_date).toLocaleDateString("fr-FR")}`, {
        x: margin,
        y: y,
        font: font,
        size: 12,
        color: rgb(0, 0, 0),
      })
      y -= 15
    }
    y -= 30

    // Pied de page
    page.drawText(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, {
      x: margin,
      y: margin,
      font: font,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    })

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes).toString("base64")
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error)
    return null
  }
}


 
export async function getPaymentsByCustomerId(customerId: number, limit = 5): Promise<PaymentRow[]> {
  const query = `
    SELECT *
    FROM "public"."payments"
    WHERE customer_id = $1
    ORDER BY payment_date DESC
    LIMIT $2
  `
  try {
    const result = await pool.query(query, [customerId, limit])
    return result.rows as PaymentRow[]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

 
async function drawSubscriptionDetails(
  page: any,
  customer: CustomerRow,
  subscription: SubscriptionRow,
  recentPayments: PaymentRow[],
  font: any,
  boldFont: any,
  margin: number,
  initialY: number,
) {
  let y = initialY

  // En-tête de l'entreprise
  page.drawText("Votre Entreprise de Cours", {
    x: margin,
    y: y,
    font: boldFont,
    size: 24,
    color: rgb(0.1, 0.1, 0.4), // Bleu foncé
  })
  y -= 20
  page.drawText("Service de Souscription", {
    x: margin,
    y: y,
    font: font,
    size: 14,
    color: rgb(0.3, 0.3, 0.3),
  })
  y -= 40

  // Titre du document
  page.drawText("Détails de la Souscription Client", {
    x: margin,
    y: y,
    font: boldFont,
    size: 20,
    color: rgb(0, 0, 0),
  })
  y -= 30

  // Informations du client
  page.drawText("Informations du Client:", {
    x: margin,
    y: y,
    font: boldFont,
    size: 14,
    color: rgb(0, 0, 0),
  })
  y -= 20
  page.drawText(`Nom: ${customer?.first_name || 'N/A'}  ${customer?.last_name || 'N/A'}`, {
    x: margin,
    y: y,
    font: font,
    size: 12,
    color: rgb(0, 0, 0),
  })
  y -= 15
  page.drawText(`Email: ${customer?.email || "N/A"}`, {
    x: margin,
    y: y,
    font: font,
    size: 12,
    color: rgb(0, 0, 0),
  })
  y -= 15
  page.drawText(`Téléphone: ${customer?.phone_number || "N/A"}`, {
    x: margin,
    y: y,
    font: font,
    size: 12,
    color: rgb(0, 0, 0),
  })
  y -= 15
  page.drawText(`Date d'adhésion: ${new Date(customer?.date_of_joining).toLocaleDateString("fr-FR")}`, {
    x: margin,
    y: y,
    font: font,
    size: 12,
    color: rgb(0, 0, 0),
  })
  y -= 30

  // Informations de la souscription
  page.drawText("Détails de la Souscription:", {
    x: margin,
    y: y,
    font: boldFont,
    size: 14,
    color: rgb(0, 0, 0),
  })
  y -= 20
  page.drawText(`Plan: ${subscription?.plan_name }`, {
    x: margin,
    y: y,
    font: font,
    size: 12,
    color: rgb(0, 0, 0),
  })
  y -= 15
  page.drawText(
    `Montant: ${subscription?.price_to_pay.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} / ${
      subscription?.frequency == "monthly" ? "mois" : subscription?.frequency == "quarterly" ? "trimestre" : "an"
    }`,
    {
      x: margin,
      y: y,
      font: font,
      size: 12,
      color: rgb(0, 0, 0),
    },
  )
  y -= 15
  page.drawText(
    `Statut: ${subscription?.status == "active" ? "Actif" : subscription?.status == "expired" ? "Expiré" : "Annulé"}`,
    {
      x: margin,
      y: y,
      font: font,
      size: 12,
      color: rgb(0, 0, 0),
    },
  )
  y -= 15
  page.drawText(`Date de début: ${new Date(subscription?.membership_start_date).toLocaleDateString("fr-FR")}`, {
    x: margin,
    y: y,
    font: font,
    size: 12,
    color: rgb(0, 0, 0),
  })
  y -= 15
  if (subscription?.end_date) {
    page.drawText(`Date de fin: ${new Date(subscription?.end_date).toLocaleDateString("fr-FR")}`, {
      x: margin,
      y: y,
      font: font,
      size: 12,
      color: rgb(0, 0, 0),
    })
    y -= 15
  }
  if (subscription?.next_payment_date) {
    page.drawText(`Prochain paiement: ${new Date(subscription?.next_payment_date).toLocaleDateString("fr-FR")}`, {
      x: margin,
      y: y,
      font: font,
      size: 12,
      color: rgb(0, 0, 0),
    })
    y -= 15
  }
  y -= 30

  // Historique des paiements récents
  page.drawText("Historique des Paiements Récents:", {
    x: margin,
    y: y,
    font: boldFont,
    size: 14,
    color: rgb(0, 0, 0),
  })
  y -= 20

  if (recentPayments.length > 0) {
    // En-têtes du tableau
    page.drawText("Date", { x: margin + 10, y: y, font: boldFont, size: 10 })
    page.drawText("Montant", { x: margin + 120, y: y, font: boldFont, size: 10 })
    page.drawText("Description", { x: margin + 220, y: y, font: boldFont, size: 10 })
    page.drawText("Statut", { x: margin + 400, y: y, font: boldFont, size: 10 })
    y -= 10
    page.drawLine({
      start: { x: margin, y: y },
      end: { x: page.getWidth() - margin, y: y },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    })
    y -= 10

    // Lignes du tableau
    recentPayments.forEach((payment) => {
      if (y < margin + 50) {
        // Si pas assez d'espace, ajouter une nouvelle page
        page = page.doc.addPage()
        y = page.getHeight() - margin
        page.drawText("Historique des Paiements Récents (suite):", {
          x: margin,
          y: y,
          font: boldFont,
          size: 14,
          color: rgb(0, 0, 0),
        })
        y -= 20
        page.drawText("Date", { x: margin + 10, y: y, font: boldFont, size: 10 })
        page.drawText("Montant", { x: margin + 120, y: y, font: boldFont, size: 10 })
        page.drawText("Description", { x: margin + 220, y: y, font: boldFont, size: 10 })
        page.drawText("Statut", { x: margin + 400, y: y, font: boldFont, size: 10 })
        y -= 10
        page.drawLine({
          start: { x: margin, y: y },
          end: { x: page.getWidth() - margin, y: y },
          thickness: 0.5,
          color: rgb(0.7, 0.7, 0.7),
        })
        y -= 10
      }

      page.drawText(new Date(payment?.payment_date).toLocaleDateString("fr-FR"), {
        x: margin + 10,
        y: y,
        font: font,
        size: 10,
      })
      page.drawText(payment?.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }), {
        x: margin + 120,
        y: y,
        font: font,
        size: 10,
      })
      page.drawText(payment?.description || "", {
        x: margin + 220,
        y: y,
        font: font,
        size: 10,
      })
      page.drawText(payment?.status == "PAID" ? "Payé" : payment?.status == "PENDING" ? "En attente" : "Annulé", {
        x: margin + 400,
        y: y,
        font: font,
        size: 10,
      })
      y -= 15
    })
  } else {
    page.drawText("Aucun paiement récent trouvé.", {
      x: margin,
      y: y,
      font: font,
      size: 12,
      color: rgb(0.5, 0.5, 0.5),
    })
    y -= 20
  }

  // Pied de page
  page.drawText(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, {
    x: margin,
    y: margin,
    font: font,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  })

  return y // Retourne la position Y actuelle
}

 
export async function generateAllSubscriptionsPdf(): Promise<string | null> {
  try {
    const { data: customers } = await getAllCustomers(1, 1000) // Récupère tous les clients
    const pdfDoc = await PDFDocument.create()

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const margin = 50

    for (const customer of customers) {
      const subscription = await getSubscriptionByCustomerId(customer?.customer_id)
      const recentPayments = await getPaymentsByCustomerId(customer?.customer_id, 5)

      if (subscription) {
        const page = pdfDoc.addPage()
        const { height } = page.getSize()
        console.log(`Generating PDF for customer: ${customer?.customer_id}`)
        console.log(
        
          customer, 
          
          margin,
          height - margin,
        )
        await drawSubscriptionDetails(
          page,
          customer,
          subscription,
          recentPayments,
          font,
          boldFont,
          margin,
          height - margin,
        )
      }
    }

    if (pdfDoc.getPages().length === 0) {
      // Si aucun PDF n'a été généré (aucun client avec souscription)
      const page = pdfDoc.addPage()
      const { width, height } = page.getSize()
      page.drawText("Aucune souscription client trouvée pour générer le PDF.", {
        x: width / 2 - 150,
        y: height / 2,
        font: font,
        size: 16,
        color: rgb(0.5, 0.5, 0.5),
      })
    }

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes).toString("base64")
  } catch (error) {
    console.error("Erreur lors de la génération du PDF pour tous les clients:", error)
    return null
  }
}
