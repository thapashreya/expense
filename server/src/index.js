import 'dotenv/config';
import app from './app.js';
import { connectToDatabase } from './config/database.js';

const port = Number(process.env.PORT) || 5000;

try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters. Add a long, random secret to server/.env.');
  }
  await connectToDatabase();
  app.listen(port, () => {
    console.info(`Expense Tracker API listening on port ${port}.`);
  });
} catch (error) {
  console.error(`Server startup failed: ${error.message}`);
  process.exitCode = 1;
}
