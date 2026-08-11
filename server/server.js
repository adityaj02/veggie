require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const apiRoutes = require('./routes/api');
const ActivityLog = require('./models/ActivityLog');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Setup Sessions
app.use(session({
  secret: 'veggies_kitchen_super_secret_session_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Since we're on localhost HTTP
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/#/checkout' }),
  async (req, res) => {
    // Log Activity
    await ActivityLog.create({ action: 'User Logged In', user: req.user._id, details: { name: req.user.name } });
    res.redirect('http://localhost:5173/#/checkout');
  }
);

// Ignore Chrome DevTools requests
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(200).json({});
});

// Use API Routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
