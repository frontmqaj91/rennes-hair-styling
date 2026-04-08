const { setCors, signToken, ADMIN_USER, ADMIN_PASS } = require('./_helpers');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).end();

  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = signToken({ username });
    return res.status(200).json({ ok: true, token });
  }

  return res.status(401).json({ ok: false, message: 'Invalid credentials' });
};