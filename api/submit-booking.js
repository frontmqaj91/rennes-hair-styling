const { setCors, getBookings, saveBookings } = require('./_helpers');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).end();

  const { name, phone, service, date, time } = req.body;

  if (!name || !phone || !service || !date || !time)
    return res.status(400).json({ ok: false, message: 'All fields are required.' });

  const bookings = await getBookings();

  const newBooking = {
    id:        Date.now(),
    name:      name.trim(),
    phone:     phone.trim(),
    service:   service.trim(),
    date,
    time,
    status:    'active',
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);
  await saveBookings(bookings);

  return res.status(200).json({ ok: true, message: 'Booking confirmed!', booking: newBooking });
};