/**
 * uploadService.js — versão JSON/local
 * Salva imagens em /uploads e retorna URL local.
 * Sem Cloudinary — ideal para testes rápidos.
 */
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `report-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = ['image/jpeg','image/png','image/webp','image/gif'].includes(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Apenas imagens são permitidas'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Retorna URL local acessível via /uploads/<filename>
const uploadParaCloudinary = async (filePath) => {
  const filename = path.basename(filePath);
  return {
    url: `http://localhost:${process.env.PORT || 3000}/uploads/${filename}`,
    public_id: filename,
  };
};

const removerDoCloudinary = async (publicId) => {
  const fp = path.join('./uploads', publicId);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
};

module.exports = { upload, uploadParaCloudinary, removerDoCloudinary };
