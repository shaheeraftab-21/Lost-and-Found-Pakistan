export const CATEGORIES = ['Electronics', 'Wallet & Purse', 'Documents & ID', 'Keys', 'Bag & Luggage', 'Jewellery', 'Clothing', 'Books & Stationery', 'Sports & Fitness', 'Other']
export const SUBCATS = {
  'Electronics': ['Mobile Phone', 'Tablet', 'Laptop', 'Headphones', 'Camera', 'Charger', 'Smartwatch', 'Other Electronics'],
  'Wallet & Purse': ['Wallet', 'Purse', 'Cardholder', 'Money Clip'],
  'Documents & ID': ['CNIC', 'Passport', 'Driving License', 'Student ID', 'ATM Card', 'Other Documents'],
  'Keys': ['Car Keys', 'House Keys', 'Office Keys', 'Bike Keys', 'Locker Keys'],
  'Bag & Luggage': ['Backpack', 'Handbag', 'Suitcase', 'Laptop Bag', 'School Bag', 'Gym Bag'],
  'Jewellery': ['Ring', 'Bracelet', 'Necklace', 'Earrings', 'Watch', 'Bangles'],
  'Clothing': ['Jacket', 'Scarf', 'Cap/Hat', 'Shoes', 'Other Clothing'],
  'Books & Stationery': ['Notebook', 'Textbook', 'File/Folder', 'Stationery'],
  'Sports & Fitness': ['Sports Equipment', 'Fitness Tracker', 'Yoga Mat', 'Other Sports'],
  'Other': ['Other'],
}
export const COLORS = ['Black', 'White', 'Grey', 'Silver', 'Gold', 'Red', 'Blue', 'Navy Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Beige', 'Maroon', 'Teal', 'Multicolour', 'Other']
export const PROVINCES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Azad Jammu & Kashmir', 'Gilgit-Baltistan']
export const CITIES_BY_PROVINCE = {
  'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Sahiwal', 'Gujrat', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Dera Ghazi Khan', 'Other'],
  'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas', 'Jacobabad', 'Other'],
  'Khyber Pakhtunkhwa': ['Peshawar', 'Mardan', 'Abbottabad', 'Mingora (Swat)', 'Kohat', 'Mansehra', 'Nowshera', 'Dera Ismail Khan', 'Other'],
  'Balochistan': ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Sibi', 'Zhob', 'Other'],
  'Islamabad Capital Territory': ['Islamabad'],
  'Azad Jammu & Kashmir': ['Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli', 'Bagh', 'Other'],
  'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Hunza', 'Chilas', 'Other'],
}

const ICONS = { 'Electronics': '📱', 'Wallet & Purse': '👛', 'Documents & ID': '📄', 'Keys': '🔑', 'Bag & Luggage': '👜', 'Jewellery': '💍' }
export const categoryIcon = (c) => ICONS[c] || '📦'

export const fmtDate = (iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString('en-US', opts)

export const waLink = (phone, text) => {
  let p = phone.replace(/[\s+-]/g, '')
  if (p.startsWith('0')) p = '92' + p.slice(1)
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`
}
