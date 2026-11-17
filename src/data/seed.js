// Realistic demo data. Bookings, codes and prices are samples — replace with your own.
const hoursAgo = (h) => new Date(Date.now() - h * 36e5).toISOString()
const by = (createdBy, updatedBy = createdBy, h = 30) => ({ createdBy, updatedBy, updatedAt: hoursAgo(h) })

export const seed = () => ({
  trip: { name: 'Our big Europe adventure', start: '2026-12-09', end: '2026-12-29', budgetTWD: 260000 },

  crew: [
    { id: 'u1', name: 'Pei', emoji: '🌻', color: '#F6C177', role: 'Trip planner' },
    { id: 'u2', name: 'Sheyne', emoji: '🍋', color: '#BFE3B4', role: 'Snack scout' },
  ],
  invites: [],

  cities: [
    { id: 'par', name: 'Paris', country: 'France', flag: '🇫🇷', start: '2026-12-09', end: '2026-12-12', lat: 48.8566, lng: 2.3522, tone: 'peach' },
    { id: 'luc', name: 'Lucerne', country: 'Switzerland', flag: '🇨🇭', start: '2026-12-12', end: '2026-12-15', lat: 47.0502, lng: 8.3093, tone: 'blue' },
    { id: 'flo', name: 'Florence', country: 'Italy', flag: '🇮🇹', start: '2026-12-15', end: '2026-12-18', lat: 43.7696, lng: 11.2558, tone: 'pink' },
    { id: 'rom', name: 'Rome', country: 'Italy', flag: '🇮🇹', start: '2026-12-18', end: '2026-12-21', lat: 41.9028, lng: 12.4964, tone: 'yellow' },
    { id: 'bcn', name: 'Barcelona', country: 'Spain', flag: '🇪🇸', start: '2026-12-21', end: '2026-12-25', lat: 41.3874, lng: 2.1686, tone: 'green' },
    { id: 'lis', name: 'Lisbon', country: 'Portugal', flag: '🇵🇹', start: '2026-12-25', end: '2026-12-29', lat: 38.7223, lng: -9.1393, tone: 'peach' },
  ],

  items: [
    // Flights
    { id: 'i1', type: 'flight', title: 'Taipei → Paris', date: '2026-12-09', time: '07:20', cityId: 'par', from: 'TPE', to: 'CDG', number: 'BR87', ref: 'K7Q2LM', location: 'Paris CDG Terminal 1', notes: 'Departs TPE 23:40 on 8 Dec. Seats 42A + 42B.', cost: 0, currency: 'TWD', ...by('u1', 'u1', 200) },
    { id: 'i2', type: 'flight', title: 'Rome → Barcelona', date: '2026-12-21', time: '10:35', cityId: 'bcn', from: 'FCO', to: 'BCN', number: 'VY6107', ref: 'VXR8TD', location: 'Rome Fiumicino T1', notes: '1 cabin bag each + 1 checked.', cost: 0, currency: 'EUR', ...by('u2', 'u2', 90) },
    { id: 'i3', type: 'flight', title: 'Barcelona → Lisbon', date: '2026-12-25', time: '13:15', cityId: 'lis', from: 'BCN', to: 'LIS', number: 'TP1033', ref: 'TP4YZN', location: 'Barcelona El Prat T1', notes: '', cost: 0, currency: 'EUR', ...by('u2', 'u2', 88) },
    { id: 'i4', type: 'flight', title: 'Lisbon → Dubai', date: '2026-12-29', time: '14:30', cityId: 'lis', from: 'LIS', to: 'DXB', number: 'EK192', ref: 'EM2PQA', location: 'Lisbon Airport T1', notes: 'Connection in Dubai, 2h40m.', cost: 0, currency: 'TWD', ...by('u1', 'u1', 199) },
    { id: 'i5', type: 'flight', title: 'Dubai → Taipei', date: '2026-12-30', time: '03:05', cityId: 'lis', from: 'DXB', to: 'TPE', number: 'EK366', ref: 'EM2PQA', location: 'Dubai DXB T3', notes: 'Home sweet home 🏠', cost: 0, currency: 'TWD', ...by('u1', 'u1', 199) },
    // Trains
    { id: 'i6', type: 'train', title: 'TGV Lyria Paris → Basel → Lucerne', date: '2026-12-12', time: '10:22', cityId: 'luc', from: 'Paris Gare de Lyon', to: 'Luzern', number: 'TGV 9213', ref: 'SNCF-QH82KD', location: 'Gare de Lyon, Hall 1', notes: 'Change at Basel SBB. Swiss Pass covers the 2nd leg.', cost: 0, currency: 'EUR', ...by('u1', 'u2', 20) },
    { id: 'i7', type: 'train', title: 'Lucerne → Milan → Florence', date: '2026-12-15', time: '09:18', cityId: 'flo', from: 'Luzern', to: 'Firenze SMN', number: 'EC 15 + FR 9541', ref: 'TRN-77RPA', location: 'Luzern station', notes: 'Scenic Gotthard route — sit on the right side.', cost: 0, currency: 'CHF', ...by('u2', 'u2', 60) },
    { id: 'i8', type: 'train', title: 'Frecciarossa Florence → Rome', date: '2026-12-18', time: '11:10', cityId: 'rom', from: 'Firenze SMN', to: 'Roma Termini', number: 'FR 9527', ref: 'TI-PNR4X9', location: 'Firenze Santa Maria Novella', notes: '', cost: 0, currency: 'EUR', ...by('u2', 'u1', 12) },
    // Stays
    { id: 'i9', type: 'hotel', title: 'Hôtel des Grands Boulevards', date: '2026-12-09', time: '15:00', cityId: 'par', location: '17 Bd Poissonnière, Paris', ref: 'BKG-4410298', notes: '3 nights · Ask for early luggage drop.', cost: 0, currency: 'EUR', ...by('u1', 'u1', 300) },
    { id: 'i10', type: 'hotel', title: 'Hotel des Alpes', date: '2026-12-12', time: '15:00', cityId: 'luc', location: 'Furrengasse 3, Luzern', ref: 'BKG-5520113', notes: 'River-view room 🌊', cost: 0, currency: 'CHF', ...by('u1', 'u1', 290) },
    { id: 'i11', type: 'hotel', title: 'Hotel Davanzati', date: '2026-12-15', time: '14:00', cityId: 'flo', location: 'Via Porta Rossa 5, Firenze', ref: 'DAV-88231', notes: 'Free aperitivo 18:30–19:30', cost: 0, currency: 'EUR', ...by('u2', 'u2', 280) },
    { id: 'i12', type: 'hotel', title: 'Airbnb in Monti', date: '2026-12-18', time: '15:00', cityId: 'rom', location: 'Via del Boschetto, Roma', ref: 'HMQ9X3T2', notes: 'Host: Giulia. Keys in lockbox, code in app.', cost: 0, currency: 'EUR', ...by('u2', 'u2', 270) },
    { id: 'i13', type: 'hotel', title: 'Casa Bonay', date: '2026-12-21', time: '15:00', cityId: 'bcn', location: 'Gran Via de les Corts Catalanes 700', ref: 'BKG-6631870', notes: '4 nights', cost: 0, currency: 'EUR', ...by('u1', 'u1', 260) },
    { id: 'i14', type: 'hotel', title: 'Memmo Alfama', date: '2026-12-25', time: '15:00', cityId: 'lis', location: 'Travessa das Merceeiras 27, Lisboa', ref: 'MEM-20918', notes: 'Rooftop pool view of the Tagus 🌅', cost: 0, currency: 'EUR', ...by('u1', 'u2', 5) },
    // Reservations
    { id: 'i15', type: 'reservation', title: 'Louvre — timed entry', date: '2026-12-10', time: '09:30', cityId: 'par', placeId: 'p1', location: 'Pyramid entrance', ref: 'LV-993817', notes: 'Go straight to the Denon wing.', cost: 22, currency: 'EUR', ...by('u1', 'u1', 150) },
    { id: 'i16', type: 'reservation', title: 'Uffizi Gallery', date: '2026-12-16', time: '10:15', cityId: 'flo', placeId: 'p9', location: 'Piazzale degli Uffizi', ref: 'UFZ-55102', notes: '', cost: 25, currency: 'EUR', ...by('u2', 'u2', 100) },
    { id: 'i17', type: 'reservation', title: 'Vatican Museums & Sistine Chapel', date: '2026-12-19', time: '08:30', cityId: 'rom', placeId: 'p14', location: 'Viale Vaticano', ref: 'MV-2202761', notes: 'Shoulders & knees covered!', cost: 25, currency: 'EUR', ...by('u2', 'u1', 3) },
    { id: 'i18', type: 'reservation', title: 'Sagrada Família + towers', date: '2026-12-22', time: '11:00', cityId: 'bcn', placeId: 'p15', location: 'Carrer de Mallorca 401', ref: 'SF-8847120', notes: 'Nativity tower', cost: 36, currency: 'EUR', ...by('u1', 'u1', 140) },
    // Activities
    { id: 'i19', type: 'activity', title: 'Breakfast at Café de Flore', date: '2026-12-10', time: '08:00', cityId: 'par', placeId: 'p2', location: 'Saint-Germain-des-Prés', notes: 'Hot chocolate is a must ☕', cost: 30, currency: 'EUR', ...by('u2', 'u2', 40) },
    { id: 'i20', type: 'activity', title: 'Sunset at Sacré-Cœur', date: '2026-12-11', time: '16:30', cityId: 'par', placeId: 'p5', location: 'Montmartre', notes: 'Sunset ~16:55 in December', cost: 0, currency: 'EUR', ...by('u1', 'u1', 39) },
    { id: 'i21', type: 'activity', title: 'Christmas market & Chapel Bridge walk', date: '2026-12-13', time: '17:00', cityId: 'luc', placeId: 'p6', location: 'Franziskanerplatz', notes: 'Glühwein 🍷', cost: 20, currency: 'CHF', ...by('u2', 'u2', 33) },
    { id: 'i22', type: 'activity', title: 'Mt. Pilatus golden round trip', date: '2026-12-14', time: '09:00', cityId: 'luc', placeId: 'p7', location: 'Kriens gondola', notes: 'Winter: gondola both ways (cogwheel closed).', cost: 0, currency: 'CHF', ...by('u1', 'u1', 32) },
    { id: 'i23', type: 'activity', title: "Schiacciata at All'Antico Vinaio", date: '2026-12-16', time: '13:00', cityId: 'flo', placeId: 'p10', location: 'Via dei Neri 74', notes: 'Queue moves fast!', cost: 18, currency: 'EUR', ...by('u2', 'u2', 31) },
    { id: 'i24', type: 'activity', title: 'Piazzale Michelangelo at golden hour', date: '2026-12-17', time: '16:00', cityId: 'flo', placeId: 'p11', location: 'Oltrarno', notes: '', cost: 0, currency: 'EUR', ...by('u1', 'u1', 30) },
    { id: 'i25', type: 'activity', title: 'Colosseum & Roman Forum', date: '2026-12-20', time: '09:00', cityId: 'rom', placeId: 'p12', location: 'Piazza del Colosseo', notes: 'Book the Full Experience ticket', cost: 0, currency: 'EUR', ...by('u1', 'u1', 29) },
    { id: 'i26', type: 'activity', title: 'Dinner at Roscioli', date: '2026-12-19', time: '20:00', cityId: 'rom', placeId: 'p13', location: 'Via dei Giubbonari 21', notes: 'Carbonara 🥚', cost: 90, currency: 'EUR', ...by('u2', 'u2', 28) },
    { id: 'i27', type: 'activity', title: 'Park Güell morning stroll', date: '2026-12-23', time: '09:30', cityId: 'bcn', placeId: 'p16', location: 'Carrer d’Olot', notes: '', cost: 20, currency: 'EUR', ...by('u1', 'u1', 27) },
    { id: 'i28', type: 'activity', title: 'Pastéis de Belém + Belém Tower', date: '2026-12-26', time: '10:00', cityId: 'lis', placeId: 'p19', location: 'Belém', notes: 'Eat them warm with cinnamon 🥧', cost: 15, currency: 'EUR', ...by('u2', 'u2', 26) },
    { id: 'i29', type: 'activity', title: 'Tram 28 + Miradouro da Senhora do Monte', date: '2026-12-27', time: '15:00', cityId: 'lis', placeId: 'p21', location: 'Graça', notes: 'Board at Martim Moniz to get a seat', cost: 3.1, currency: 'EUR', ...by('u1', 'u1', 2) },
  ],

  places: [
    { id: 'p1', name: 'Louvre Museum', category: 'attraction', cityId: 'par', lat: 48.8606, lng: 2.3376, visited: false, notes: 'Winged Victory > Mona Lisa crowds', ...by('u1') },
    { id: 'p2', name: 'Café de Flore', category: 'cafe', cityId: 'par', lat: 48.854, lng: 2.3326, visited: false, notes: '', ...by('u2') },
    { id: 'p3', name: 'Sainte-Chapelle', category: 'attraction', cityId: 'par', lat: 48.8554, lng: 2.345, visited: false, notes: 'Go on a sunny morning for the glass', ...by('u1') },
    { id: 'p4', name: "Le Relais de l'Entrecôte", category: 'restaurant', cityId: 'par', lat: 48.854, lng: 2.329, visited: false, notes: 'Steak-frites, no reservations', ...by('u2') },
    { id: 'p5', name: 'Sacré-Cœur', category: 'attraction', cityId: 'par', lat: 48.8867, lng: 2.3431, visited: false, notes: '', ...by('u1') },
    { id: 'p6', name: 'Chapel Bridge', category: 'attraction', cityId: 'luc', lat: 47.0516, lng: 8.3077, visited: false, notes: '', ...by('u1') },
    { id: 'p7', name: 'Mt. Pilatus', category: 'attraction', cityId: 'luc', lat: 46.979, lng: 8.255, visited: false, notes: '', ...by('u1') },
    { id: 'p8', name: 'Old Swiss House', category: 'restaurant', cityId: 'luc', lat: 47.0573, lng: 8.3105, visited: false, notes: 'Wiener schnitzel made tableside', ...by('u2') },
    { id: 'p9', name: 'Uffizi Gallery', category: 'attraction', cityId: 'flo', lat: 43.7678, lng: 11.2553, visited: false, notes: '', ...by('u2') },
    { id: 'p10', name: "All'Antico Vinaio", category: 'restaurant', cityId: 'flo', lat: 43.7684, lng: 11.257, visited: false, notes: '', ...by('u2') },
    { id: 'p11', name: 'Piazzale Michelangelo', category: 'attraction', cityId: 'flo', lat: 43.7629, lng: 11.265, visited: false, notes: '', ...by('u1') },
    { id: 'p12', name: 'Colosseum', category: 'attraction', cityId: 'rom', lat: 41.8902, lng: 12.4922, visited: false, notes: '', ...by('u1') },
    { id: 'p13', name: 'Salumeria Roscioli', category: 'restaurant', cityId: 'rom', lat: 41.8937, lng: 12.4737, visited: false, notes: 'Book 2 weeks ahead', ...by('u2') },
    { id: 'p14', name: 'Vatican Museums', category: 'attraction', cityId: 'rom', lat: 41.9065, lng: 12.4536, visited: false, notes: '', ...by('u2') },
    { id: 'p22', name: "Sant'Eustachio Il Caffè", category: 'cafe', cityId: 'rom', lat: 41.8983, lng: 12.4753, visited: false, notes: 'Gran caffè', ...by('u2') },
    { id: 'p15', name: 'Sagrada Família', category: 'attraction', cityId: 'bcn', lat: 41.4036, lng: 2.1744, visited: false, notes: '', ...by('u1') },
    { id: 'p16', name: 'Park Güell', category: 'attraction', cityId: 'bcn', lat: 41.4145, lng: 2.1527, visited: false, notes: '', ...by('u1') },
    { id: 'p17', name: 'La Boqueria', category: 'shop', cityId: 'bcn', lat: 41.3817, lng: 2.1716, visited: false, notes: 'Fresh juice + jamón cones', ...by('u2') },
    { id: 'p18', name: 'Belém Tower', category: 'attraction', cityId: 'lis', lat: 38.6916, lng: -9.216, visited: false, notes: '', ...by('u1') },
    { id: 'p19', name: 'Pastéis de Belém', category: 'cafe', cityId: 'lis', lat: 38.6975, lng: -9.2032, visited: false, notes: '', ...by('u2') },
    { id: 'p20', name: 'LX Factory', category: 'shop', cityId: 'lis', lat: 38.7036, lng: -9.1784, visited: false, notes: 'Ler Devagar bookshop 📚', ...by('u2') },
    { id: 'p21', name: 'Miradouro da Senhora do Monte', category: 'attraction', cityId: 'lis', lat: 38.7193, lng: -9.1328, visited: false, notes: '', ...by('u1') },
  ],

  // Pre-trip bookings. Each stores the exchange rate that applied when it was paid (sample values).
  expenses: [
    { id: 'e1', title: 'EVA + Emirates flights (x2)', amount: 78400, currency: 'TWD', rate: 1, category: 'transport', date: '2026-09-02', paidBy: 'u1', split: ['u1', 'u2'], cityId: '', ...by('u1') },
    { id: 'e2', title: 'Paris hotel, 3 nights', amount: 612, currency: 'EUR', rate: 36.2, category: 'stay', date: '2026-09-10', paidBy: 'u1', split: ['u1', 'u2'], cityId: 'par', ...by('u1') },
    { id: 'e3', title: 'Swiss Travel Pass (x2)', amount: 488, currency: 'CHF', rate: 39.1, category: 'transport', date: '2026-10-01', paidBy: 'u2', split: ['u1', 'u2'], cityId: 'luc', ...by('u2') },
    { id: 'e4', title: 'Hotel des Alpes, 3 nights', amount: 735, currency: 'CHF', rate: 39.1, category: 'stay', date: '2026-10-01', paidBy: 'u2', split: ['u1', 'u2'], cityId: 'luc', ...by('u2') },
    { id: 'e5', title: 'Florence + Rome trains', amount: 168, currency: 'EUR', rate: 36.0, category: 'transport', date: '2026-10-14', paidBy: 'u2', split: ['u1', 'u2'], cityId: 'flo', ...by('u2') },
    { id: 'e6', title: 'Rome Airbnb', amount: 540, currency: 'EUR', rate: 36.0, category: 'stay', date: '2026-10-14', paidBy: 'u2', split: ['u1', 'u2'], cityId: 'rom', ...by('u2') },
    { id: 'e7', title: 'Museum tickets (Louvre, Uffizi, Vatican, Sagrada)', amount: 216, currency: 'EUR', rate: 35.9, category: 'sights', date: '2026-10-28', paidBy: 'u1', split: ['u1', 'u2'], cityId: '', ...by('u1') },
    { id: 'e8', title: 'Barcelona + Lisbon hotels', amount: 1380, currency: 'EUR', rate: 35.9, category: 'stay', date: '2026-10-30', paidBy: 'u1', split: ['u1', 'u2'], cityId: 'bcn', ...by('u1') },
    { id: 'e9', title: 'Winter coat (personal)', amount: 3980, currency: 'TWD', rate: 1, category: 'shopping', date: '2026-11-08', paidBy: 'u2', split: ['u2'], cityId: '', ...by('u2') },
    { id: 'e10', title: 'Europe eSIMs (x2)', amount: 1200, currency: 'TWD', rate: 1, category: 'other', date: '2026-11-12', paidBy: 'u1', split: ['u1', 'u2'], cityId: '', ...by('u1') },
  ],

  memories: [
    { id: 'm1', date: '2026-11-15', cityId: '', title: 'The great packing test 🧳', text: 'Managed to fit 3 weeks of winter clothes into one carry-on each. Sheyne insists the scarf collection is "essential".', mood: '🤩', photos: [], ...by('u1', 'u1', 50) },
    { id: 'm2', date: '2026-10-28', cityId: '', title: 'Tickets booked!', text: 'Sagrada Família tower slots were almost gone — we got the last two for the 22nd. Celebrated with bubble tea.', mood: '🥳', photos: [], ...by('u2', 'u2', 480) },
  ],

  docs: [
    { id: 'd1', kind: 'passport', title: 'Pei — Passport', detail: 'Expires Mar 2031 · ends in •••4821', notes: 'Scan saved in iCloud > Travel', ...by('u1') },
    { id: 'd2', kind: 'passport', title: 'Sheyne — Passport', detail: 'Expires Aug 2029 · ends in •••0937', notes: '', ...by('u2') },
    { id: 'd3', kind: 'insurance', title: 'Travel insurance', detail: 'Policy no. (add yours)', notes: 'Covers 8 Dec – 30 Dec. Keep claim forms + receipts.', ...by('u1') },
    { id: 'd4', kind: 'card', title: 'Cards we carry', detail: 'Visa (Pei), Mastercard (Sheyne), €200 cash each', notes: 'Choose to pay in EUR, never in TWD, at card terminals.', ...by('u2') },
  ],

  emergency: [
    { id: 'x1', label: 'European emergency number', value: '112', notes: 'Free from any phone in the EU & Switzerland', ...by('u1') },
    { id: 'x2', label: 'Swiss ambulance', value: '144', notes: '', ...by('u1') },
    { id: 'x3', label: 'Insurance 24h assistance', value: '', notes: 'Add the hotline from your policy', ...by('u1') },
    { id: 'x4', label: 'Taiwan representative office (France)', value: '', notes: 'Add the number from boca.gov.tw before you fly', ...by('u1') },
    { id: 'x5', label: 'Pei — blood type / allergies', value: 'A+ · no allergies', notes: '', ...by('u1') },
    { id: 'x6', label: 'Sheyne — blood type / allergies', value: 'O+ · penicillin allergy', notes: '', ...by('u2') },
  ],

  checklist: [
    { id: 'c1', group: 'Documents', text: 'Passports (valid 3+ months after trip)', done: true },
    { id: 'c2', group: 'Documents', text: 'Travel insurance printed', done: true },
    { id: 'c3', group: 'Documents', text: 'Check ETIAS / entry rules for Taiwan passports', done: false },
    { id: 'c4', group: 'Money', text: 'Euros + some Swiss francs', done: false },
    { id: 'c5', group: 'Money', text: 'Tell bank about travel dates', done: false },
    { id: 'c6', group: 'Tech', text: 'Plug adapters: type C/F + type J (Swiss)', done: false },
    { id: 'c7', group: 'Tech', text: 'Install eSIMs', done: false },
    { id: 'c8', group: 'Tech', text: 'Offline maps downloaded', done: false },
    { id: 'c9', group: 'Packing', text: 'Thermal layers + gloves', done: true },
    { id: 'c10', group: 'Packing', text: 'Comfy walking shoes', done: true },
    { id: 'c11', group: 'Packing', text: 'Scarf for churches', done: false },
  ],

  log: [
    { id: 'l1', userId: 'u1', action: 'added', col: 'items', title: 'Tram 28 + Miradouro da Senhora do Monte', at: hoursAgo(2) },
    { id: 'l2', userId: 'u1', action: 'updated', col: 'items', title: 'Vatican Museums & Sistine Chapel', at: hoursAgo(3) },
    { id: 'l3', userId: 'u2', action: 'updated', col: 'items', title: 'Memmo Alfama', at: hoursAgo(5) },
    { id: 'l4', userId: 'u1', action: 'updated', col: 'items', title: 'Frecciarossa Florence → Rome', at: hoursAgo(12) },
  ],

  settings: { currentUser: 'u1', rates: {}, ratesDate: '', ratesSource: '' },
})
