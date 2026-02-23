import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { savePartnerApplication } from './firebase';

// Ice product types
interface IceProduct {
  id: number;
  name: string;
  description: string;
  pricePerKg: number;
  image: string;
  category: string;
  available: boolean;
}

// Restaurant registration type
interface RestaurantRegistration {
  id: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  expectedMonthlyQuantity: string;
  additionalNotes: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface AdminApplication {
  id: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  expectedMonthlyQuantity: string;
  additionalNotes: string;
  status: string;
  submittedAtIso: string;
}

// Ice products data
const iceProducts: IceProduct[] = [
  {
    id: 1,
    name: 'Crystal Clear Ice Cubes',
    description: 'Premium quality transparent ice cubes, perfect for bars and restaurants. Slow-melting crystals keep drinks cold without diluting flavor.',
    pricePerKg: 25,
    image: '🧊',
    category: 'Ice Cubes',
    available: true
  },
  {
    id: 2,
    name: 'Crushed Ice',
    description: 'Finely crushed ice ideal for smoothies, slushies, and food displays. Quick cooling and perfect texture.',
    pricePerKg: 20,
    image: '🧊',
    category: 'Crushed Ice',
    available: true
  },
  {
    id: 3,
    name: 'Block Ice',
    description: 'Large solid ice blocks perfect for catering, food preservation, and decorative purposes.',
    pricePerKg: 18,
    image: '🧊',
    category: 'Block Ice',
    available: true
  },
  {
    id: 4,
    name: 'Dry Ice Pellets',
    description: 'Professional grade dry ice for food transport, fog effects, and industrial cooling applications.',
    pricePerKg: 80,
    image: '❄️',
    category: 'Specialty',
    available: false
  },
  {
    id: 5,
    name: 'Ice Cream Base Mix',
    description: 'Premium ice cream mix for commercial use. Make your own ice cream with consistent quality.',
    pricePerKg: 120,
    image: '🍦',
    category: 'Ice Cream',
    available: false
  },
  {
    id: 6,
    name: 'Flavored Ice Cubes',
    description: 'Colorful fruit-flavored ice cubes that add visual appeal and taste to beverages.',
    pricePerKg: 45,
    image: '🍋',
    category: 'Specialty',
    available: false
  },
  {
    id: 7,
    name: 'Whipped Cream Cans',
    description: 'Professional whipped cream dispensers for cafes, bakeries, and dessert parlors.',
    pricePerKg: 150,
    image: '🫧',
    category: 'Dairy',
    available: false
  },
  {
    id: 8,
    name: 'Gourmet Ice Pops',
    description: 'Premium ice pops in various flavors. Perfect for cafes, hotels, and retail stores.',
    pricePerKg: 60,
    image: '🍧',
    category: 'Specialty',
    available: false
  }
];

// WhatsApp number (replace with actual number)
const WHATSAPP_NUMBER = '918824225964';

// Navigation Component
function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/register", label: "Become a Partner" },
  ];
  
  const closeMenu = () => setMobileMenuOpen(false);
  
  return (
    <nav className="bg-gradient-to-r from-cyan-600 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <span className="text-2xl sm:text-3xl">🧊</span>
            <div>
              <h1 className="text-white font-bold text-sm sm:text-lg md:text-xl">Dhiraj Ice Centre</h1>
              <p className="text-cyan-200 text-[9px] sm:text-xs hidden sm:block">Premium Ice Since 1985</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`text-white hover:text-cyan-200 transition-colors font-medium text-sm xl:text-base ${location.pathname === link.to ? 'text-cyan-200 border-b-2 border-cyan-200' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-3 xl:px-4 py-2 rounded-full font-medium flex items-center space-x-2 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
          
          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full mr-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-cyan-500/30">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className={`text-white hover:text-cyan-200 transition-colors font-medium px-3 py-2.5 rounded-lg ${location.pathname === link.to ? 'bg-cyan-500/30' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section
function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Animated ice crystals background */}
      <div className="absolute inset-0 opacity-20 overflow-hidden">
        <div className="absolute top-4 sm:top-10 left-2 sm:left-10 text-4xl sm:text-6xl md:text-8xl animate-pulse">❄️</div>
        <div className="absolute top-20 sm:top-40 right-4 sm:right-20 text-3xl sm:text-5xl md:text-6xl animate-pulse delay-100">🧊</div>
        <div className="absolute bottom-10 sm:bottom-20 left-1/4 text-3xl sm:text-5xl md:text-7xl animate-pulse delay-200">❄️</div>
        <div className="absolute bottom-20 sm:bottom-40 right-1/3 text-2xl sm:text-4xl md:text-5xl animate-pulse delay-300 hidden sm:block">🧊</div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
            Fresh Ice Delivered to Your Door
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-cyan-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Premium quality ice cubes, crushed ice, and specialty ice products for restaurants, bars, hotels, and events.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <button
              type="button"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              View Products
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('location')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="bg-white/10 hover:bg-white/20 text-white border-2 border-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-lg transition-all"
            >
              Our Location
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-8 mt-10 sm:mt-16 text-center">
          <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-6">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-300">25+</div>
            <div className="text-white text-xs sm:text-sm mt-1 sm:mt-2">Years Experience</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-6">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-300">500+</div>
            <div className="text-white text-xs sm:text-sm mt-1 sm:mt-2">Happy Clients</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-6">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-300">50+</div>
            <div className="text-white text-xs sm:text-sm mt-1 sm:mt-2">Daily Deliveries</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-6">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-300">24/7</div>
            <div className="text-white text-xs sm:text-sm mt-1 sm:mt-2">Service Available</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: IceProduct }) {
  const [quantity, setQuantity] = useState(1);
  const totalPrice = product.pricePerKg * quantity;
  const isAvailable = product.available;

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${isAvailable ? "hover:shadow-2xl transform hover:-translate-y-1 sm:hover:-translate-y-2" : "opacity-75"}`}>
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 sm:p-6 md:p-8 text-center">
        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 sm:mb-4">{product.image}</div>
        <span className="bg-cyan-100 text-cyan-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
          {product.category}
        </span>
      </div>
      
      <div className="p-4 sm:p-6">
        <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 ${isAvailable ? "text-gray-800" : "text-gray-500 line-through"}`}>{product.name}</h3>
        <p className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 ${isAvailable ? "text-gray-600" : "text-gray-400 line-through"}`}>{product.description}</p>
        
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <span className="text-xs sm:text-sm text-gray-500">Price per KG</span>
            <div className={`text-xl sm:text-2xl font-bold ${isAvailable ? "text-cyan-600" : "text-gray-400 line-through"}`}>₹{product.pricePerKg}</div>
          </div>
        </div>
        
        {/* Quantity Selector */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium text-sm">Quantity (KG)</span>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!isAvailable}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center text-lg sm:text-xl font-bold text-cyan-600 hover:bg-cyan-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-8 sm:w-12 text-center font-bold text-base sm:text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                disabled={!isAvailable}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center text-lg sm:text-xl font-bold text-cyan-600 hover:bg-cyan-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium text-sm">Total Price</span>
              <span className="text-xl sm:text-2xl font-bold text-green-600">₹{totalPrice}</span>
            </div>
          </div>
        </div>
        
        {isAvailable ? (
          <a 
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=I'm%20interested%20in%20${encodeURIComponent(product.name)}%20-%20${quantity}KG%20(%20₹${totalPrice})`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-center py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all"
          >
            Order on WhatsApp 🛒
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="block w-full bg-gray-300 text-gray-600 text-center py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base cursor-not-allowed line-through"
          >
            Currently Unavailable
          </button>
        )}
      </div>
    </div>
  );
}

// Products Section
function ProductsSection() {
  return (
    <section id="products" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Our Ice Products</h2>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our wide range of premium ice products. All products are manufactured with strict quality control.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {iceProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Location Section
function LocationSection() {
  return (
    <section id="location" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-900 via-cyan-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Find Us</h2>
          <p className="text-sm sm:text-base md:text-xl text-cyan-100">Visit our factory or contact us for home delivery</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start">
          <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">Factory Address</h3>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-cyan-500 rounded-full p-2 sm:p-3 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm sm:text-base">Address</h4>
                  <p className="text-cyan-100 text-sm sm:text-base">
                    Dheeraj Ice Centre<br />
                    BC 17 NARAYAN TALLA WEST<br />
                    Near raj laxmi beeding stor, Baguiati<br />
                    Kolkata-700059, West Bengal.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-cyan-500 rounded-full p-2 sm:p-3 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm sm:text-base">Phone</h4>
                  <p className="text-cyan-100 text-sm sm:text-base">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-cyan-500 rounded-full p-2 sm:p-3 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm sm:text-base">Business Hours</h4>
                  <p className="text-cyan-100 text-sm sm:text-base">Mon - Sat 6:00AM - 10:00 PM</p>
                  <p className="text-cyan-100 mt-1 sm:mt-2 text-xs sm:text-sm">* 24/7 Emergency for Bulk Orders</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-cyan-500 rounded-full p-2 sm:p-3 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm sm:text-base">Email</h4>
                  <p className="text-cyan-100 text-sm sm:text-base">info@dhirajicefactory.com</p>
                </div>
              </div>
            </div>
            
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 sm:mt-8 w-full bg-green-500 hover:bg-green-600 text-white py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
          </div>
          
          {/* Embedded Google Map */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-3 h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
              <iframe
                title="Dhiraj Ice Centre Location"
                src="https://www.google.com/maps?q=BC+17+NARAYAN+TALLA+WEST,+Near+raj+laxmi+beeding+stor,+Baguiati,+Kolkata-700059,+West+Bengal&output=embed"
                className="w-full h-full rounded-lg sm:rounded-xl border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="text-center">
              <a
                href="https://maps.app.goo.gl/wdzFHL8AMrshJgHy5"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-4 sm:px-6 py-2 rounded-full transition-colors text-sm sm:text-base"
              >
                Open Exact Location in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl">🧊</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Dhiraj Ice Centre</h3>
                <p className="text-cyan-200 text-xs sm:text-sm">Premium Ice Since 1985</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted partner for premium ice products. We deliver freshness and quality to businesses across the region.
            </p>
          </div>
          
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-cyan-300 transition-colors text-sm">Home</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-cyan-300 transition-colors text-sm">Products</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-cyan-300 transition-colors text-sm">Become a Partner</Link></li>
            </ul>
          </div>
          
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📍 Dheeraj Ice Centre<br />BC 17 NARAYAN TALLA WEST<br />Near raj laxmi beeding stor, Baguiati<br />Kolkata-700059, West Bengal.</li>
              <li>📞 +91 98765 43210</li>
              <li>✉️ info@dhirajicefactory.com</li>
            </ul>
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-full mt-3 sm:mt-4 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
          <p>© 2024 Dhiraj Ice Centre. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Home Page
function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ProductsSection />
      <LocationSection />
    </div>
  );
}

// Products Page
function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 pt-6 sm:pt-8 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">All Ice Products</h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600">Browse our complete range of premium ice products</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {iceProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Restaurant Registration Page
function RegistrationPage() {
  const [formData, setFormData] = useState<Omit<RestaurantRegistration, 'id' | 'status' | 'submittedAt'>>({
    restaurantName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    expectedMonthlyQuantity: '',
    additionalNotes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');

    try {
      await savePartnerApplication({
        ...formData,
        status: 'pending',
        submittedAtIso: new Date().toISOString()
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit partner application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to submit your application right now. Please try again in a few minutes.';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 pt-6 sm:pt-8 pb-12 sm:pb-16">
        <div className="max-w-2xl mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 text-center">
            <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 sm:mb-6">✅</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Thank you for your interest in becoming a partner with Dhiraj Ice Centre. 
              Our team will review your application and contact you within 24-48 hours.
            </p>
            <div className="bg-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left">
              <h3 className="font-semibold text-cyan-800 mb-2 text-sm sm:text-base">What happens next?</h3>
              <ul className="text-cyan-700 space-y-2 text-sm sm:text-base">
                <li>✓ Our team will verify your restaurant details</li>
                <li>✓ We'll call you to discuss pricing and delivery</li>
                <li>✓ Once approved, you'll receive your partner ID</li>
                <li>✓ Start enjoying wholesale prices!</li>
              </ul>
            </div>
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-5 sm:px-6 py-3 rounded-full transition-colors text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Chat with us on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 pt-6 sm:pt-8 pb-12 sm:pb-16">
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🏪</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Become a Partner</h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600">
            Join our network. Get exclusive wholesale pricing and priority delivery.
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          {submitError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Restaurant Details */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <span className="bg-cyan-500 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3 text-sm">1</span>
                Restaurant Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Restaurant Name *</label>
                  <input 
                    type="text" 
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Restaurant name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Owner Name *</label>
                  <input 
                    type="text" 
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Owner name"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <span className="bg-blue-500 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3 text-sm">2</span>
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="+91 98765 43210"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="restaurant@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <span className="bg-indigo-500 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3 text-sm">3</span>
                Address Details
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Full Address *</label>
                  <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Street address, area"
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 sm:gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">City *</label>
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">State *</label>
                    <input 
                      type="text" 
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="State"
                    />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">PIN Code *</label>
                    <input 
                      type="text" 
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="123456"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <span className="bg-purple-500 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3 text-sm">4</span>
                Business Requirements
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Monthly Ice Quantity (KG)</label>
                  <select 
                    name="expectedMonthlyQuantity"
                    value={formData.expectedMonthlyQuantity}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="">Select quantity range</option>
                    <option value="100-500">100 - 500 KG</option>
                    <option value="500-1000">500 - 1,000 KG</option>
                    <option value="1000-2000">1,000 - 2,000 KG</option>
                    <option value="2000-5000">2,000 - 5,000 KG</option>
                    <option value="5000+">5,000+ KG</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Additional Notes</label>
                  <textarea 
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Any special requirements or questions..."
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Application'
              )}
            </button>

            <p className="text-center text-gray-500 text-xs sm:text-sm">
              Our team will contact you within 24-48 hours.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}


// Admin Page
function AdminPage() {
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchApplications = async (id: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/partner-applications', {
        method: 'GET',
        headers: {
          'x-admin-id': id,
          'x-admin-password': password
        }
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load applications.');
      }

      setApplications(data.applications || []);
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_id', id);
      sessionStorage.setItem('admin_password', password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load applications.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedId = sessionStorage.getItem('admin_id') || '';
    const savedPassword = sessionStorage.getItem('admin_password') || '';

    if (savedId && savedPassword) {
      setAdminId(savedId);
      setAdminPassword(savedPassword);
      fetchApplications(savedId, savedPassword);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchApplications(adminId, adminPassword);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_id');
    sessionStorage.removeItem('admin_password');
    setIsAuthenticated(false);
    setApplications([]);
    setAdminId('');
    setAdminPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Admin Portal</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Partner Application Documents</p>
        </div>

        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-5 sm:p-6">
            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter admin ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <p className="text-sm text-gray-600">Total Applications: <span className="font-semibold text-gray-800">{applications.length}</span></p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchApplications(adminId, adminPassword)}
                  disabled={loading}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  Refresh
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-slate-700 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-lg text-sm"
                >
                  Logout
                </button>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">No applications yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {applications.map((app) => (
                  <article key={app.id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-bold text-gray-800 text-base sm:text-lg">{app.restaurantName || 'Unnamed Restaurant'}</h2>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">{app.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Doc ID: {app.id}</p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Owner:</span> {app.ownerName}</p>
                      <p><span className="font-semibold">Phone:</span> {app.phone}</p>
                      <p><span className="font-semibold">Email:</span> {app.email}</p>
                      <p><span className="font-semibold">Address:</span> {app.address}, {app.city}, {app.state} - {app.pincode}</p>
                      <p><span className="font-semibold">Monthly Qty:</span> {app.expectedMonthlyQuantity || 'N/A'}</p>
                      <p><span className="font-semibold">Notes:</span> {app.additionalNotes || 'N/A'}</p>
                      <p><span className="font-semibold">Submitted:</span> {app.submittedAtIso ? new Date(app.submittedAtIso).toLocaleString() : 'N/A'}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component
export function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
