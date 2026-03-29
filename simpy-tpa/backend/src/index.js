require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
// app.use(helmet());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/simpy-tpa';
mongoose.connect(mongoURI)
  .then(() => console.log(`Connected to MongoDB: ${mongoURI}`))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing with local mock behavior if possible...');
  });

// Routes placeholder
app.get('/', (req, res) => {
  res.json({ message: 'Simpy TPA Administrator API is live.' });
});

// Import Routes
const claimRoutes = require('./routes/claims');
const preauthRoutes = require('./routes/preauth');
const enhancementRoutes = require('./routes/enhancement');
const dischargeRoutes = require('./routes/discharge');
const settlementRoutes = require('./routes/settlement');

app.use('/api/tpa/claims', claimRoutes);
app.use('/api/tpa/preauth', preauthRoutes);
app.use('/api/tpa/enhancement', enhancementRoutes);
app.use('/api/tpa/discharge', dischargeRoutes);
app.use('/api/tpa/settlement', settlementRoutes);

// Initialize Background Services
const initTATMonitor = require('./services/tatMonitor');
initTATMonitor();

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
