import { queryOneWithRLS, queryWithRLS } from '@nextsparkjs/core/lib/db'
import type {
  Product,
  ProductListOptions,
  ProductListResult,
  ProductCategory,
} from './products.types'

interface DbProduct {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: ProductCategory
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    price: row.price,
    stock: row.stock,
    category: row.category,
    imageUrl: row.imageUrl ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export class ProductsService {
  static async getById(id: string, userId: string): Promise<Product | null> {
    const row = await queryOneWithRLS<DbProduct>(
      `SELECT id, name, description, price, stock, category, "imageUrl", "createdAt", "updatedAt"
       FROM products WHERE id = $1`,
      [id],
      userId
    )
    return row ? mapProduct(row) : null
  }

  static async list(
    userId: string,
    options: ProductListOptions = {}
  ): Promise<ProductListResult> {
    const {
      limit = 10,
      offset = 0,
      category,
      orderBy = 'createdAt',
      orderDir = 'desc',
    } = options

    const conditions: string[] = []
    const params: unknown[] = []
    let paramIndex = 1

    if (category) {
      conditions.push(`category = $${paramIndex}`)
      params.push(category)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const validOrderBy = ['name', 'price', 'stock', 'createdAt'].includes(orderBy)
      ? orderBy
      : 'createdAt'
    const validOrderDir = orderDir === 'asc' ? 'ASC' : 'DESC'
    const orderColumnMap: Record<string, string> = {
      name: 'name',
      price: 'price',
      stock: 'stock',
      createdAt: '"createdAt"',
    }
    const orderColumn = orderColumnMap[validOrderBy] || '"createdAt"'

    const countResult = await queryWithRLS<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM products ${whereClause}`,
      params,
      userId
    )
    const total = parseInt(countResult[0]?.count || '0', 10)

    params.push(limit, offset)
    const rows = await queryWithRLS<DbProduct>(
      `SELECT id, name, description, price, stock, category, "imageUrl", "createdAt", "updatedAt"
       FROM products ${whereClause}
       ORDER BY ${orderColumn} ${validOrderDir}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params,
      userId
    )

    return { products: rows.map(mapProduct), total }
  }
}
