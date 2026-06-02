import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as photoService from '../services/photoService';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk, sendErr } from '../http/respond';
import type { MulterRequest } from '../types';

const router = Router({ mergeParams: true });

// NOTE: multer config stays inline for Phase 1; moves to uploads/ in Phase 3.
const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const safeId = parseInt(req.params.eventId, 10);
    if (!Number.isInteger(safeId) || safeId <= 0) return cb(new Error('invalid eventId'), '');
    const dir = path.join(__dirname, '../../../uploads/photos', String(safeId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `photo-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10) || 10) * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

// GET all photos for an event
router.get('/', asyncHandler(async (req, res) => {
  const eventId = parseInt(req.params.eventId, 10);
  const photos = await photoService.listPhotos(eventId);
  sendOk(res, photos, { count: photos.length });
}));

// POST upload a photo
router.post('/', upload.single('photo'), asyncHandler<MulterRequest>(async (req, res) => {
  const eventId = parseInt(req.params.eventId, 10);
  if (!req.file) return sendErr(res, 400, 'VALIDATION', 'photo file required');
  const storagePath = `/uploads/photos/${eventId}/${req.file.filename}`;
  const photo = await photoService.addPhoto(eventId, storagePath, req.body.caption);
  sendOk(res, photo, {}, 201);
}));

// PUT update caption / cover
router.put('/:photoId', asyncHandler(async (req, res) => {
  const photoId = parseInt(req.params.photoId, 10);
  const photo = await photoService.updatePhoto(photoId, req.body);
  sendOk(res, photo);
}));

// POST set as cover
router.post('/:photoId/cover', asyncHandler(async (req, res) => {
  const eventId = parseInt(req.params.eventId, 10);
  const photoId = parseInt(req.params.photoId, 10);
  const photo = await photoService.setCover(eventId, photoId);
  sendOk(res, photo);
}));

// DELETE a photo
router.delete('/:photoId', asyncHandler(async (req, res) => {
  const photoId = parseInt(req.params.photoId, 10);
  await photoService.deletePhoto(photoId);
  sendOk(res, { deleted: true });
}));

export default router;
