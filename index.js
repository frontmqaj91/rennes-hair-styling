const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const file = path.join(process.cwd(), 'public', 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
};