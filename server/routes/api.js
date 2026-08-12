const express = require('express');
const router = express.Router();
const MenuCategory = require('../models/Menu');
const Blog = require('../models/Blog');
const SiteSettings = require('../models/SiteSettings');
const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const sendOrderEmail = async (toEmail, toName, subject, htmlPart) => {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: `Veggies Kitchen <${process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev'}>`,
      to: [toEmail],
      subject: subject,
      html: htmlPart,
    });
  } catch (err) {
    console.error('Resend error:', err);
  }
};

// --- Middleware ---
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
};

// --- Auth ---
router.get('/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

router.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- Activity Logs ---
router.get('/activity', async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).populate('user', 'name email').limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Orders ---
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/me', async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const orderData = { ...req.body };
    if (req.isAuthenticated()) {
      orderData.user = req.user._id;
      orderData.isGuest = false;
      
      if (orderData.deliveryAddress) {
        const User = require('../models/User');
        const user = await User.findById(req.user._id);
        if (user) {
          const isUnique = !user.addresses.some(a => 
            a.street === orderData.deliveryAddress.street && 
            a.city === orderData.deliveryAddress.city && 
            a.pincode === orderData.deliveryAddress.pincode
          );
          if (isUnique) {
            user.addresses.push({
              street: orderData.deliveryAddress.street,
              city: orderData.deliveryAddress.city,
              state: orderData.deliveryAddress.state,
              pincode: orderData.deliveryAddress.pincode
            });
            await user.save();
          }
        }
      }
    }
    const order = new Order(orderData);
    await order.save();
    
    // Log Activity
    await ActivityLog.create({ 
      action: 'Order Placed', 
      user: req.user ? req.user._id : null,
      details: { orderId: order._id, total: order.total, customer: order.customerName } 
    });

    if (order.customerEmail) {
      const emailHtml = `
        <h2>Order Confirmation</h2>
        <p>Hi ${order.customerName},</p>
        <p>Thank you for your order! Your order #${order._id.toString().slice(-6).toUpperCase()} is now <strong>Pending</strong>.</p>
        <h3>Order Summary</h3>
        <ul>
          ${order.items.map(item => `<li>${item.quantity}x ${item.name} - ₹${item.price}</li>`).join('')}
        </ul>
        <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
        <p><strong>Delivery Fee:</strong> ₹${order.deliveryFee}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
      `;
      await sendOrderEmail(order.customerEmail, order.customerName, `Order Confirmation - #${order._id.toString().slice(-6).toUpperCase()}`, emailHtml);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    // Log Activity
    await ActivityLog.create({ 
      action: `Order Status Updated to ${status}`, 
      user: req.user ? req.user._id : null,
      details: { orderId: order._id } 
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Only allow cancelling if pending or preparing
    if (order.status !== 'Pending' && order.status !== 'Preparing') {
      return res.status(400).json({ error: 'Cannot cancel order at this stage' });
    }
    
    // Check if order is older than 10 minutes (600000 ms)
    if (Date.now() - new Date(order.createdAt).getTime() > 10 * 60 * 1000) {
      return res.status(400).json({ error: 'Orders older than 10 minutes can only be cancelled by contacting support.' });
    }

    order.status = 'Cancelled';
    await order.save();
    
    await ActivityLog.create({ 
      action: 'Order Cancelled', 
      user: req.user ? req.user._id : null,
      details: { orderId: order._id } 
    });

    if (order.customerEmail) {
      const emailHtml = `
        <h2>Order Cancelled</h2>
        <p>Hi ${order.customerName},</p>
        <p>Your order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled successfully.</p>
        <p>If you have any questions, please contact our support.</p>
      `;
      await sendOrderEmail(order.customerEmail, order.customerName, `Order Cancelled - #${order._id.toString().slice(-6).toUpperCase()}`, emailHtml);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Site Settings ---
router.get('/settings', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const settings = await SiteSettings.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings/:key', isAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await SiteSettings.findOneAndUpdate(
      { key: req.params.key },
      { value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Menu ---
router.get('/menu', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const menu = await MenuCategory.find();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/menu', isAdmin, async (req, res) => {
  try {
    const category = new MenuCategory(req.body);
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/menu/:id', isAdmin, async (req, res) => {
  try {
    const category = await MenuCategory.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/menu/:id', isAdmin, async (req, res) => {
  try {
    await MenuCategory.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Blogs ---
router.get('/blogs', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/blogs', isAdmin, async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/blogs/:id', isAdmin, async (req, res) => {
  try {
    await Blog.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Initial Seed Route (for convenience) ---
router.post('/seed', isAdmin, async (req, res) => {
  try {
    const { menuData, blogsData, heroBackdrop, menuBackdrop } = req.body;
    
    if (menuData) {
      await MenuCategory.deleteMany({});
      await MenuCategory.insertMany(menuData);
    }
    
    if (blogsData) {
      await Blog.deleteMany({});
      await Blog.insertMany(blogsData);
    }
    
    if (heroBackdrop) {
      await SiteSettings.findOneAndUpdate({ key: 'heroBackdrop' }, { value: heroBackdrop }, { upsert: true });
    }
    
    if (menuBackdrop) {
      await SiteSettings.findOneAndUpdate({ key: 'menuBackdrop' }, { value: menuBackdrop }, { upsert: true });
    }
    
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (err) {
    console.error('SEED ERROR:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
