/* =========================
   TIPOS
========================= */
export type MenuItem = { name: string; desc?: string; price: string }
export type MenuSection = { id: string; title: string; items: MenuItem[] }

export type PromoItem = {
  id: string
  mediaUrl: string
  mediaType: "image" | "video"
  title?: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
}

/* =========================
   PROMOS (carrusel)
========================= */
export const PROMOS: PromoItem[] = [
  {
    id: "p1",
    mediaUrl: "/tamanioscafe.png",
    mediaType: "image",
    title: "Disfrutá de beneficios todos los días",
    subtitle: "Pagá con la app y sumá puntos",
    ctaText: "Ver descuentos",
    ctaHref: "#descuentos", // si no usás link, dejalo en "#" o quitá las props
  },
  { id: "p2", mediaUrl: "/croisant.png", mediaType: "image", title: "Promo Ypf" },
  { id: "p3", mediaUrl: "/avocadotoast.png", mediaType: "image" },
  { id: "p4", mediaUrl: "/comboshamburguesas.png", mediaType: "image" },
]

/* =========================
   MENÚ (DEFAULT para seed en DB)
========================= */
export const DEFAULT_MENU: MenuSection[] = [
  /* Cafetería + combos del póster */
  {
    id: "cafeteria",
    title: "Cafetería",
    items: [
      { name: "Café jarrito +2 facturas", price: "$5.000" },
      { name: "Café jarrito +3 facturas", price: "$6.000" },
      { name: "Café c/leche +2 facturas", price: "$5.900" },
      { name: "Café c/leche +3 facturas", price: "$6.900" },
      { name: "Tazón café c/leche +2 facturas", price: "$6.200" },
      { name: "Tazón café c/leche +3 facturas", price: "$7.300" },
    ],
  },
  {
    id: "cafes",
    title: "Cafés",
    items: [
      { name: "Capuccino", price: "$4.000" },
      { name: "Submarino", price: "$4.200" },
      { name: "Latte Vainilla", price: "$5.000" },
      { name: "Latte Caramel", price: "$5.000" },
      { name: "Cafe Chico", price: "$2.800" },
      { name: "Cafe Jarrito", price: "$3.100" },
      { name: "Café con leche", price: "$4.100" },
      { name: "Tazon Cafe Con Leche", price: "$4.500" },
    ],
  },
  {
    id: "cafeteriafull",
    title: "Cafetería • Productos",
    items: [
      { name: "Café Expreso", price: "$2.800" },
      { name: "Café Americano", price: "$3.100" },
      { name: "Café Cortado", price: "$3.100" },
      { name: "Café con Leche", price: "$4.100" },
      { name: "Café Latte", price: "$4.500" },
      { name: "Cappuccino", price: "$4.000" },
      { name: "Submarino", price: "$4.200" },
      { name: "Mocaccino", price: "$5.000" },
      { name: "Latte Vainilla", price: "$5.000" },
    ]
  },

  /* Panadería */
  {
    id: "panaderia",
    title: "Panadería",
    items: [
      { name: "Budín porción", desc: "con cafe", price: "$7.200" },
      { name: "Alfajor", desc: "con cafe", price: "$5.200" },
      { name: "Muffin simple", desc: "con cafe", price: "$6.800" },
      { name: "Muffin relleno", desc: "con cafe", price: "$6.800" },
      { name: "Chesscake", desc: "con cafe", price: "$8.700" },
      { name: "Croissant de jamón y queso", desc: "Sin cafe", price: "$7.500" },
      { name: "Trenzado de lomito y queso", desc: "Sin cafe", price: "$6.900" },
      { name: "Tostado", desc: "Sin cafe", price: "$6.800" },
    ],
  },

  /* Comidas • Combos + bebida */
  {
    id: "comidas",
    title: "Comidas • Combos + bebida",
    items: [
      { name: "Milanesa napolitana", desc: "Con papas rusticas y gaseosa", price: "$11.750" },
      { name: "Pechuga de pollo",    desc: "Con arroz y gaseosa", price: "$11.750" },
      { name: "Lasagna",             desc: "Con gaseosa",         price: "$11.750" },
      { name: "Risotto de calabaza", desc: "Con gaseosa",         price: "$10.950" },
      { name: "Carré de cerdo",      desc: "Con puré de batatas y gaseosa", price: "$11.750" },
      { name: "Albóndigas portuguesas",  desc: "Con arroz y gaseosa", price: "$11.750" },

      // ROLLS
      { name: "Roll Veggie", desc: "Con gaseosa", price: "$11.000" },
      { name: "Roll Jamón y Queso", desc: "Con gaseosa", price: "$11.000" },
      { name: "Roll Pollo", desc: "Con gaseosa", price: "$11.000" },
      { name: "Roll Peceto", desc: "Con gaseosa", price: "$11.000" },

      // HAMBURGUESAS
      { name: "Hamburguesa con queso",  desc: "Con papas y gaseosa", price: "$11.500" },
      { name: "Hamburguesa doble",      desc: "Con papas", price: "$12.800" },

      // SANDWICHES Y CIABATTAS
      { name: "Ciabatta jamón y queso", price: "$10.050" },
      { name: "Ciabatta multicereal",   price: "$9.750" },
      { name: "Sándwich de milanesa",   desc: "Con papas y gaseosa", price: "$14.000" },
    ],
  },

  /* Hamburguesas */
  {
    id: "hamburguesas",
    title: "Hamburguesas",
    items: [
      { name: "Hamburguesa magna", desc: "Palta, panceta y cheddar", price: "$15.400" },
      { name: "Hamburguesa de campo", desc: "Panceta, Cheddar y salsa chipotle", price: "$14.900" },
      { name: "Gran Hamburguesa", desc: "Panceta, huevo, cheddar y salsa BBQ", price: "$14.900" },

      { name: "Doble queso y huevo", desc: "Cheddar, huevo, tomate y lechuga", price: "$13.600" },
      { name: "Doble y triple max", desc: "Salsa picante, cheddar y jalapeños", price: "$14.900/$15.700" },
      { name: "Not Chicken Crispy", desc: "Barbacoa o palta", price: "$14.850" },

      { name: "Hamburguesa con queso",  desc: "Con papas y gaseosa", price: "$11.500" },
      { name: "Hamburguesa doble",      desc: "Con papas", price: "$12.800" },
    ],
  },

  /* Hamburguesas de pollo */
  {
    id: "hamburguesapollo",
    title: "Hamburguesas de pollo",
    items: [
      { name: "Hamburguesa Deluxe", desc: "Palta, panceta y cheddar", price: "$11.300" },
      { name: "Hamburguesa Simple", desc: "Lechuga tomate y cheddar", price: "$10.300" },
    ]
  },

  /* Ensaladas */
  {
    id: "ensaladas",
    title: "Ensaladas",
    items: [
      { name: "Ensalada Caesar", desc: "Pechuga grille, panceta y parmesano", price: "$11.500" },
      { name: "Ensalada Chef", desc: "Lechuga criolla y morada, jamon cocido, queso y huevo duro", price: "$11.500" },
    ],
  },

  /* Bebidas frías */
  {
    id: "bebidas",
    title: "Bebidas frías",
    items: [
      { name: "Agua 500ml", price: "$2.450" },
      { name: "Gaseosa 600ml", price: "$2.200" },
      { name: "Jugo exprimido", price: "$5.000" },
      { name: "Monster 473ml", price: "$4.370" },
      { name: "Red Bull 250ml", price: "$4.600" },
    ],
  },
];

/* =========================
   TABS VISIBLES (orden fijo)
========================= */
export const MENU_TABS: { id: string; label: string }[] = [
  { id: "cafeteria",     label: "Cafetería" },
  { id: "cafes",         label: "Cafés" },
  { id: "panaderia",     label: "Panadería" },
  { id: "comidas",       label: "Comidas • Combos + bebida" },
  { id: "hamburguesas",  label: "Hamburguesas" },
  { id: "ensaladas",     label: "Ensaladas" },
  { id: "bebidas",       label: "Bebidas frías" },
];

/* =========================
   Posters por sección (opcional para la UI)
========================= */
export const MENU_POSTERS: Record<
  string,
  { posterSrcs: string[]; chunkSize?: number }
> = {
  cafeteria: { posterSrcs: ["/listadocafeteria.png"], chunkSize: 6 },
  cafetriafull: { posterSrcs: ["/productosFull.jpg"], chunkSize: 6 },
  comidas:   { posterSrcs: ["/listadocomida.png"],    chunkSize: 6 },
  hamburguesas: {
    posterSrcs: [
      "/comboshamburguesas.png",
      "/comboshamburguesas2.png",
      "/comboshamburguesas3.png",
    ],
    chunkSize: 3,
  },
  hamburguesapollo: { posterSrcs: ["/comboshamburguesas4.png"], chunkSize: 6 },
  ensaladas: { posterSrcs: ["/ensaladas.png"], chunkSize: 6 },
};
