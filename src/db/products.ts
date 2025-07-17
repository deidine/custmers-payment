"use server"
import { ProductRow, ProductCreateDTO, ProductUpdateDTO } from "@/types/product"
import pool from "./dbconnect"
import { buildInsertQuery, buildUpdateQuery } from "./helpers";

 
 
// NOUVELLES FONCTIONS : CRUD Produits
 
export async function getAllProducts(page = 1, limit = 10): Promise<{ data: ProductRow[]; totalItems: number }> {
  const offset = (page - 1) * limit
  const queryData = `
    SELECT *
    FROM "public"."products"
    ORDER BY updated_at DESC
    LIMIT $1 OFFSET $2
  `
  const queryCount = `SELECT COUNT(*) AS "totalItems" FROM "public"."products"`
  try {
    const [resultData, resultCount] = await Promise.all([
      pool.query(queryData, [limit, offset]),
      pool.query(queryCount),
    ])
    const data = resultData.rows as ProductRow[]
    const totalItems = Number.parseInt(resultCount.rows[0].totalItems, 10)
    return { data, totalItems }
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

 
export async function getProductById(productId: number): Promise<ProductRow | null> {
  const query = `
    SELECT *
    FROM "public"."products"
    WHERE id = $1
  `
  try {
    const result = await pool.query(query, [productId])
    return result.rows[0] || null
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}
 
export async function createProduct(data: ProductCreateDTO): Promise<ProductRow> {
  const query = buildInsertQuery("products", data)
  try {
    const result = await pool.query(query, [data.name, data.description, data.price, data.stockQuantity, data.category])
    return result.rows[0] as ProductRow
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

 
export async function updateProduct(productId: number, data: ProductUpdateDTO): Promise<ProductRow | null> {
  const query = buildUpdateQuery("products", data, { findBy: "id" })
  try {
    const values = Object.values(data)
    const result = await pool.query(query, [...values, productId])
    return result.rows[0] || null
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}
 
export async function deleteProduct(productId: number): Promise<ProductRow | null> {
  const query = `DELETE FROM "public"."products" WHERE id = $1 RETURNING *`
  try {
    const result = await pool.query(query, [productId])
    return result.rows[0] || null
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

// NOUVELLES ACTIONS SERVEUR : CRUD Produits
 
export async function getProductsAction(page: number, limit: number) {
  try {
    const { data, totalItems } = await getAllProducts(page, limit)
    return { products: data, totalProducts: totalItems }
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    return { products: [], totalProducts: 0, error: "Échec du chargement des produits." }
  }
}

 
export async function getProductAction(productId: number) {
  try {
    const product = await getProductById(productId)
    return { product }
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error)
    return { product: null, error: "Échec du chargement du produit." }
  }
}

 
export async function createProductAction(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const stockQuantity = Number.parseInt(formData.get("stockQuantity") as string, 10)
    const category = formData.get("category") as string

    if (!name || !price || !stockQuantity || !category) {
      throw new Error("Tous les champs obligatoires doivent être remplis.")
    }

    const newProduct: ProductCreateDTO = {
      name,
      description: description || null,
      price,
      stockQuantity,
      category,
    }

    const product = await createProduct(newProduct)
    return { success: true, product }
  } catch (error: any) {
    console.error("Erreur lors de la création du produit:", error)
    return { success: false, error: error.message || "Échec de la création du produit." }
  }
}
 
export async function updateProductAction(productId: number, formData: FormData) {
  try {
    const updateData: ProductUpdateDTO = {}
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = formData.get("price") as string
    const stockQuantity = formData.get("stockQuantity") as string
    const category = formData.get("category") as string

    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description || null
    if (price) updateData.price = Number.parseFloat(price)
    if (stockQuantity) updateData.stockQuantity = Number.parseInt(stockQuantity, 10)
    if (category) updateData.category = category

    const updatedProduct = await updateProduct(productId, updateData)
    if (!updatedProduct) {
      throw new Error("Produit non trouvé ou aucune mise à jour effectuée.")
    }
    return { success: true, product: updatedProduct }
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du produit:", error)
    return { success: false, error: error.message || "Échec de la mise à jour du produit." }
  }
}

 
export async function deleteProductAction(productId: number) {
  try {
    const deletedProduct = await deleteProduct(productId)
    if (!deletedProduct) {
      throw new Error("Produit non trouvé ou impossible à supprimer.")
    }
    return { success: true }
  } catch (error: any) {
    console.error("Erreur lors de la suppression du produit:", error)
    return { success: false, error: error.message || "Échec de la suppression du produit." }
  }
}