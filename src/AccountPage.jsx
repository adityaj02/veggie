import React, { useState, useEffect } from 'react'
import { useAdmin, BackgroundMedia } from './AdminContext'
import { useAuth } from './AuthContext'
import './AccountPage.css'

export default function AccountPage() {
  const { menuSections, menuBackdrop } = useAdmin()
  const { user, login, logout } = useAuth()
  
  const [orders, setOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  const allItems = menuSections.flatMap(s => s.items)
  const getMenuImg = (name) => {
    const item = allItems.find(i => i.name.toLowerCase().includes(name.toLowerCase()) && i.image);
    return item ? item.image : '/images/hero_food_spread.png';
  }

  useEffect(() => {
    if (user) {
      setIsLoadingOrders(true)
      fetch('/api/orders/me')
        .then(r => r.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setIsLoadingOrders(false))
    }
  }, [user])

  if (!user) {
    return (
      <div className="account-page" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
        <div className="page-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
          <BackgroundMedia media={menuBackdrop} />
          <div className="page-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(20, 19, 19, 0.85)', backdropFilter: 'blur(12px)' }} />
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--primary)', marginBottom: '16px' }}>account_circle</span>
        <h1 className="text-headline-lg">Welcome to Veggies Kitchen</h1>
        <p className="text-body-lg" style={{ marginBottom: '24px', opacity: 0.8 }}>Please login to view your account, track orders, and manage addresses.</p>
        <button className="btn-primary glow-button" onClick={login} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">login</span>
          Login with Google
        </button>
      </div>
    )
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2A2522&color=CBA366&size=128`

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return 'check_circle'
      case 'Cancelled': return 'cancel'
      default: return 'schedule'
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return 'status-delivered'
      case 'Cancelled': return 'status-cancelled'
      default: return 'status-progress'
    }
  }

  return (
    <div className="account-page" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="page-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <BackgroundMedia media={menuBackdrop} />
        <div className="page-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(20, 19, 19, 0.85)', backdropFilter: 'blur(12px)' }} />
      </div>

      {/* Header Section */}
      <section className="account-header">
        <div className="account-profile-info">
          <div className="account-avatar">
            <img src={avatarUrl} alt={user.name} />
          </div>
          <div>
            <h1 className="account-name">{user.name}</h1>
            <div className="account-contact">
              <span className="account-contact-item">
                <span className="material-symbols-outlined">mail</span>
                {user.email}
              </span>
              {user.phone && (
                <span className="account-contact-item">
                  <span className="material-symbols-outlined">call</span>
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid Layout */}
      <div className="account-grid">
        {/* Left Column: Orders & Addresses */}
        <div className="account-column">
          
          {/* Recent Orders Section */}
          <section className="account-section-card">
            <div className="account-section-header">
              <h2 className="account-section-title">
                <div className="account-section-icon">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                Recent Orders
              </h2>
            </div>
            
            <div className="order-list">
              {isLoadingOrders ? (
                <p style={{ opacity: 0.7, padding: '16px' }}>Loading orders...</p>
              ) : orders.length === 0 ? (
                <p style={{ opacity: 0.7, padding: '16px' }}>You haven't placed any orders yet.</p>
              ) : (
                orders.map(order => {
                  const firstItemName = order.items && order.items.length > 0 ? order.items[0].name : 'Order'
                  const title = order.items && order.items.length > 1 ? `${firstItemName} + ${order.items.length - 1} more` : firstItemName
                  const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  
                  return (
                    <div key={order._id} className="order-item">
                      <div className="order-image">
                        <img src={getMenuImg(firstItemName)} alt={title} />
                      </div>
                      <div className="order-details">
                        <div className="order-header">
                          <div>
                            <h3 className="order-title">{title}</h3>
                            <p className="order-meta">{dateStr} • {order.items?.length || 0} Items</p>
                          </div>
                          <span className="order-price">₹{Number(order.total).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className={`order-status ${getStatusClass(order.status)}`}>
                            <span className="material-symbols-outlined">{getStatusIcon(order.status)}</span>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* Address Book Section */}
          <section className="account-section-card">
            <div className="account-section-header">
              <h2 className="account-section-title">
                <div className="account-section-icon">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                Saved Addresses
              </h2>
            </div>
            
            <div className="address-grid">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr, idx) => (
                  <div key={idx} className="address-card">
                    <div className="address-title">
                      <span className="material-symbols-outlined">home</span>
                      Address {idx + 1}
                    </div>
                    <p className="address-text" style={{ whiteSpace: 'pre-line' }}>
                      {addr.street}<br/>
                      {addr.city}, {addr.state} {addr.pincode}
                    </p>
                    <button className="address-options">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ opacity: 0.7, gridColumn: '1 / -1' }}>No addresses saved yet. Add one during checkout.</p>
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Settings & Actions */}
        <div className="account-column">
          <section className="account-section-card">
            <h2 className="account-section-title" style={{ marginBottom: '16px' }}>Account Settings</h2>
            
            <div className="settings-list">
              <div className="settings-item" style={{cursor: 'pointer'}} onClick={() => window.open('https://api.whatsapp.com/send/?phone=919811797407&text=' + encodeURIComponent('Hi Veggie Kitchen! I would like to manage my payment methods. I currently use Cash on Delivery.') + '&type=phone_number&app_absent=0', '_blank')}>
                <div className="settings-item-label">
                  <span className="material-symbols-outlined">credit_card</span>
                  Payment Methods
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
              <div className="settings-item" style={{cursor: 'pointer'}} onClick={() => window.open('https://api.whatsapp.com/send/?phone=919811797407&text=' + encodeURIComponent('Hi Veggie Kitchen! I need help and support with my account.') + '&type=phone_number&app_absent=0', '_blank')}>
                <div className="settings-item-label">
                  <span className="material-symbols-outlined">support_agent</span>
                  Help &amp; Support
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
              <a href="#/privacy" className="settings-item">
                <div className="settings-item-label">
                  <span className="material-symbols-outlined">shield</span>
                  Privacy Policy
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </a>
            </div>
          </section>

          <button className="btn-logout" onClick={logout}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
