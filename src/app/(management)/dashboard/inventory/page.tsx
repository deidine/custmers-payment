"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
 import { ProductRow } from "@/types/product"
import { createProductAction, deleteProductAction, getProductsAction, updateProductAction } from "@/db/products"
 
export default function InventoryPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const productsPerPage = 5

  const [isPending, startTransition] = useTransition()

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    const {
      products: fetchedProducts,
      totalProducts: fetchedTotal,
      error: fetchError,
    } = await getProductsAction(currentPage, productsPerPage)
    if (fetchError) {
      setError(fetchError)
    } else {
      setProducts(fetchedProducts)
      setTotalProducts(fetchedTotal)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [currentPage]) // Re-fetch when page changes

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    let result: { success: boolean; error?: string }

    startTransition(async () => {
      if (editingProduct) {
        result = await updateProductAction(editingProduct.id, formData)
      } else {
        result = await createProductAction(formData)
      }

      if (result.success) {
        setShowForm(false)
        setEditingProduct(null)
        fetchProducts() // Re-fetch products to update the list
      } else {
        setError(result.error || "Une erreur est survenue lors de l'opération.")
      }
    })
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return
    }
    startTransition(async () => {
      const result = await deleteProductAction(productId)
      if (result.success) {
        fetchProducts() // Re-fetch products
      } else {
        setError(result.error || "Échec de la suppression du produit.")
      }
    })
  }

  const handleEditClick = (product: ProductRow) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleAddClick = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const totalPages = Math.ceil(totalProducts / productsPerPage)

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8 lg:p-10">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Gestion de l'Inventaire</h1>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
        >
          Ajouter un Produit
        </button>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {editingProduct ? "Modifier le Produit" : "Ajouter un Nouveau Produit"}
          </h2>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                Nom du Produit:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={editingProduct?.name || ""}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                Catégorie:
              </label>
              <input
                type="text"
                id="category"
                name="category"
                defaultValue={editingProduct?.category || ""}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">
                Prix (€):
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                defaultValue={editingProduct?.price || ""}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="stockQuantity" className="block text-gray-700 text-sm font-bold mb-2">
                Quantité en Stock:
              </label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                defaultValue={editingProduct?.stock_quantity || ""}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                Description:
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={editingProduct?.description || ""}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              ></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Enregistrement..." : editingProduct ? "Mettre à Jour" : "Ajouter le Produit"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Liste des Produits</h2>
        {loading ? (
          <p className="text-center text-gray-600">Chargement des produits...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-600">Aucun produit trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nom
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Catégorie
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Prix
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock_quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalProducts > productsPerPage && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isPending}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Précédent
            </button>
            <span className="text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isPending}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
