const fs   = require('fs');
const path = require('path');
const { randomUUID: uuidv4 } = require('crypto');

const DIR = path.join(__dirname, '../../database/json');
const file = (name) => path.join(DIR, `${name}.json`);

const read = (name) => {
  try { return JSON.parse(fs.readFileSync(file(name), 'utf8')); }
  catch { return []; }
};

const write = (name, data) =>
  fs.writeFileSync(file(name), JSON.stringify(data, null, 2));

// Serializa qualquer valor removendo métodos de instância
const serialize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const copy = { ...obj };
  ['update','destroy','toJSON','get','verificarSenha'].forEach(k => delete copy[k]);
  Object.keys(copy).forEach(k => {
    if (copy[k] && typeof copy[k] === 'object' && !Array.isArray(copy[k]))
      copy[k] = serialize(copy[k]);
  });
  return copy;
};

const makeInstance = (name, data) => {
  const inst = { ...data };

  inst.update = function(changes) {
    const rows = read(name);
    const idx  = rows.findIndex(r => r.id === inst.id);
    if (idx === -1) throw new Error('Registro não encontrado');
    Object.assign(rows[idx], changes, { atualizado_em: new Date().toISOString() });
    Object.assign(inst, rows[idx]);
    write(name, rows);
    return inst;
  };

  inst.destroy = function() {
    const rows = read(name);
    write(name, rows.filter(r => r.id !== inst.id));
  };

  inst.toJSON = function() { return serialize(inst); };
  inst.get    = function() { return serialize(inst); };

  return inst;
};

const Op = {
  between: Symbol('between'),
  like:    Symbol('like'),
  or:      Symbol('or'),
  gt:      Symbol('gt'),
  lt:      Symbol('lt'),
};

const matchesWhere = (row, where) => {
  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;
    if (val && typeof val === 'object') {
      if (Op.between in val) {
        const [lo, hi] = val[Op.between];
        if (parseFloat(row[key]) < lo || parseFloat(row[key]) > hi) return false;
        continue;
      }
      if (Op.like in val) {
        const pattern = val[Op.like].replace(/%/g, '');
        if (!String(row[key]||'').toLowerCase().includes(pattern.toLowerCase())) return false;
        continue;
      }
    }
    if (row[key] !== val) return false;
  }
  return true;
};

const applyWhere = (rows, where) => rows.filter(r => matchesWhere(r, where));
const applyOrder = (rows, order) =>
  [...rows].sort((a, b) => {
    for (const [field, dir] of order) {
      if (a[field] < b[field]) return dir === 'DESC' ? 1 : -1;
      if (a[field] > b[field]) return dir === 'DESC' ? -1 : 1;
    }
    return 0;
  });

const makeRepo = (name) => ({
  findAll({ where = {}, order, limit, offset } = {}) {
    let rows = applyWhere(read(name), where);
    const count = rows.length;
    if (order)  rows = applyOrder(rows, order);
    if (offset) rows = rows.slice(offset);
    if (limit)  rows = rows.slice(0, limit);
    return { count, rows };
  },

  findAndCountAll(opts = {}) { return this.findAll(opts); },

  findOne({ where = {} } = {}) {
    return read(name).find(r => matchesWhere(r, where)) || null;
  },

  findByPk(id, { attributes } = {}) {
    let row = read(name).find(r => r.id === id) || null;
    if (row && attributes?.exclude) {
      row = { ...row };
      attributes.exclude.forEach(k => delete row[k]);
    }
    return row;
  },

  create(data) {
    const rows = read(name);
    const now  = new Date().toISOString();
    const row  = { id: uuidv4(), ...data, criado_em: now, atualizado_em: now };
    rows.push(row);
    write(name, rows);
    return makeInstance(name, row);
  },

  update(data, { where = {} } = {}) {
    const rows = read(name);
    let changed = 0;
    const updated = rows.map(r => {
      if (matchesWhere(r, where)) {
        changed++;
        return { ...r, ...data, atualizado_em: new Date().toISOString() };
      }
      return r;
    });
    write(name, updated);
    return [changed];
  },

  destroy({ where = {} } = {}) {
    const rows    = read(name);
    const updated = rows.filter(r => !matchesWhere(r, where));
    write(name, updated);
    return rows.length - updated.length;
  },
});

const db = {
  Op,
  serialize,
  makeInstance,
  makeRepo,
  users:   makeRepo('users'),
  reports: makeRepo('reports'),
  connectDatabase: async () => {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
    ['users', 'reports'].forEach(n => {
      if (!fs.existsSync(file(n))) write(n, []);
    });
    console.log('✅ Banco JSON inicializado em', DIR);
  },
};

module.exports = db;
