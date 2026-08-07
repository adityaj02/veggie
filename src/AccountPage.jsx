import React from 'react'
import { MENU_SECTIONS } from './menuData'
import './AccountPage.css'

const allItems = MENU_SECTIONS.flatMap(s => s.items)
const getMenuImg = (name) => {
  const item = allItems.find(i => i.name.toLowerCase().includes(name.toLowerCase()) && i.image);
  return item ? item.image : '/images/hero_food_spread.png';
}

export default function AccountPage() {
  // Using user provided mock data for the layout
  const user = {
    name: 'Aarav Sharma',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=2A2522&color=CBA366&size=128'
  }

  const recentOrders = [
    {
      id: 1,
      title: 'Dal Makhani & Garlic Naan',
      meta: 'Oct 24, 2023 • 2 Items',
      price: '₹340.00',
      status: 'Delivered',
      statusIcon: 'check_circle',
      statusClass: 'status-delivered',
      image: getMenuImg('Dal Makhani')
    },
    {
      id: 2,
      title: 'Kadhai Paneer Feast',
      meta: 'Today • 3 Items',
      price: '₹420.00',
      status: 'In Progress',
      statusIcon: 'schedule',
      statusClass: 'status-progress',
      image: getMenuImg('Kadhai Paneer')
    }
  ]

  const savedAddresses = [
    {
      id: 1,
      label: 'Home',
      icon: 'home',
      address: '14, Green Park Main\nApt 4B\nNew Delhi, 110016'
    },
    {
      id: 2,
      label: 'Office',
      icon: 'work',
      address: 'Cyber City, DLF Phase 2\nTower B, 4th Floor\nGurugram, 122002'
    }
  ]

  return (
    <div className="account-page">
      {/* Header Section */}
      <section className="account-header">
        <div className="account-profile-info">
          <div className="account-avatar">
            <img src={user.avatar} alt={user.name} />
          </div>
          <div>
            <h1 className="account-name">{user.name}</h1>
            <div className="account-contact">
              <span className="account-contact-item">
                <span className="material-symbols-outlined">call</span>
                {user.phone}
              </span>
              <span className="account-contact-item">
                <span className="material-symbols-outlined">mail</span>
                {user.email}
              </span>
            </div>
          </div>
        </div>
        <button className="btn-edit-profile">
          <span className="material-symbols-outlined">edit</span>
          Edit Profile
        </button>
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
              <a href="#orders" className="account-link-primary">View All</a>
            </div>
            
            <div className="order-list">
              {recentOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-image">
                    <img src={order.image} alt={order.title} />
                  </div>
                  <div className="order-details">
                    <div className="order-header">
                      <div>
                        <h3 className="order-title">{order.title}</h3>
                        <p className="order-meta">{order.meta}</p>
                      </div>
                      <span className="order-price">{order.price}</span>
                    </div>
                    <div>
                      <span className={`order-status ${order.statusClass}`}>
                        <span className="material-symbols-outlined">{order.statusIcon}</span>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
              {savedAddresses.map(addr => (
                <div key={addr.id} className="address-card">
                  <div className="address-title">
                    <span className="material-symbols-outlined">{addr.icon}</span>
                    {addr.label}
                  </div>
                  <p className="address-text" style={{ whiteSpace: 'pre-line' }}>
                    {addr.address}
                  </p>
                  <button className="address-options">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Settings & Actions */}
        <div className="account-column">
          <section className="account-section-card">
            <h2 className="account-section-title" style={{ marginBottom: '16px' }}>Account Settings</h2>
            
            <div className="settings-list">
              <a href="#payment" className="settings-item">
                <div className="settings-item-label">
                  <span className="material-symbols-outlined">credit_card</span>
                  Payment Methods
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </a>
              <a href="#support" className="settings-item">
                <div className="settings-item-label">
                  <span className="material-symbols-outlined">support_agent</span>
                  Help &amp; Support
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </a>
              <a href="#privacy" className="settings-item">
                <div className="settings-item-label">
                  <span className="material-symbols-outlined">shield</span>
                  Privacy Policy
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </a>
            </div>
          </section>

          <button className="btn-logout">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
