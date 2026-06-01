import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as photoService from '../services/photoService';
import type { MulterRequest } from '../types';

const router = Router({ mergeParams: true });

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
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const photos = await photoService.listPhotos(eventId);
    res.json({ data: photos, error: null, meta: { count: photos.length } });
  } catch (e) { next(e); }
});

// POST upload a photo
router.post('/', upload.single('photo'), async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    if (!req.file) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'photo file required' }, meta: {} });
      return;
    }
    const storagePath = `/uploads/photos/${eventId}/${req.file.filename}`;
    const photo = await photoService.addPhoto(eventId, storagePath, req.body.caption);
    res.status(201).json({ data: photo, error: null, meta: {} });
  } catch (e) { next(e); }
});

// PUT update caption / cover
router.put('/:photoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const photoId = parseInt(req.params.photoId, 10);
    const photo = await photoService.updatePhoto(photoId, req.body);
    res.json({ data: photo, error: null, meta: {} });
  } catch (e) { next(e); }
});

// POST set as cover
router.post('/:photoId/cover', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const photoId = parseInt(req.params.photoId, 10);
    const photo = await photoService.setCover(eventId, photoId);
    res.json({ data: photo, error: null, meta: {} });
  } catch (e) { next(e); }
});

// DELETE a photo
router.delete('/:photoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const photoId = parseInt(req.params.photoId, 10);
    await photoService.deletePhoto(photoId);
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

export default router;
