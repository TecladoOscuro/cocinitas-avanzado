import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipeById, getDifficultyColor } from '../data/recipes'
import { getShoppingList, toggleIngredient, clearShoppingList } from '../db/shopping'
import type { Ingredient } from '../types'

type Tab = 'ingredientes' | 'preparacion' | 'chef'
type IngredientMode = 'lista' | 'compra'

export function Detail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const recipe = getRecipeById(id ?? '')

  const [activeTab, setActiveTab] = useState<Tab>('ingredientes')
  const [ingredientMode, setIngredientMode] = useState<IngredientMode>('lista')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (id) {
      getShoppingList(id).then(setChecklist)
    }
    window.scrollTo(0, 0)
  }, [id])

  const handleToggle = useCallback(async (ingredientId: string) => {
    if (!id) return
    const updated = await toggleIngredient(id, ingredientId)
    setChecklist(updated)
  }, [id])

  const handleClear = useCallback(async () => {
    if (!id) return
    await clearShoppingList(id)
    setChecklist({})
  }, [id])

  if (!recipe) {
    return (
      <div className="min-h-dvh bg-ac-bg flex items-center justify-center p-5 text-ac-text">
        <div className="text-center">
          <p className="text-ac-muted mb-3">Receta no encontrada</p>
          <button onClick={() => navigate('/')} className="text-ac-accent font-medium">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const checkedCount = Object.values(checklist).filter(Boolean).length
  const totalIngredients = recipe.ingredients.length

  return (
    <div className="bg-ac-bg text-ac-text min-h-dvh">
      <NavBar title={recipe.name} onBack={() => navigate('/')} />
      <TabBar activeTab={activeTab} onTab={setActiveTab} />

      <div className="pt-[calc(6.5rem+env(safe-area-inset-top,0px))] px-5 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-medium rounded-md px-2 py-0.5 ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
          <span className="text-xs text-ac-accent">{recipe.stars}</span>
        </div>
        <h1 className="text-lg font-bold mb-0.5">{recipe.name}</h1>
        <p className="text-xs text-ac-muted mb-2">{recipe.subtitle}</p>
        <div className="flex items-center gap-3 mb-2 text-xs text-ac-muted">
          <span>⏱ {recipe.totalTime}</span>
          <span>🍽 {recipe.servings}</span>
          <span>{recipe.kcal}</span>
        </div>
        <p className="text-sm text-ac-muted leading-relaxed mb-10">{recipe.story}</p>

        {activeTab === 'ingredientes' && (
          <IngredientsTab
            ingredients={recipe.ingredients}
            mode={ingredientMode}
            onModeChange={setIngredientMode}
            checklist={checklist}
            onToggle={handleToggle}
            onClear={handleClear}
            checkedCount={checkedCount}
            totalIngredients={totalIngredients}
          />
        )}

        {activeTab === 'preparacion' && (
          <PreparationTab
            steps={recipe.prepSteps}
            chefTips={recipe.chefTips}
          />
        )}

        {activeTab === 'chef' && (
          <ChefTab recipe={recipe} />
        )}
      </div>
    </div>
  )
}

function NavBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-ac-bg border-b border-ac-border pt-[env(safe-area-inset-top,0px)]">
      <div className="flex items-center h-12 px-2">
        <button onClick={onBack} className="flex items-center gap-1 text-ac-accent font-medium text-sm px-2 py-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Inicio
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-sm font-semibold truncate px-2">{title}</h2>
        </div>
        <div className="w-16" />
      </div>
    </div>
  )
}

function TabBar({ activeTab, onTab }: { activeTab: Tab; onTab: (t: Tab) => void }) {
  return (
    <div className="fixed top-[calc(3rem+env(safe-area-inset-top,0px))] left-0 right-0 z-10 bg-ac-bg border-b border-ac-border">
      <div className="flex">
        <button
          onClick={() => onTab('ingredientes')}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${activeTab === 'ingredientes' ? 'text-ac-accent border-b-2 border-ac-accent' : 'text-ac-muted'}`}
        >
          🛒 Ingredientes
        </button>
        <button
          onClick={() => onTab('preparacion')}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${activeTab === 'preparacion' ? 'text-ac-accent border-b-2 border-ac-accent' : 'text-ac-muted'}`}
        >
          🔥 Preparación
        </button>
        <button
          onClick={() => onTab('chef')}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${activeTab === 'chef' ? 'text-ac-accent border-b-2 border-ac-accent' : 'text-ac-muted'}`}
        >
          👨‍🍳 El Chef
        </button>
      </div>
    </div>
  )
}

function IngredientsTab({
  ingredients, mode, onModeChange, checklist, onToggle, onClear, checkedCount, totalIngredients,
}: {
  ingredients: Ingredient[]; mode: IngredientMode; onModeChange: (m: IngredientMode) => void
  checklist: Record<string, boolean>; onToggle: (id: string) => void; onClear: () => void
  checkedCount: number; totalIngredients: number
}) {
  const categories = [...new Set(ingredients.map((i) => i.category))]
  const catLabel: Record<string, string> = {
    base: 'Base',
    proteina: 'Proteína',
    verdura: 'Verdura',
    lacteo: 'Lácteo',
    elaboracion: 'Elaboración',
    postre: 'Postre',
    condimentos: 'Condimentos',
    especial: 'Especial',
    tecnicas: 'Técnicas',
    bebida: 'Bebida',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-ac-surface rounded-lg p-0.5">
          <button onClick={() => onModeChange('lista')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${mode === 'lista' ? 'bg-ac-border text-ac-text' : 'text-ac-muted'}`}>
            📋 Lista
          </button>
          <button onClick={() => onModeChange('compra')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${mode === 'compra' ? 'bg-ac-green text-white' : 'text-ac-muted'}`}>
            ✅ Modo compra
          </button>
        </div>
        {mode === 'compra' && (
          <button onClick={onClear} disabled={checkedCount === 0} className={`text-xs ${checkedCount === 0 ? 'text-ac-border' : 'text-ac-muted'}`}>
            Limpiar
          </button>
        )}
      </div>

      {mode === 'compra' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-ac-muted mb-2">
            <span>{checkedCount}/{totalIngredients}</span>
          </div>
          <div className="w-full bg-ac-surface rounded-full h-1.5">
            <div className="bg-ac-green h-1.5 rounded-full transition-all duration-300" style={{ width: `${(checkedCount / totalIngredients) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {categories.map((cat) => {
          const items = ingredients.filter((i) => i.category === cat)
          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-ac-muted uppercase tracking-wider mb-2">{catLabel[cat] ?? cat}</h3>
              {mode === 'lista' ? (
                <ul className="space-y-1.5">
                  {items.map((ing) => (
                    <li key={ing.id} className="text-sm flex justify-between py-1.5 border-b border-ac-border last:border-0">
                      <span>{ing.name}</span>
                      <span className="text-ac-muted text-xs font-medium ml-2 shrink-0">{ing.quantity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-1">
                  {items.map((ing) => {
                    const checked = checklist[ing.id] ?? false
                    return (
                      <li key={ing.id}>
                        <button onClick={() => onToggle(ing.id)} className="w-full flex items-center gap-3 py-2.5 border-b border-ac-border last:border-0 active:bg-ac-surface -mx-2 px-2 rounded-lg">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${checked ? 'bg-ac-green border-ac-green' : 'border-ac-border'}`}>
                            {checked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <span className={`text-sm ${checked ? 'text-ac-muted line-through' : 'text-ac-text'}`}>{ing.name}</span>
                          </div>
                          <span className="text-xs text-ac-muted font-medium shrink-0">{ing.quantity}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PreparationTab({ steps, chefTips }: { steps: { order: number; description: string; time?: string; heatLevel?: string; technique?: { title: string; description: string } }[]; chefTips: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-5">Pasos</h3>
      <div className="space-y-4 mb-6">
        {steps.map((step) => (
          <div key={step.order} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-ac-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
                {step.order}
              </div>
              {step.order < steps.length && <div className="w-0.5 flex-1 bg-ac-border my-1" />}
            </div>
            <div className="flex-1 pb-4">
              <p className="text-sm leading-relaxed">{step.description}</p>
              {(step.time || step.heatLevel) && (
                <div className="flex gap-3 mt-1.5">
                  {step.time && <span className="text-xs text-ac-muted">⏱ {step.time}</span>}
                  {step.heatLevel && <span className="text-xs text-ac-accent-light font-medium">🔥 {step.heatLevel}</span>}
                </div>
              )}
              {step.technique && (
                <div className="mt-3 bg-ac-surface rounded-lg p-3 border border-ac-border">
                  <h4 className="text-xs font-semibold text-ac-accent-light mb-1">{step.technique.title}</h4>
                  <p className="text-xs text-ac-muted leading-relaxed">{step.technique.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {chefTips.length > 0 && (
        <div className="bg-ac-card rounded-xl p-4 border border-ac-border">
          <h3 className="text-sm font-semibold mb-3">Consejos del Chef</h3>
          <ul className="space-y-2">
            {chefTips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-ac-muted">
                <span className="text-ac-accent shrink-0">💡</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ChefTab({ recipe }: { recipe: { chef: string; restaurant: string; stars: string; contextTitle: string; context: string } }) {
  return (
    <div>
      <div className="bg-ac-card rounded-2xl border border-ac-border p-5 mb-6 text-center">
        <div className="text-3xl mb-2">{recipe.stars}</div>
        <h2 className="text-lg font-bold mb-1">{recipe.chef}</h2>
        <p className="text-sm text-ac-muted">{recipe.restaurant}</p>
      </div>
      <h3 className="text-sm font-semibold mb-3">{recipe.contextTitle}</h3>
      <p className="text-sm text-ac-muted leading-relaxed whitespace-pre-line">{recipe.context}</p>
    </div>
  )
}
