import express from 'express';
import { quoteController } from '../controllers/quoteController';

const router = express.Router();

// Get random quote
router.get('/random', quoteController.getRandomQuote.bind(quoteController));

export default router; 