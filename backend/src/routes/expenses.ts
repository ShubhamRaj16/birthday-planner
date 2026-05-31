import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import * as svc from '../services/expenseService';
import type { MulterRequest } from '../types';

const router = Router({ mergeParams: true });

const receiptStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads/receipts'),
  filename: (req, file, cb) => {
    cb(null, `receipt-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage: receiptStorage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.listExpenses(Number(req.params.eventId));
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getSummary(Number(req.params.eventId));
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { label, amount, category } = req.body;
    if (!label || amount === undefined || !category) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'label, amount, and category are required' }, meta: {} });
      return;
    }
    const data = await svc.createExpense(Number(req.params.eventId), req.body);
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.updateExpense(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.deleteExpense(Number(req.params.id));
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/:id/receipt', upload.single('receipt'), async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'receipt file required' }, meta: {} });
      return;
    }
    const receiptPath = `/uploads/receipts/${req.file.filename}`;
    const data = await svc.updateReceipt(Number(req.params.id), receiptPath);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

export default router;
