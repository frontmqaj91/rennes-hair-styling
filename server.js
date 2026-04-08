const express    = require('express');
const session    = require('express-session');
const bodyParser = require('body-parser');
const cors       = require('cors');

const app  = express();
const PORT = 5000;

app.use(session({ secret: 'secret_key', resave: false, saveUninitialized: true, cookie: { secure: false } }));
app.use(cors({ origin: 'http://localhost:5000', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

function isAuth(req, res, next) {
  if (req.session.user) next();
  else res.redirect('/login.html');
}

// LOGIN
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') {
    req.session.user = { username };
    res.json({ ok: true });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ADMIN PAGE
app.get('/admin.html', isAuth, (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
});

// ===================== BOOKINGS =====================
let bookings = [];

// GET all bookings
app.get('/bookings', isAuth, (req, res) => {
  res.json(bookings);
});

// POST new booking
app.post('/submit-booking', (req, res) => {
  const { name, phone, service, date, time } = req.body;
  if (!name || !phone || !service || !date || !time)
    return res.status(400).json({ message: 'All fields are required.' });

  const newBooking = { id: Date.now(), name, phone, service, date, time, status: 'active' };
  bookings.push(newBooking);
  console.log('New booking:', newBooking);
  res.status(200).json({ message: 'Booking confirmed!', booking: newBooking });
});

// PUT edit booking
app.put('/bookings/:id', isAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { service, date, time } = req.body;
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Booking not found' });
  if (service) bookings[idx].service = service;
  if (date)    bookings[idx].date    = date;
  if (time)    bookings[idx].time    = time;
  res.json({ message: 'Updated', booking: bookings[idx] });
});

// PATCH mark as completed
app.patch('/bookings/:id/complete', isAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Booking not found' });
  bookings[idx].status = 'completed';
  res.json({ message: 'Completed', booking: bookings[idx] });
});

// DELETE booking
app.delete('/bookings/:id', isAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const before = bookings.length;
  bookings = bookings.filter(b => b.id !== id);
  if (bookings.length === before) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));