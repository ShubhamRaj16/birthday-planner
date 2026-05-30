const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const photoService = require('../services/photoService');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const safeId = parseInt(req.params.eventId, 10);
    if (!Number.isInteger(safeId) || safeId <= 0) return cb(new Error('invalid eventId'));
    const dir = path.join(__dirname, '../../../uploads/photos', String(safeId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `photo-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

// GET /api/v1/events/:eventId/photos
router.get('/', async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const photos = await photoService.listPhotos(eventId);
    res.json({ data: photos, error: null, meta: { count: photos.length } });
  } catch (err) { next(err); }
});

// POST /api/v1/events/:eventId/photos  (multipart, field: photo)
router.post('/', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ data: null, error: 'photo file is required', meta: {} });
    const eventId = parseInt(req.params.eventId, 10);
    const storagePath = `/uploads/photos/${eventId}/${req.file.filename}`;
    const photo = await photoService.addPhoto(eventId, storagePath, req.body.caption);
    res.status(201).json({ data: photo, error: null, meta: {} });
  } catch (err) { next(err); }
});

// PUT /api/v1/events/:eventId/photos/:id  — update caption or set cover
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const eventId = parseInt(req.params.eventId, 10);

    if (req.body.isCover === true) {
      const photo = await photoService.setCover(eventId, id);
      return res.json({ data: photo, error: null, meta: {} });
    }

    const photo = await photoService.updatePhoto(id, req.body);
    res.json({ data: photo, error: null, meta: {} });
  } catch (err) { next(err); }
});

// DELETE /api/v1/events/:eventId/photos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await photoService.deletePhoto(id);
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (err) { next(err); }
});

module.exports = router;
