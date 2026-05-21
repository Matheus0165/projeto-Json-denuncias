const db   = require('../config/db');
const User = require('./User');

// Injeta o autor em um report já salvo
// Quando o report é anônimo, oculta o autor e remove user_id da resposta
// (o user_id continua salvo no disco para checagens internas como DELETE).
const withAutor = (row) => {
  if (!row) return null;
  const inst = db.makeInstance('reports', row);
  if (row.anonimo) {
    inst.autor = { nome: 'Anônimo', anonimo: true };
    delete inst.user_id;
    return inst;
  }
  const autorRaw = db.users.findByPk(row.user_id, { attributes: { exclude: ['senha'] } });
  inst.autor = autorRaw ? db.serialize(autorRaw) : null;
  return inst;
};

const Report = {
  create(data) {
    return db.reports.create({ ...data, status: data.status || 'pendente' });
  },

  findByPk(id, opts = {}) {
    const row = db.reports.findByPk(id);
    if (!row) return null;
    return opts.include ? withAutor(row) : db.makeInstance('reports', row);
  },

  findOne(opts) {
    return db.reports.findOne(opts);
  },

  // Sempre retorna array (nunca { count, rows })
  findAll({ where = {}, include, order, limit, offset } = {}) {
    const { rows } = db.reports.findAll({ where, order, limit, offset });
    return include ? rows.map(withAutor) : rows.map(r => db.makeInstance('reports', r));
  },

  // Retorna { count, rows } — para paginação
  findAndCountAll({ where = {}, include, order, limit, offset } = {}) {
    const { count } = db.reports.findAll({ where });
    const rows = Report.findAll({ where, include, order, limit, offset });
    return { count, rows };
  },

  update(data, opts) { return db.reports.update(data, opts); },
  destroy(opts)      { return db.reports.destroy(opts); },
};

module.exports = Report;