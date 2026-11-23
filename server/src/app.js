import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

const app = express();

app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.use((request, response) => {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.path}` });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(' ') });
  }
  if (error.name === 'CastError') {
    return response.status(400).json({ message: 'Invalid ID format.' });
  }
  return response.status(500).json({ message: 'An unexpected server error occurred.' });
});

export default app;
