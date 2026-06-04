import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as svc from '../services/expenseService';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk, sendErr } from '../http/respond';
import type { MulterRequest } from '../types';

const router = Router({ mergeParams: true });

// NOTE: multer config stays inline for Phase 1; moves to uploads/ in Phase 3.
const receiptStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads/receipts'),
  filename: (req, file, cb) => {
    cb(null, `receipt-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage: receiptStorage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', asyncHandler(async (req, res) => {
  const data = await svc.listExpenses(Number(req.params.eventId));
  sendOk(res, data, { count: data.length });
}));

router.get('/summary', asyncHandler(async (req, res) => {
  const data = await svc.getSummary(Number(req.params.eventId));
  sendOk(res, data);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { label, amount, category } = req.body;
  if (!label || amount === undefined || !category) {
    return sendErr(res, 400, 'VALIDATION', 'label, amount, and category are required');
  }
  const data = await svc.createExpense(Number(req.params.eventId), req.body);
  sendOk(res, data, {}, 201);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const data = await svc.updateExpense(Number(req.params.id), req.body);
  sendOk(res, data);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await svc.deleteExpense(Number(req.params.id));
  sendOk(res, { deleted: true });
}));

router.post('/:id/receipt', upload.single('receipt'), asyncHandler<MulterRequest>(async (req, res) => {
  if (!req.file) return sendErr(res, 400, 'VALIDATION', 'receipt file required');
  const receiptPath = `/uploads/receipts/${req.file.filename}`;
  const data = await svc.updateReceipt(Number(req.params.id), receiptPath);
  sendOk(res, data);
}));

export default router;
