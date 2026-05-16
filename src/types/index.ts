export interface Ingredient {
  id: string
  name: string
  quantity: string
  category: 'base' | 'proteina' | 'verdura' | 'lacteo' | 'elaboracion' | 'postre' | 'condimentos' | 'especial' | 'tecnicas' | 'bebida'
}

export interface TechniqueNote {
  title: string
  description: string
}

export interface PreparationStep {
  order: number
  description: string
  time?: string
  heatLevel?: string
  technique?: TechniqueNote
}

export interface Recipe {
  id: string
  name: string
  subtitle: string
  level: number
  difficulty: 'Muy fácil' | 'Fácil' | 'Media' | 'Media-Alta' | 'Difícil' | 'Avanzado'
  totalTime: string
  servings: string
  kcal: string
  description: string
  story: string
  tags: string[]
  ingredients: Ingredient[]
  prepSteps: PreparationStep[]
  chefTips: string[]
  contextTitle: string
  context: string
  chef: string
  restaurant: string
  stars: string
}

export interface ShoppingItem {
  recipeId: string
  items: Record<string, boolean>
}
