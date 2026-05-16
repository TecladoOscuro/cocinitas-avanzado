import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { recipes, getDifficultyColor } from '../data/recipes'

const allTags = [
  { key: 'salsas', label: '🧈 Salsas' },
  { key: 'carnes', label: '🥩 Carnes' },
  { key: 'pescado', label: '🐟 Pescado' },
  { key: 'pastas', label: '🍝 Pastas/Arroces' },
  { key: 'postres', label: '🧁 Postres' },
  { key: 'molecular', label: '🧪 Molecular' },
  { key: 'sous-vide', label: '⚗️ Sous Vide' },
  { key: 'francesa', label: '🇫🇷 Francesa' },
  { key: 'italiana', label: '🇮🇹 Italiana' },
  { key: 'espanola', label: '🇪🇸 Española' },
  { key: 'japonesa', label: '🇯🇵 Japonesa' },
  { key: 'vegetariano', label: '🌿 Vegetariano' },
  { key: 'facil', label: '⭐ Fácil' },
  { key: 'medio', label: '⭐⭐ Medio' },
  { key: 'avanzado', label: '⭐⭐⭐ Avanzado' },
  { key: 'escoffier', label: '🏰 Escoffier' },
  { key: 'modernista', label: '🔬 Modernista' },
  { key: 'entrantes', label: '🍤 Entrantes' },
  { key: 'tecnicas', label: '📐 Técnicas' },
]

export function Home() {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!activeTag) return recipes
    return recipes.filter((r) => r.tags?.includes(activeTag))
  }, [activeTag])

  return (
    <div className="bg-ac-bg text-ac-text min-h-dvh">
      <div className="fixed top-0 left-0 right-0 z-20 bg-ac-bg border-b border-ac-border pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center justify-between h-12 px-5">
          <h1 className="text-lg font-bold">⭐🍽️ Alta Cocina</h1>
          <span className="text-xs text-ac-muted bg-ac-surface rounded-full px-2.5 py-1">
            {filtered.length}/{recipes.length}
          </span>
        </div>
      </div>

      <div className="fixed top-[calc(3rem+env(safe-area-inset-top,0px))] left-0 right-0 z-10 bg-ac-bg border-b border-ac-border overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5 px-4 py-2 whitespace-nowrap">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${!activeTag ? 'bg-ac-accent text-white' : 'bg-ac-surface text-ac-muted'}`}
          >
            Todos
          </button>
          {allTags.map((tag) => (
            <button
              key={tag.key}
              onClick={() => setActiveTag(activeTag === tag.key ? null : tag.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${activeTag === tag.key ? 'bg-ac-accent text-white' : 'bg-ac-surface text-ac-muted'}`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-[calc(7rem+env(safe-area-inset-top,0px))] pb-8 px-4">
        <div className="space-y-3">
          {filtered.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/receta/${recipe.id}`}
              className="block bg-ac-card rounded-2xl border border-ac-border p-4 active:scale-[0.98] transition-transform duration-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium rounded-md px-2 py-0.5 ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                    <span className="text-xs text-ac-muted">{recipe.stars}</span>
                  </div>
                  <h2 className="text-base font-semibold leading-snug">{recipe.name}</h2>
                  <p className="text-xs text-ac-muted mb-1">{recipe.subtitle}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {recipe.tags?.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] text-ac-muted bg-ac-surface rounded px-1.5 py-0.5">{t}</span>
                    ))}
                  </div>
                  <p className="text-sm text-ac-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className="text-xs text-ac-muted">⏱ {recipe.totalTime}</span>
                    <span className="text-xs text-ac-muted">🍽 {recipe.servings}</span>
                    <span className="text-xs text-ac-muted">{recipe.kcal}</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-ac-border mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
