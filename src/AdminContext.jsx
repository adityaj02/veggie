import { createContext, useContext, useState, useEffect } from 'react'
import { MENU_SECTIONS as DEFAULT_MENU_SECTIONS } from './menuData'

const AdminContext = createContext()

export function AdminProvider({ children }) {
  // Local state initialized with defaults
  const [heroBackdrop, setHeroBackdrop] = useState({ type: 'image', url: '/images/hero_food_spread.png' })
  const [menuBackdrop, setMenuBackdrop] = useState({ type: 'video', url: '/Chef_cooks_and_delivers_food_202608071354.mp4' })
  const [menuSections, setMenuSections] = useState(DEFAULT_MENU_SECTIONS)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch from backend on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, menuRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/menu')
        ])
        
        if (settingsRes.ok) {
          const settings = await settingsRes.json()
          const hero = settings.find(s => s.key === 'heroBackdrop')
          const menuBg = settings.find(s => s.key === 'menuBackdrop')
          if (hero) setHeroBackdrop(hero.value)
          if (menuBg) setMenuBackdrop(menuBg.value)
        }
        
        if (menuRes.ok) {
          const menuData = await menuRes.json()
          if (menuData && menuData.length > 0) {
            setMenuSections(menuData)
          }
        }
      } catch (err) {
        console.error("Failed to fetch from backend, using defaults/localStorage", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Push all changes to the live database
  const pushChanges = async () => {
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuData: menuSections,
          heroBackdrop,
          menuBackdrop
        })
      });
      if (!res.ok) throw new Error('Failed to push changes');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  // -- Menu Management Functions (Local State) --
  const addCategory = (category) => {
    setMenuSections(prev => [...prev, category])
  }

  const deleteCategory = (categoryId) => {
    setMenuSections(prev => prev.filter(s => s.id !== categoryId))
  }

  const updateCategory = (categoryId, updatedCategory) => {
    setMenuSections(prev => prev.map(s => s.id === categoryId ? updatedCategory : s))
  }

  const addItemToCategory = (categoryId, item) => {
    setMenuSections(prev => prev.map(s => {
      if (s.id === categoryId) {
        return { ...s, items: [...s.items, item] }
      }
      return s
    }))
  }

  const deleteItemFromCategory = (categoryId, itemId) => {
    setMenuSections(prev => prev.map(s => {
      if (s.id === categoryId) {
        return { ...s, items: s.items.filter(i => i.id !== itemId) }
      }
      return s
    }))
  }

  const updateItemInCategory = (categoryId, itemId, updatedItem) => {
    setMenuSections(prev => prev.map(s => {
      if (s.id === categoryId) {
        return {
          ...s,
          items: s.items.map(i => i.id === itemId ? updatedItem : i)
        }
      }
      return s
    }))
  }

  return (
    <AdminContext.Provider value={{
      heroBackdrop, setHeroBackdrop,
      menuBackdrop, setMenuBackdrop,
      menuSections, setMenuSections,
      addCategory, deleteCategory, updateCategory,
      addItemToCategory, deleteItemFromCategory, updateItemInCategory,
      pushChanges, isLoading
    }}>
      {isLoading ? (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        children
      )}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}

export const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export function BackgroundMedia({ media, className = "" }) {
  if (media.type === 'image') {
    return <img src={media.url} alt="Backdrop" className={className} style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
  }

  const ytId = getYoutubeVideoId(media.url);
  if (ytId) {
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&rel=0&modestbranding=1&playsinline=1`}
          style={{ width: '100%', height: '100%', pointerEvents: 'none', border: 'none', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.5)' }}
          allow="autoplay; encrypted-media"
        />
      </div>
    )
  }

  return <video src={media.url} className={className} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
}
