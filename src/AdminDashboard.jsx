import { useState, useEffect } from 'react'
import { useAdmin } from './AdminContext'
import { useBlogs } from './BlogContext'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const {
    heroBackdrop, setHeroBackdrop,
    menuBackdrop, setMenuBackdrop,
    menuSections, setMenuSections,
    addCategory, deleteCategory, updateCategory,
    addItemToCategory, deleteItemFromCategory, updateItemInCategory,
    pushChanges
  } = useAdmin()

  const { blogs, deleteBlog } = useBlogs()

  const [activeTab, setActiveTab] = useState('settings')
  const [pushing, setPushing] = useState(false)

  const handlePushChanges = async () => {
    setPushing(true)
    const success = await pushChanges()
    setPushing(false)
    
    if (success) {
      const el = document.createElement('div')
      el.innerHTML = '<span class="material-symbols-outlined" style="color: var(--secondary)">check_circle</span> Changes Pushed Successfully!'
      el.style = 'position: fixed; top: 20px; right: 20px; background: var(--surface-container); padding: 12px 24px; border-radius: 8px; z-index: 9999; display: flex; gap: 8px; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid var(--glass-border); animation: fadeInUp 0.3s ease forwards; color: white;'
      document.body.appendChild(el)
      setTimeout(() => {
        el.style.animation = 'fadeInUp 0.3s ease reverse forwards'
        setTimeout(() => el.remove(), 300)
      }, 2500)
    } else {
      alert("Failed to push changes. Make sure the backend server is running.")
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar glass-panel">
        <h2 className="admin-sidebar-title">Admin Control</h2>
        <button 
          className="btn-primary glow-button" 
          style={{ width: '100%', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
          onClick={handlePushChanges}
          disabled={pushing}
        >
          <span className="material-symbols-outlined">cloud_upload</span>
          {pushing ? 'Pushing...' : 'Push Changes'}
        </button>
        <nav className="admin-nav">
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            <span className="material-symbols-outlined">settings</span> Site Settings
          </button>
          <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>
            <span className="material-symbols-outlined">restaurant_menu</span> Menu Management
          </button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            <span className="material-symbols-outlined">receipt_long</span> Orders
          </button>
          <button className={activeTab === 'blogs' ? 'active' : ''} onClick={() => setActiveTab('blogs')}>
            <span className="material-symbols-outlined">article</span> Manage Blogs
          </button>
          <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}>
            <span className="material-symbols-outlined">history</span> Activity Logs
          </button>
          <button onClick={() => window.location.hash = '#/write-blog'}>
            <span className="material-symbols-outlined">edit_document</span> Write New Blog
          </button>
        </nav>
      </aside>

      <main className="admin-content">
        {activeTab === 'settings' && (
          <SiteSettings 
            heroBackdrop={heroBackdrop} setHeroBackdrop={setHeroBackdrop}
            menuBackdrop={menuBackdrop} setMenuBackdrop={setMenuBackdrop}
          />
        )}
        {activeTab === 'menu' && (
          <MenuManagement 
            menuSections={menuSections} 
            addCategory={addCategory} 
            deleteCategory={deleteCategory} 
            updateCategory={updateCategory}
            addItemToCategory={addItemToCategory} 
            deleteItemFromCategory={deleteItemFromCategory} 
            updateItemInCategory={updateItemInCategory}
          />
        )}
        {activeTab === 'blogs' && (
          <BlogManagement blogs={blogs} deleteBlog={deleteBlog} />
        )}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'activity' && <AdminActivity />}
      </main>
    </div>
  )
}

function SiteSettings({ heroBackdrop, setHeroBackdrop, menuBackdrop, setMenuBackdrop }) {
  const handleHeroChange = (e) => {
    const { name, value } = e.target
    setHeroBackdrop(prev => ({ ...prev, [name]: value }))
  }

  const handleMenuBackdropChange = (e) => {
    const { name, value } = e.target
    setMenuBackdrop(prev => ({ ...prev, [name]: value }))
  }

  return (
    <section className="admin-section fluid-card">
      <h2>Site Settings</h2>
      <div className="admin-form-group">
        <h3>Home Page Hero Backdrop</h3>
        <label>Type</label>
        <select name="type" value={heroBackdrop.type} onChange={handleHeroChange}>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <label>URL</label>
        <input type="text" name="url" value={heroBackdrop.url} onChange={handleHeroChange} placeholder="e.g. /images/hero.png or https://..." />
      </div>

      <div className="admin-form-group">
        <h3>Menu Page Backdrop</h3>
        <label>Type</label>
        <select name="type" value={menuBackdrop.type} onChange={handleMenuBackdropChange}>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <label>URL</label>
        <input type="text" name="url" value={menuBackdrop.url} onChange={handleMenuBackdropChange} placeholder="e.g. /video.mp4 or https://..." />
      </div>
    </section>
  )
}

function MenuManagement({ menuSections, addCategory, deleteCategory, updateCategory, addItemToCategory, deleteItemFromCategory, updateItemInCategory }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(menuSections[0]?.id || '')

  const selectedCategory = menuSections.find(s => s.id === selectedCategoryId)

  const handleAddCategory = () => {
    const id = prompt("Enter category ID (e.g. 'new-category'):")
    if (!id) return
    const name = prompt("Enter category Name:")
    if (!name) return
    addCategory({ id, name, icon: 'restaurant', description: '', items: [] })
    setSelectedCategoryId(id)
  }

  const handleAddItem = () => {
    const name = prompt("Enter item name:")
    if (!name) return
    const price = parseFloat(prompt("Enter item price:")) || 0
    const image = prompt("Enter image URL:") || ''
    
    addItemToCategory(selectedCategoryId, {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      price,
      description: '',
      image,
      customizable: false,
      featured: false,
      tags: []
    })
  }

  return (
    <div className="admin-menu-management">
      <div className="admin-menu-sidebar">
        <h3>Categories</h3>
        <ul className="admin-category-list">
          {menuSections.map(cat => (
            <li key={cat.id} className={cat.id === selectedCategoryId ? 'active' : ''}>
              <span onClick={() => setSelectedCategoryId(cat.id)}>{cat.name}</span>
              <button className="icon-btn-small" onClick={() => deleteCategory(cat.id)}><span className="material-symbols-outlined">delete</span></button>
            </li>
          ))}
        </ul>
        <button className="btn-primary-sm" onClick={handleAddCategory}>+ Add Category</button>
      </div>

      <div className="admin-menu-details">
        {selectedCategory ? (
          <>
            <div className="admin-category-header">
              <h3>Items in {selectedCategory.name}</h3>
              <button className="btn-primary-sm" onClick={handleAddItem}>+ Add Item</button>
            </div>
            
            <div className="admin-item-grid">
              {selectedCategory.items.map(item => (
                <div key={item.id} className="admin-item-card glass-panel">
                  {item.image && <img src={item.image} alt={item.name} />}
                  <div className="admin-item-info">
                    <h4>{item.name}</h4>
                    <p>₹{item.price}</p>
                    <button className="btn-ghost-sm" onClick={() => deleteItemFromCategory(selectedCategory.id, item.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Select a category to view items.</p>
        )}
      </div>
    </div>
  )
}

function BlogManagement({ blogs, deleteBlog }) {
  if (!blogs || blogs.length === 0) {
    return (
      <section className="admin-section fluid-card">
        <h2>Manage Blogs</h2>
        <p>No blogs published yet.</p>
      </section>
    )
  }

  return (
    <section className="admin-section fluid-card">
      <h2>Manage Blogs</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        {blogs.map(blog => (
          <div key={blog.id} className="admin-item-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', width: '100%' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{blog.title}</h4>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>By {blog.author} • {blog.date}</p>
            </div>
            <button className="btn-ghost-sm" style={{ color: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={() => {
              if (window.confirm('Are you sure you want to delete this blog?')) {
                deleteBlog(blog.id)
              }
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '4px' }}>delete</span> Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  
  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(setOrders).catch(console.error)
  }, [])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        const updated = await res.json()
        setOrders(orders.map(o => o._id === id ? updated : o))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order? An email will be sent to the customer.")) return
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: 'PUT' })
      if (res.ok) {
        const updated = await res.json()
        setOrders(orders.map(o => o._id === id ? updated : o))
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to cancel order')
      }
    } catch (err) {
      console.error(err)
      alert('Error cancelling order')
    }
  }

  return (
    <section className="admin-section fluid-card">
      <h2>Live Orders</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        {orders.map(order => (
          <div key={order._id} className="admin-item-card glass-panel" style={{ padding: '16px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  Customer: {order.customerName} | Phone: {order.customerPhone}
                </p>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  Address: {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '18px' }}>₹{order.total}</strong>
                <div style={{ marginTop: '8px' }}>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    style={{ background: 'var(--surface-container)', color: 'var(--on-surface)', border: '1px solid var(--glass-border)', padding: '4px 8px', borderRadius: '4px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                {(order.status === 'Pending' || order.status === 'Preparing') && (
                  <button 
                    onClick={() => cancelOrder(order._id)}
                    className="btn-ghost-sm" 
                    style={{ marginTop: '8px', color: 'var(--error)', borderColor: 'var(--error)', padding: '4px 8px' }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontSize: '14px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
              {order.items.map((item, idx) => (
                <div key={idx}>{item.quantity}x {item.name} (₹{item.price})</div>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p>No orders yet.</p>}
      </div>
    </section>
  )
}

function AdminActivity() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetch('/api/activity').then(r => r.json()).then(setLogs).catch(console.error)
  }, [])

  return (
    <section className="admin-section fluid-card">
      <h2>Activity Logs</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
        {logs.map(log => (
          <div key={log._id} className="admin-item-card glass-panel" style={{ padding: '12px', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>{log.action}</strong>
              {log.user && <span style={{ marginLeft: '8px', fontSize: '12px', background: 'var(--primary)', color: 'black', padding: '2px 6px', borderRadius: '12px' }}>{log.user.name}</span>}
              <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>
                {JSON.stringify(log.details)}
              </div>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.6 }}>
              {new Date(log.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
        {logs.length === 0 && <p>No activity yet.</p>}
      </div>
    </section>
  )
}
