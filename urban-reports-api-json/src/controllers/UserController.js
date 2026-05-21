const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('../middlewares/errorMiddleware');

const gerarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) throw createError('Nome, e-mail e senha são obrigatórios', 400);
    if (User.findOne({ where: { email } })) throw createError('Este e-mail já está cadastrado', 409);

    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
    const user = await User.create({ nome, email, senha, role });
    const token = gerarToken(user.id);

    return res.status(201).json({ status: 'sucesso', mensagem: 'Usuário cadastrado', data: { user: user.toJSON(), token } });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) throw createError('E-mail e senha são obrigatórios', 400);

    const user = User.findOne({ where: { email } });
    if (!user) throw createError('E-mail ou senha incorretos', 401);

    const ok = await user.verificarSenha(senha);
    if (!ok)  throw createError('E-mail ou senha incorretos', 401);

    const token = gerarToken(user.id);
    return res.status(200).json({ status: 'sucesso', mensagem: 'Login realizado', data: { user: user.toJSON(), token } });
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const user = User.findByPk(req.user.id, { attributes: { exclude: ['senha'] } });
    return res.status(200).json({ status: 'sucesso', data: { user: user.toJSON ? user.toJSON() : user } });
  } catch (err) { next(err); }
};

module.exports = { register, login, getProfile };
