import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { MENU_SECTIONS, SECTION_EMOJI, searchProducts, getProductCount } from './menuData'
import { useCart } from './CartContext'
import './MenuPage.css'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ══════════════════════════════════════════════
   PRODUCT CARD
   ══════════════════════════════════════════════ */
function ProductCard({ item, sectionId }) {
  const { addToCart } = useCart()
  const emoji = SECTION_EMOJI[sectionId] || '🍽️'

  return (
    <div className="product-card" id={`product-${item.id}`}>
      <div className="product-card-image">
        {item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" />
        ) : (
          <div className="product-placeholder">{emoji}</div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-top">
          <h3 className="product-card-name">{item.name}</h3>
          <span className="product-card-price">₹{item.price}</span>
        </div>
        <p className="product-card-desc">{item.description}</p>
        <div className="product-card-footer">
          {item.featured && (
            <span className="product-badge product-badge-featured">
              <span className="material-symbols-outlined icon-filled">stars</span>
              Chef&apos;s Pick
            </span>
          )}
          {item.customizable && (
            <span className="product-badge product-badge-custom">
              <span className="material-symbols-outlined">tune</span>
              Customizable
            </span>
          )}
          <button
            className="product-order-btn"
            onClick={() => {
              addToCart(item)
              const el = document.createElement('div')
              el.innerHTML = '<span class="material-symbols-outlined" style="color: var(--secondary)">check_circle</span> Added!'
              el.style = 'position: fixed; top: 20px; right: 20px; background: var(--surface-container); padding: 12px 24px; border-radius: 8px; z-index: 9999; display: flex; gap: 8px; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid var(--glass-border); animation: fadeInUp 0.3s ease forwards;'
              document.body.appendChild(el)
              setTimeout(() => {
                el.style.animation = 'fadeInUp 0.3s ease reverse forwards'
                setTimeout(() => el.remove(), 300)
              }, 2000)
            }}
          >
            <span className="material-symbols-outlined">add_shopping_cart</span>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MENU SECTION BLOCK
   ══════════════════════════════════════════════ */
function MenuSectionBlock({ section }) {
  return (
    <div className="menu-section-block" id={`section-${section.id}`}>
      <div className="menu-section-header">
        <div className="menu-section-icon">
          <span className="material-symbols-outlined">{section.icon}</span>
        </div>
        <div className="menu-section-title-wrap">
          <h2 className="menu-section-title">{section.name}</h2>
          <p className="menu-section-desc">{section.description}</p>
        </div>
        <span className="menu-section-count">{section.items.length} items</span>
      </div>
      <div className="product-grid">
        {section.items.map((item) => (
          <ProductCard key={item.id} item={item} sectionId={section.id} />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SEARCH RESULTS VIEW
   ══════════════════════════════════════════════ */
function SearchResults({ results, query }) {
  if (results.length === 0) {
    return (
      <div className="menu-empty-state">
        <div className="menu-empty-emoji">🔍</div>
        <h3 className="menu-empty-title">No dishes found</h3>
        <p className="menu-empty-desc">
          We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try a different search term.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="search-results-header">
        <h2 className="search-results-title">Search Results</h2>
        <span className="search-results-count">
          {results.length} {results.length === 1 ? 'dish' : 'dishes'} found
        </span>
      </div>
      <div className="product-grid">
        {results.map((item) => (
          <div key={item.id} style={{ position: 'relative' }}>
            <ProductCard item={item} sectionId={item.sectionId} />
            <span className="search-result-section" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
              {item.sectionName}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN MENU PAGE
   ══════════════════════════════════════════════ */
export default function MenuPage() {
  const { cartCount, cartTotal } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState(MENU_SECTIONS[0]?.id || '')
  const [showBackTop, setShowBackTop] = useState(false)
  const navRef = useRef(null)
  const isScrollingRef = useRef(false)

  const totalProducts = useMemo(() => getProductCount(), [])

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    return searchProducts(searchQuery)
  }, [searchQuery])

  const isSearching = searchResults !== null

  // Scroll-spy: track which section is in view
  useEffect(() => {
    if (isSearching) return

    const handleScroll = () => {
      if (isScrollingRef.current) return

      const scrollY = window.scrollY + 160
      let current = MENU_SECTIONS[0]?.id || ''

      for (const section of MENU_SECTIONS) {
        const el = document.getElementById(`section-${section.id}`)
        if (el && el.offsetTop <= scrollY) {
          current = section.id
        }
      }

      setActiveSection(current)
      setShowBackTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSearching])

  // Scroll to section when category pill is clicked
  const scrollToSection = useCallback((sectionId) => {
    setActiveSection(sectionId)
    setSearchQuery('')

    const el = document.getElementById(`section-${sectionId}`)
    if (el) {
      isScrollingRef.current = true
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => {
        isScrollingRef.current = false
      }, 800)
    }
  }, [])

  // Keep active pill visible in horizontal scroll
  useEffect(() => {
    if (!navRef.current) return
    const activePill = navRef.current.querySelector('.menu-category-pill.active')
    if (activePill) {
      activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeSection])

  useGSAP(() => {
    // Liquid glass fade-up for menu sections
    gsap.utils.toArray('.menu-section-block').forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
          }
        }
      )
    })
  }, [isSearching])

  // Scroll to top
  const handleBackTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="menu-page">
      {/* ── Hero ── */}
      <section className="menu-hero">
        <div className="menu-hero-bg">
          <video
            className="menu-hero-video"
            src="/Chef_cooks_and_delivers_food_202608071354.mp4"
            autoPlay
            muted
            playsInline
            onEnded={(e) => e.target.pause()}
          />
          <div className="menu-hero-overlay" />
        </div>
        <div className="menu-hero-content">
          <div className="menu-hero-badge">
            <span className="material-symbols-outlined icon-filled">eco</span>
            100% Vegetarian
          </div>
          <h1>
            Our Complete <span className="accent">Menu</span>
          </h1>
          <p className="menu-hero-subtitle">
            Explore {totalProducts}+ handcrafted dishes across {MENU_SECTIONS.length} categories — from smoky tandoor to
            creamy curries, every bite tells a story.
          </p>

          <div className="menu-hero-stats">
            <div className="menu-hero-stat">
              <div className="menu-hero-stat-value">{totalProducts}+</div>
              <div className="menu-hero-stat-label">Dishes</div>
            </div>
            <div className="menu-hero-stat">
              <div className="menu-hero-stat-value">{MENU_SECTIONS.length}</div>
              <div className="menu-hero-stat-label">Categories</div>
            </div>
            <div className="menu-hero-stat">
              <div className="menu-hero-stat-value">100%</div>
              <div className="menu-hero-stat-label">Vegetarian</div>
            </div>
          </div>

          {/* Search */}
          <div className="menu-search-wrap">
            <span className="material-symbols-outlined menu-search-icon">search</span>
            <input
              type="text"
              className="menu-search-input"
              placeholder="Search paneer, noodles, biryani..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="menu-search"
            />
            {searchQuery && (
              <button
                className="menu-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Category Pills ── */}
      {!isSearching && (
        <nav className="menu-category-nav" aria-label="Menu categories">
          <div className="menu-category-nav-inner" ref={navRef}>
            {MENU_SECTIONS.map((section) => (
              <button
                key={section.id}
                className={`menu-category-pill ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => scrollToSection(section.id)}
                aria-label={section.name}
              >
                <span className="material-symbols-outlined">{section.icon}</span>
                {section.name}
                <span className="menu-category-pill-count">{section.items.length}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ── Content ── */}
      <div className="menu-content">
        {isSearching ? (
          <SearchResults results={searchResults} query={searchQuery} />
        ) : (
          MENU_SECTIONS.map((section) => (
            <MenuSectionBlock key={section.id} section={section} />
          ))
        )}
      </div>

      {/* ── Floating CTA ── */}
      {cartCount > 0 && (
        <div className="menu-floating-cta">
          <button onClick={() => {
            window.location.hash = '#/checkout'
          }}>
            <span className="material-symbols-outlined">shopping_bag</span>
            Checkout • ₹{cartTotal.toFixed(2)}
          </button>
        </div>
      )}

      {/* ── Back to Top ── */}
      <button
        className={`menu-back-top ${showBackTop ? 'visible' : ''}`}
        onClick={handleBackTop}
        aria-label="Back to top"
      >
        <span className="material-symbols-outlined">keyboard_arrow_up</span>
      </button>
    </div>
  )
}
