const bcrypt = require('bcryptjs');
const db     = require('../config/db');

const wrapUser = (raw) => {
  if (!raw) return null;
  const inst = db.makeInstance('users', raw);

  inst.verificarSenha = (plain) => bcrypt.compare(plain, inst.senha);

  const _toJSON = inst.toJSON.bind(inst);
  inst.toJSON = () => { const v = _toJSON(); delete v.senha; return v; };

  return inst;
};

const User = {
  async create(data) {
    const hash = await bcrypt.hash(data.senha, 12);
    const raw  = db.users.create({ ...data, senha: hash });
    return wrapUser(raw);
  },

  findByPk(id, { attributes } = {}) {
    const raw = db.users.findByPk(id, { attributes });
    return wrapUser(raw);
  },

  findOne({ where = {} } = {}) {
    const raw = db.users.findOne({ where });
    return wrapUser(raw);
  },

  findAll(opts) {
    const { rows } = db.users.findAll(opts);
    return rows.map(wrapUser);
  },
};

module.exports = User;
