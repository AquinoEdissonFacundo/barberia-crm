export type ProductCategory = 'shampoo' | 'conditioner' | 'styling' | 'tools' | 'other'

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  category: ProductCategory
  imageUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ProductListOptions {
  limit?: number
  offset?: number
  category?: ProductCategory
  orderBy?: 'name' | 'price' | 'stock' | 'createdAt'
  orderDir?: 'asc' | 'desc'
}

export interface ProductListResult {
  products: Product[]
  total: number
}

export interface CreateProductInput {
  name: string
  description?: string
  price: number
  stock?: number
  category?: ProductCategory
  imageUrl?: string | null
}

export interface UpdateProductInput {
  name?: string
  description?: string
  price?: number
  stock?: number
  category?: ProductCategory
  imageUrl?: string | null
}
