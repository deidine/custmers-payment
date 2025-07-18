import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";
import path from "path"
import fs from "fs/promises"
import { createCustomer, getAllCustomers, getCustomerByPhoneNumber } from "@/db/queries";
import { Customer, CustomerCreateDTO } from "@/types/customer";
import { formatError } from "@/utils/error-handlers";
import { getFilteredCustomers } from "@/db/payment";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const data: { [key: string]: any } = {}
    let profilePictureFile: File | null = null

    // Extract fields from FormData
    for (const [key, value] of formData.entries()) {
      if (key === "profilePictureFile" && value instanceof File) {
        profilePictureFile = value
      } else if (typeof value === "string") {
        data[key] = value
      }
      // Add more type handling if necessary for other fields (e.g., numbers, booleans)
    }

    // Check if phone number already exists
    const customer = await getCustomerByPhoneNumber(data.phoneNumber || "")
    if (customer) {
      return NextResponse.json({ error: "Phone number already exists" }, { status: 400 })
    }

    let profilePictureUrl: string | null = null
    const existingProfilePictureUrl = formData.get("profilePictureUrl") as string | null

    if (profilePictureFile && profilePictureFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "users", "profile_pictures")
      await fs.mkdir(uploadDir, { recursive: true }) // Ensure directory exists

      const fileExtension = path.extname(profilePictureFile.name)
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
      const fileName = `profile-${uniqueSuffix}${fileExtension}`
      const filePath = path.join(uploadDir, fileName)

      const arrayBuffer = await profilePictureFile.arrayBuffer()
      await fs.writeFile(filePath, Buffer.from(arrayBuffer))

      profilePictureUrl = `/uploads/users/profile_pictures/${fileName}` // Relative URL for public access
    } else if (existingProfilePictureUrl) {
      // No new file uploaded, retain existing URL
      profilePictureUrl = existingProfilePictureUrl
    }

    // Construct CustomerCreateDTO from formData
    const customerCreateDto: CustomerCreateDTO = {
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      email: data.email,
      phoneNumber: data.phoneNumber,
      emergencyPhone: data.emergencyPhone,
      emergencyContact: data.emergencyContact,
      streetAddress: data.streetAddress,
      city: data.city,
      state: data.state,
      stateCode: data.stateCode,
      membershipType: data.membershipType,
      status: data.status,
      membershipStartDate: data.membershipStartDate,
      membershipEndDate: data.membershipEndDate,
      priceToPay: Number.parseFloat(data.priceToPay), // Convert to number
      notes: data.notes,
      profilePictureUrl: profilePictureUrl, // This is the key that will be used
    }

    const response = await createCustomer(customerCreateDto) // Pass the DTO

    if (response) {
      return NextResponse.json({ message: "Customer created successfully" }, { status: 201 })
    } else {
      return NextResponse.json({ error: "Customer not created due to conflict or constraint" }, { status: 409 })
    }
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Error creating customer", details: formatError(error) }, { status: 500 })
  }
}

 
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    
    // Filter parameters
    const membershipType = searchParams.get("membershipType");
    const status = searchParams.get("status");
    const unpaidThisMonth = searchParams.get("unpaidThisMonth") === "true";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    
    if (
      isNaN(Number(page)) ||
      Number(page) < 0 ||
      isNaN(Number(limit)) ||
      Number(limit) < 0
    ) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Check if any filters are applied
    const hasFilters = membershipType || status || unpaidThisMonth || dateFrom || dateTo;

    let data: any[], totalItems: number;

    if (hasFilters) {
      // Use filtered query
      const filterParams = {
        membershipType: membershipType || undefined,
        status: status || undefined,
        unpaidThisMonth,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      
      const result = await getFilteredCustomers(
        Number(page),
        Number(limit),
        filterParams
      );
      data = result.data;
      totalItems = result.totalItems;
    } else {
      // Use regular query
      const result = await getAllCustomers(
        Number(page),
        Number(limit)
      );
      data = result.data;
      totalItems = result.totalItems;
    }

    const result: Customer[] =
      (camelcaseKeys(data, { deep: true }) as Customer[]) || [];
    return NextResponse.json({ result, totalItems });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching customers", details: formatError(error) },
      { status: 500 }
    );
  }
}
