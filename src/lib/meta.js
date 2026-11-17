import { Plane, TrainFront, BedDouble, Ticket, MapPin } from 'lucide-react'

export const ITEM_TYPES = {
  activity: { label: 'Activity', emoji: '📍', icon: MapPin, tone: 'green' },
  flight: { label: 'Flight', emoji: '✈️', icon: Plane, tone: 'blue' },
  train: { label: 'Train', emoji: '🚆', icon: TrainFront, tone: 'peach' },
  hotel: { label: 'Stay', emoji: '🛏️', icon: BedDouble, tone: 'pink' },
  reservation: { label: 'Reservation', emoji: '🎟️', icon: Ticket, tone: 'yellow' },
}
export const BOOKING_TYPES = ['flight', 'train', 'hotel', 'reservation']

export const PLACE_CATS = {
  restaurant: { label: 'Restaurants', emoji: '🍝', color: '#F6B48F' },
  cafe: { label: 'Cafés', emoji: '☕', color: '#E8C9A0' },
  attraction: { label: 'Attractions', emoji: '🏛️', color: '#A9D8B0' },
  shop: { label: 'Shops & markets', emoji: '🛍️', color: '#F7B9C8' },
  other: { label: 'Other', emoji: '✨', color: '#B9D6F2' },
}

export const EXPENSE_CATS = {
  transport: { label: 'Transport', emoji: '🚆', color: '#7FB3E0' },
  stay: { label: 'Stays', emoji: '🛏️', color: '#E98AA6' },
  food: { label: 'Food', emoji: '🍝', color: '#F2A36B' },
  sights: { label: 'Sights', emoji: '🎟️', color: '#7CC08A' },
  shopping: { label: 'Shopping', emoji: '🛍️', color: '#C8A2E0' },
  other: { label: 'Other', emoji: '✨', color: '#E8C76A' },
}

export const DOC_KINDS = { passport: '🛂 Passport', insurance: '🩺 Insurance', visa: '📄 Visa / entry', card: '💳 Cards', other: '🗂️ Other' }
