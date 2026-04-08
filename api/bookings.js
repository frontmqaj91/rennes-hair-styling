const { setCors, requireAuth, getBookings, saveBookings } = require('./_helpers');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const url        = req.url || '';
  const parts      = url.split('/').filter(Boolean);
  const id         = parts[1] ? parseInt(parts[1]) : null;
  const isComplete = url.includes('/complete');

  // GET — كل الحجوزات
  if (req.method === 'GET' && !id) {
    const bookings = await getBookings();
    return res.status(200).json(bookings);
  }

  // PUT — تعديل
  if (req.method === 'PUT' && id) {
    const bookings = await getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ ok: false, message: 'Not found' });
    const { service, date, time } = req.body;
    if (service) bookings[idx].service = service;
    if (date)    bookings[idx].date    = date;
    if (time)    bookings[idx].time    = time;
    await saveBookings(bookings);
    return res.status(200).json({ ok: true, booking: bookings[idx] });
  }

  // PATCH — إنهاء
  if (req.method === 'PATCH' && id && isComplete) {
    const bookings = await getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ ok: false, message: 'Not found' });
    bookings[idx].status = 'completed';
    await saveBookings(bookings);
    return res.status(200).json({ ok: true, booking: bookings[idx] });
  }

  // DELETE — حذف
  if (req.method === 'DELETE' && id) {
    let bookings = await getBookings();
    bookings = bookings.filter(b => b.id !== id);
    await saveBookings(bookings);
    return res.status(200).json({ ok: true, message: 'Deleted' });
  }

  return res.status(405).json({ ok: false, message: 'Method not allowed' });
};