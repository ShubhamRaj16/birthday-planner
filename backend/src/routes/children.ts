import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as svc from '../services/childService';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk, sendErr } from '../http/respond';
import type { MulterRequest } from '../types';

const router = Router();

// NOTE: multer config stays inline for Phase 1; moves to uploads/ in Phase 3.
const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads/avatars'),
  filename: (req, file, cb) => {
    const prefix = req.params.id || 'new';
    cb(null, `child-${prefix}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage: avatarStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', asyncHandler(async (_req, res) => {
  const data = await svc.listChildren();
  sendOk(res, data, { count: data.length });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await svc.getChild(Number(req.params.id));
  if (!data) return sendErr(res, 404, 'NOT_FOUND', 'Child not found');
  sendOk(res, data);
}));

router.post('/', upload.single('avatar'), asyncHandler<MulterRequest>(async (req, res) => {
  const { name, dob } = req.body;
  if (!name || !dob) return sendErr(res, 400, 'VALIDATION', 'name and dob are required');
  const photoPath = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
  const data = await svc.createChild({ ...req.body, photo: photoPath });
  sendOk(res, data, {}, 201);
}));

router.put('/:id', upload.single('avatar'), asyncHandler<MulterRequest>(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) updateData.photo = `/uploads/avatars/${req.file.filename}`;
  const data = await svc.updateChild(Number(req.params.id), updateData);
  sendOk(res, data);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await svc.deleteChild(Number(req.params.id));
  sendOk(res, { deleted: true });
}));

router.post('/:id/avatar', upload.single('avatar'), asyncHandler<MulterRequest>(async (req, res) => {
  if (!req.file) return sendErr(res, 400, 'VALIDATION', 'avatar file required');
  const photoPath = `/uploads/avatars/${req.file.filename}`;
  const data = await svc.updateAvatar(Number(req.params.id), photoPath);
  sendOk(res, data);
}));

export default router;
