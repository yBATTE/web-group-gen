// Company Information
export const COMPANY_INFO = {
  name: "Grupo GEN",
  logo: "/logo-grupo-gen.jpg",
  description:
    "Líderes en el sector energético argentino, comprometidos con brindar calidad y servicio excepcional en cada estación YPF.",
  address: {
    street: "Av. Corrientes 1234, Piso 5",
    city: "Buenos Aires",
    postalCode: "C1043AAZ",
    country: "Argentina",
    full: "Av. Corrientes 1234, Piso 5, C1043AAZ, Buenos Aires, Argentina",
  },
  contact: {
    phone: "+54 11 2345-6789",
    phoneDisplay: "+54 11 2345-6789",
    whatsapp: "541123456789",
    whatsappDisplay: "+54 11 2345-6789",
    email: "info@grupogen.com.ar",
  },
}

// Social Media Links
export const SOCIAL_MEDIA = {
  facebook: "https://facebook.com/grupogen",
  twitter: "https://twitter.com/grupogen",
  instagram: "https://instagram.com/grupogen",
  linkedin: "https://linkedin.com/company/grupogen",
}

// News Section Data
export const NEWS = [
  {
    id: 1,
    title: "Nueva Estación YPF en la Ruta 16",
    excerpt: "Es la más nueva y moderna de nuestras estaciones de servicio..",
    date: "15 de Enero, 2025",
    image: "/placeholder-i80ci.png",
    category: "Inauguración",
  },
  {
    id: 2,
    title: "Promociones de Combustible",
    excerpt: "Aprovechá nuestras ofertas especiales en combustibles premium durante todo el mes.",
    date: "10 de Enero, 2025",
    image: "/surtidor.png",
    category: "Promociones",
  },
  {
    id: 3,
    title: "Servicios de Lavadero Renovados",
    excerpt: "Renovamos completamente nuestros servicios de lavadero con equipos ecológicos.",
    date: "5 de Enero, 2025",
    image: "/modern-car-wash.png",
    category: "Servicios",
  },
]

// Gas Stations Data
export const STATIONS = [
  {
    id: 1,
    name: "CATANIA GEN",
    address: "Ruta 16 esq. Mendel, Partido de Presidente Perón",
    description:
      "Estación YPF con servicios completos, incluyendo combustible, shop y lavadero. Ideal para viajeros y residentes de la zona.",
    image: "/combustible2.jpg",
    services: ["Combustible", "Tienda Full", "Venta de GNC", "Cajero automático"],
    mapsLink: "https://maps.app.goo.gl/wYKPJCbfkhd7w7zk7",
    lat: -34.8953817,
    lng: -58.434422,
  },
  {
    id: 2,
    name: "COMBUSTIBLES CANNING",
    address: "Ruta 58 km 10.5 – Guernica, Buenos Aires",
    description:
      "Cuenta con Deck al aire libre y fuente de aguas danzantes.",
    image: "/combustiblescanning.jpg",
    services: ["Combustible", "Tienda Full", "Venta de GNC", "Cajero automático"],
    mapsLink: "https://maps.app.goo.gl/fTmSdyr4WotAJcs96",
    lat: -34.9322363,
    lng: -58.4854614,
  },
  {
    id: 3,
    name: "MONTEVERDE SA",
    address: "Av. Martin Rodríguez 184 – Banfield, Buenos Aires",
    description:
      "Completa estación de servicio en Recoleta con taller mecánico especializado y servicios de lavadero premium.",
    image: "/combustible3.png",
    services: ["Combustible", "Tienda Full", "Venta de GNC", "Cajero automático"],
    mapsLink: "https://maps.app.goo.gl/djygBwiSDRatqUAEA",
    lat: -34.7280182,
    lng: -58.4197566,
  },
  {
    id: 4,
    name: "TOBAGO I",
    address: "Av. Lacase 6593 – Claypole, Buenos Aires",
    description:
      "Estación práctica y accesible en Villa Crespo, perfecta para el día a día con servicios esenciales y cajero automático.",
    image: "/combustible4.jpg",
    services: ["Combustible", "Tienda Full", "Venta de GNC", "Cajero automático"],
    mapsLink: "https://maps.app.goo.gl/xACL2H6YUEZYZKyr7",
    lat: -34.7916646,
    lng: -58.3113973,
  },
  {
    id: 5,
    name: "TOBAGO II",
    address: "Av. Monteverde 1081 – San Francisco Solano",
    description:
      "Estación completa en el histórico barrio de San Telmo, con café artesanal y todos los servicios que necesitás.",
    image: "/combustible5.jpeg",
    services: ["Combustible", "Tienda Full", "WiFi", "Lavadero", "Servicompras", "Cajero automático"],
    mapsLink: "https://maps.app.goo.gl/x9VgB7J92Z6uFwVs5",
    lat: -34.7783128,
    lng: -58.2898801,
  },
  {
    id: 6,
    name: "BETTICA SA",
    address: "Tte. Gral. J. D. Perón 2659 – Florencio Varela",
    description:
      "Estación integral en Caballito con taller mecánico certificado y servicios bancarios para mayor comodidad.",
    image: "/combustible6.jpg",
    services: ["Combustible", "Tienda Full", "Cajero automático"],
    mapsLink: "https://maps.app.goo.gl/9MJxQ2j5sP9cfnfn6",
    lat: -34.8050852,
    lng: -58.2476984,
  },
]

// Navigation Links
export const NAVIGATION_LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#noticias", label: "Noticias" },
  { href: "#sobre-nosotros", label: "Sobre Nosotros" },
  { href: "#estaciones", label: "Estaciones" },
  { href: "#contacto", label: "Contacto" },
]

// Footer Links
export const FOOTER_LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#estaciones", label: "Nuestras Estaciones" },
  { href: "#contacto", label: "Contacto" },
  { href: "#sobre-nosotros", label: "Sobre Nosotros" },
  { href: "#noticias", label: "Noticias" },
]

// Legal Links
export const LEGAL_LINKS = [
  { href: "#", label: "Política de Privacidad" },
  { href: "#", label: "Términos y Condiciones" },
]

// Hero Section Content
export const HERO_CONTENT = {
  title: "Estaciones YPF de Confianza",
  subtitle: "Descubrí nuestras estaciones de servicio con la mejor calidad y atención en Buenos Aires",
  ctaText: "Ver Estaciones",
  backgroundImage: "/modern-ypf-gas-station.jpg",
}

// Contact Form Messages
export const CONTACT_MESSAGES = {
  success: "¡Mensaje enviado con éxito! ✅",
  error: "No se pudo enviar el mensaje ❌",   // <-- AGREGAR
  sending: "Enviando...",
  send: "Enviar Mensaje",
} as const;

// About Us Section Content
export const ABOUT_US = {
  title: "Sobre Nosotros",
  subtitle: "Conocé la historia y valores de Grupo GEN",
  content: {
    mission: {
      title: "Nuestra Misión",
      description:
        "Brindar servicios energéticos de excelencia, contribuyendo al desarrollo sustentable del país y mejorando la calidad de vida de nuestros clientes.",
    },
    vision: {
      title: "Nuestra Visión",
      description:
        "Ser la empresa líder en el sector energético argentino, reconocida por nuestra innovación, calidad de servicio y compromiso con el medio ambiente.",
    },
    values: {
      title: "Nuestros Valores",
      items: [
        "Excelencia en el servicio al cliente",
        "Compromiso con la sustentabilidad",
        "Innovación y tecnología de vanguardia",
        "Responsabilidad social y ambiental",
      ],
    },
  },
  stats: [
    { number: "25+", label: "Años de experiencia" },
    { number: "50+", label: "Estaciones de servicio" },
    { number: "10M+", label: "Clientes satisfechos" },
    { number: "24/7", label: "Atención continua" },
  ],
}



