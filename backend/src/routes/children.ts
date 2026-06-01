import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import * as svc from '../services/childService';
import type { MulterRequest } from '../types';

const router = Router();

const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads/avatars'),
  filename: (req, file, cb) => {
    const prefix = req.params.id || 'new';
    cb(null, `child-${prefix}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage: avatarStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.listChildren();
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getChild(Number(req.params.id));
    if (!data) {
      res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Child not found' }, meta: {} });
      return;
    }
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/', upload.single('avatar'), async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    const { name, dob } = req.body;
    if (!name || !dob) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'name and dob are required' }, meta: {} });
      return;
    }
    const photoPath = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
    const data = await svc.createChild({ ...req.body, photo: photoPath });
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.put('/:id', upload.single('avatar'), async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.photo = `/uploads/avatars/${req.file.filename}`;
    const data = await svc.updateChild(Number(req.params.id), updateData);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.deleteChild(Number(req.params.id));
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/:id/avatar', upload.single('avatar'), async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'avatar file required' }, meta: {} });
      return;
    }
    const photoPath = `/uploads/avatars/${req.file.filename}`;
    const data = await svc.updateAvatar(Number(req.params.id), photoPath);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

export default router;
