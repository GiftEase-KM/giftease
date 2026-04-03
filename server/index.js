import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/auth.js';
import profileRoutes from './routes/profile.js';
import personsRoutes from './routes/persons.js';
import addressesRoutes from './routes/addresses.js';
import eventsRoutes from './routes/events.js';
import paymentMethodsRoutes from './routes/paymentMethods.js';
import handwryttenRoutes from './routes/handwrytten.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected API routes
app.use('/api/profile', requireAuth, profileRoutes);
app.use('/api/persons', requireAuth, personsRoutes);
app.use('/api/persons', requireAuth, addressesRoutes);
app.use('/api/events', requireAuth, eventsRoutes);
app.use('/api/payment-methods', requireAuth, paymentMethodsRoutes);
app.use('/api/handwrytten', requireAuth, handwryttenRoutes);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => { res.sendFile(path.join(distPath, 'index.html')); });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GiftEase server running on port ${PORT}`);
});

export default app;