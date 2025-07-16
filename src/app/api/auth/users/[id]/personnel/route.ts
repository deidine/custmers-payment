 
 import camelcaseKeys from "camelcase-keys"
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { getUserPersonnelDetailByUserId, getAllUsersPhoneNames, createOrUpdateUserPersonnelDetail, deleteUserPersonnelDetail } from "@/db/queries"

export async function GET(request: Request, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const userId = Number.parseInt(params.id, 10)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 })
    }

    const [personnelResult, userResult] = await Promise.allSettled([
      getUserPersonnelDetailByUserId(userId),
      getAllUsersPhoneNames(userId),
    ])

    const personnelDetail = personnelResult.status === "fulfilled" ? personnelResult.value : null
    const user = userResult.status === "fulfilled" ? userResult.value : null

    if (!personnelDetail) {
      if (user) {
        return NextResponse.json(camelcaseKeys(user, { deep: true }), {
          status: 200,
        })
      } else {
        return NextResponse.json({ message: "No data" }, { status: 404 })
      }
    }

    return NextResponse.json(
      {
        ...camelcaseKeys(personnelDetail, { deep: true }),
        ...camelcaseKeys(user ?? {}, { deep: true }),
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch personnel details" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id, 10)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 })
    }

    // Check if request contains FormData (file upload) or JSON
    const contentType = request.headers.get("content-type")
    let data: any
    let cvUrl: string | null = null
    let contractUrl: string | null = null

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (with potential file upload)
      const formData = await request.formData()

      // Handle CV file upload
      const cvFile = formData.get("cvFile") as File | null
      if (cvFile && cvFile.size > 0) {
        cvUrl = await handleFileUpload(cvFile, "cv", userId)
      } else {
        cvUrl = (formData.get("cvUrl") as string) || null
      }

      // Handle contract file upload
      const contractFile = formData.get("contractFile") as File | null
      if (contractFile && contractFile.size > 0) {
        contractUrl = await handleFileUpload(contractFile, "contract", userId)
      } else {
        contractUrl = (formData.get("contractUrl") as string) || null
      }

      // Extract other form fields
      data = {
        userId,
        personnel_date_of_joining: (formData.get("personnel_date_of_joining") as string) || "",
        personnel_address: (formData.get("personnel_address") as string) || "",
        cv_url: cvUrl || "",
        contract_url: contractUrl || "",
        salary: formData.get("salary") ? Number.parseFloat(formData.get("salary") as string) : 0,
        on_call_shifts_per_month: formData.get("on_call_shifts_per_month")
          ? Number.parseInt(formData.get("on_call_shifts_per_month") as string, 10)
          : 0,
        blacklist_reason: (formData.get("blacklist_reason") as string) || "",
        workDays: formData.get("workDays") ? JSON.parse(formData.get("workDays") as string) : {},
        substitutes: formData.get("substitutes") ? JSON.parse(formData.get("substitutes") as string) : [],
        loans: formData.get("loans") ? JSON.parse(formData.get("loans") as string) : [],
        incentives: formData.get("incentives") ? JSON.parse(formData.get("incentives") as string) : [],
        debts: formData.get("debts") ? JSON.parse(formData.get("debts") as string) : [],
        records: formData.get("records") ? JSON.parse(formData.get("records") as string) : [],
      }
    } else {
      // Handle JSON data (no file upload)
      data = (await request.json()) as any
      data.userId = userId
    }

    console.log(data)

    const newPersonnelDetail = await createOrUpdateUserPersonnelDetail(userId, data)
    return NextResponse.json(newPersonnelDetail, { status: 201 })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create personnel details" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 })
    }

    // Get current personnel details to preserve existing files if no new ones are uploaded
    const currentPersonnel = await getUserPersonnelDetailByUserId(id)

    // Check if request contains FormData (file upload) or JSON
    const contentType = request.headers.get("content-type")
    let data: any
    let cvUrl: string | null = currentPersonnel?.cv_url || null
    let contractUrl: string | null = currentPersonnel?.contract_url || null

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (with potential file upload)
      const formData = await request.formData()

      // Handle CV file upload
      const cvFile = formData.get("cvFile") as File | null
      if (cvFile && cvFile.size > 0) {
        // Delete old CV file if it exists
        if (currentPersonnel?.cv_url) {
          await deleteFile(currentPersonnel.cv_url)
        }
        cvUrl = await handleFileUpload(cvFile, "cv", id)
      } else if (formData.get("cvUrl")) {
        cvUrl = formData.get("cvUrl") as string
      }

      // Handle contract file upload
      const contractFile = formData.get("contractFile") as File | null
      if (contractFile && contractFile.size > 0) {
        // Delete old contract file if it exists
        if (currentPersonnel?.contract_url) {
          await deleteFile(currentPersonnel.contract_url)
        }
        contractUrl = await handleFileUpload(contractFile, "contract", id)
      } else if (formData.get("contractUrl")) {
        contractUrl = formData.get("contractUrl") as string
      }

      // Extract other form fields
      data = {
        userId: id,
        personnel_date_of_joining: (formData.get("personnel_date_of_joining") as string) || "",
        personnel_address: (formData.get("personnel_address") as string) || "",
        cv_url: cvUrl || "",
        contract_url: contractUrl || "",
        salary: formData.get("salary") ? Number.parseFloat(formData.get("salary") as string) : 0,
        on_call_shifts_per_month: formData.get("on_call_shifts_per_month")
          ? Number.parseInt(formData.get("on_call_shifts_per_month") as string, 10)
          : 0,
        blacklist_reason: (formData.get("blacklist_reason") as string) || "",
        workDays: formData.get("workDays") ? JSON.parse(formData.get("workDays") as string) : {},
        substitutes: formData.get("substitutes") ? JSON.parse(formData.get("substitutes") as string) : [],
        loans: formData.get("loans") ? JSON.parse(formData.get("loans") as string) : [],
        incentives: formData.get("incentives") ? JSON.parse(formData.get("incentives") as string) : [],
        debts: formData.get("debts") ? JSON.parse(formData.get("debts") as string) : [],
        records: formData.get("records") ? JSON.parse(formData.get("records") as string) : [],
      }
    } else {
      // Handle JSON data (no file upload)
      data = (await request.json()) as any
      // Keep existing file URLs if not provided in JSON
      if (!data.cv_url) {
        data.cv_url = currentPersonnel?.cv_url
      }
      if (!data.contract_url) {
        data.contract_url = currentPersonnel?.contract_url
      }
    }

    const updatedPersonnelDetail = await createOrUpdateUserPersonnelDetail(id, data)
    if (!updatedPersonnelDetail) {
      return NextResponse.json({ message: "Personnel details not found for update" }, { status: 404 })
    }
    return NextResponse.json(updatedPersonnelDetail)
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message || "Failed to update personnel details" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId, 10)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 })
    }

    // Get personnel details to delete associated files
    const personnel = await getUserPersonnelDetailByUserId(userId)
    if (personnel) {
      if (personnel.cv_url) {
        await deleteFile(personnel.cv_url)
      }
      if (personnel.contract_url) {
        await deleteFile(personnel.contract_url)
      }
    }

    const deletedPersonnelDetail = await deleteUserPersonnelDetail(userId)
    if (!deletedPersonnelDetail) {
      return NextResponse.json({ message: "Personnel details not found for deletion" }, { status: 404 })
    }
    return NextResponse.json({ message: "Personnel details deleted successfully" })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message || "Failed to delete personnel details" }, { status: 500 })
  }
}

// Helper function to handle file uploads
async function handleFileUpload(file: File, type: "cv" | "contract", userId: number): Promise<string> {
  // Validate file
  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    throw new Error("File size must be less than 10MB")
  }

  if (file.type !== "application/pdf") {
    throw new Error("File must be a PDF")
  }

  // Create upload directory
  const uploadDir = path.join(process.cwd(), "public", "uploads", "personnel", type)
  await fs.mkdir(uploadDir, { recursive: true })

  // Generate unique filename
  const fileExtension = path.extname(file.name)
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
  const fileName = `${type}-user-${userId}-${uniqueSuffix}${fileExtension}`
  const filePath = path.join(uploadDir, fileName)

  // Save file
  const arrayBuffer = await file.arrayBuffer()
  await fs.writeFile(filePath, Buffer.from(arrayBuffer))

  // Return the URL path
  return `/uploads/personnel/${type}/${fileName}`
}

// Helper function to delete files
async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), "public", fileUrl)
    await fs.unlink(filePath)
  } catch (error) {
    console.log("File not found or couldn't be deleted:", error)
  }
}
