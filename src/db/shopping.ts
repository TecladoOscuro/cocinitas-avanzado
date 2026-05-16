import Dexie, { type EntityTable } from 'dexie'
import type { ShoppingItem } from '../types'

const db = new Dexie('alta-cocina') as Dexie & {
  shopping: EntityTable<ShoppingItem, 'recipeId'>
}

db.version(1).stores({
  shopping: 'recipeId',
})

export async function getShoppingList(recipeId: string): Promise<Record<string, boolean>> {
  const item = await db.shopping.get(recipeId)
  return item?.items ?? {}
}

export async function toggleIngredient(recipeId: string, ingredientId: string): Promise<Record<string, boolean>> {
  const current = await db.shopping.get(recipeId)
  const items = current?.items ?? {}
  items[ingredientId] = !items[ingredientId]
  await db.shopping.put({ recipeId, items })
  return items
}

export async function clearShoppingList(recipeId: string): Promise<void> {
  await db.shopping.delete(recipeId)
}

export async function checkAll(recipeId: string, ingredientIds: string[]): Promise<Record<string, boolean>> {
  const items: Record<string, boolean> = {}
  ingredientIds.forEach((id) => { items[id] = true })
  await db.shopping.put({ recipeId, items })
  return items
}
