const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const svc = require('../services/childService');

const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads/avatars'),
  filename: (req, file, cb) => {
    cb(null, `child-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage: avatarStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', async (req, res, next) => {
  try {
    const data = await svc.listChildren();
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await svc.getChild(Number(req.params.id));
    if (!data) return res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Child not found' }, meta: {} });
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, dob } = req.body;
    if (!name || !dob) {
      return res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'name and dob are required' }, meta: {} });
    }
    const data = await svc.createChild(req.body);
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = await svc.updateChild(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteChild(Number(req.params.id));
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/:id/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'avatar file required' }, meta: {} });
    }
    const photoPath = `/uploads/avatars/${req.file.filename}`;
    const data = await svc.updateAvatar(Number(req.params.id), photoPath);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

module.exports = router;
