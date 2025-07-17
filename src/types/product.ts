
// NOUVEAUX TYPES : Produits
export type ProductRow = {
   id: number
  name: string
  description: string | null
  price: number
  stock_quantity: number
  category: string
  created_at: string
  updated_at: string
}

export type ProductCreateDTO = {
  name: string
  description?: string | null
  price: number
  stockQuantity: number
  category: string
}

export type ProductUpdateDTO = Partial<ProductCreateDTO>
