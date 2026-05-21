const Report = require('../models/Report');
const { uploadParaCloudinary, removerDoCloudinary } = require('../services/uploadService');
const { filtrarPorProximidade } = require('../services/mapService');
const { createError } = require('../middlewares/errorMiddleware');
const db = require('../config/db');

const toPlain = (r) => r && r.toJSON ? r.toJSON() : r;

// POST /reports
const createReport = async (req, res, next) => {
  try {
    const { titulo, descricao, categoria, latitude, longitude, anonimo } = req.body;
    if (!titulo || !categoria || latitude === undefined || longitude === undefined)
      throw createError('Título, categoria, latitude e longitude são obrigatórios', 400);

    let imagem_url = null, imagem_public_id = null;
    if (req.file) {
      const r = await uploadParaCloudinary(req.file.path);
      imagem_url = r.url; imagem_public_id = r.public_id;
    }

    const report = Report.create({
      titulo, descricao, categoria,
      latitude: parseFloat(latitude), longitude: parseFloat(longitude),
      imagem_url, imagem_public_id, status: 'pendente', user_id: req.user.id,
      anonimo: anonimo === 'true' || anonimo === true,
    });

    // Rebusca com autor para retornar completo
    const full = Report.findByPk(report.id, { include: true });
    return res.status(201).json({
      status: 'sucesso', mensagem: 'Denúncia criada',
      data: { report: toPlain(full) },
    });
  } catch (err) { next(err); }
};

// GET /reports
const getAllReports = async (req, res, next) => {
  try {
    const { status, categoria, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status)    where.status    = status;
    if (categoria) where.categoria = categoria;

    // Usuário comum só vê o que criou; admin vê tudo
    if (req.user.role !== 'admin') {
      where.user_id = req.user.id;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = Report.findAndCountAll({
      where, include: true,
      order: [['criado_em', 'DESC']],
      limit: parseInt(limit), offset,
    });

    return res.status(200).json({
      status: 'sucesso',
      data: {
        reports: rows.map(toPlain),
        paginacao: {
          total: count, pagina: parseInt(page),
          limite: parseInt(limit), paginas: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (err) { next(err); }
};

// GET /reports/nearby
const getReportsByLocation = async (req, res, next) => {
  try {
    const { lat, lng, raio = 5 } = req.query;
    if (!lat || !lng) throw createError('Parâmetros lat e lng são obrigatórios', 400);

    const latitude = parseFloat(lat), longitude = parseFloat(lng), raioKm = parseFloat(raio);

    // Usuário comum só vê o que criou; admin vê tudo
    const where = req.user.role === 'admin' ? {} : { user_id: req.user.id };
    const reports  = Report.findAll({ where, include: true });
    const filtrados = filtrarPorProximidade(reports.map(toPlain), latitude, longitude, raioKm);

    return res.status(200).json({
      status: 'sucesso',
      data: { reports: filtrados, total: filtrados.length, raio_km: raioKm, centro: { latitude, longitude } },
    });
  } catch (err) { next(err); }
};

// PATCH /reports/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validos = ['pendente','em_analise','em_andamento','resolvido','rejeitado'];
    if (!status || !validos.includes(status))
      throw createError(`Status inválido. Aceitos: ${validos.join(', ')}`, 400);

    const report = Report.findByPk(id);
    if (!report) throw createError('Denúncia não encontrada', 404);
    report.update({ status });

    return res.status(200).json({
      status: 'sucesso', mensagem: 'Status atualizado',
      data: { report: toPlain(report) },
    });
  } catch (err) { next(err); }
};

// DELETE /reports/:id
const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = Report.findByPk(id);
    if (!report) throw createError('Denúncia não encontrada', 404);
    if (report.user_id !== req.user.id && req.user.role !== 'admin')
      throw createError('Sem permissão para deletar esta denúncia', 403);

    if (report.imagem_public_id) await removerDoCloudinary(report.imagem_public_id);
    report.destroy();

    return res.status(200).json({ status: 'sucesso', mensagem: 'Denúncia removida' });
  } catch (err) { next(err); }
};

module.exports = { createReport, getAllReports, getReportsByLocation, updateStatus, deleteReport };