import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import analysisRoutes from './routes/analysis.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Password Strength Analyzer API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);

app.use(errorHandler);

if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

export default app;
