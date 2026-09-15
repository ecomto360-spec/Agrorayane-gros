import { Category, Product, Order } from '../types';

export const mockCategories: Category[] = [
  { id: 'cat-1', name_fr: 'Phytosanitaire', name_ar: 'الصحة النباتية' },
  { id: 'cat-2', name_fr: 'Semences', name_ar: 'البذور' },
  { id: 'cat-3', name_fr: 'Apiculture', name_ar: 'تربية النحل' },
  { id: 'cat-4', name_fr: 'Élevage', name_ar: 'تربية الحيوانات' },
  { id: 'cat-5', name_fr: 'Matériel', name_ar: 'المعدات' },
  { id: 'cat-6', name_fr: 'Production locale', name_ar: 'الإنتاج المحلي' },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    ref: 'PHY-001',
    title_fr: 'Engrais NPK 15-15-15',
    title_ar: 'سماد NPK 15-15-15',
    description_fr: 'Engrais complet pour toutes vos cultures. Assure une croissance optimale et un rendement élevé. Formule équilibrée en azote, phosphore et potassium.',
    description_ar: 'سماد كامل لجميع محاصيلك. يضمن نموًا مثاليًا وإنتاجية عالية. تركيبة متوازنة من النيتروجين والفوسفور والبوتاسيوم.',
    image_url: 'https://images.unsplash.com/photo-1627920769841-e9402f0676f4?auto=format&fit=crop&w=400&q=80',
    youtube_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    is_available: true,
    price: 3500,
    stock_quantity_mock: 1500,
  },
  {
    id: 'prod-2',
    category_id: 'cat-2',
    ref: 'SEM-001',
    title_fr: 'Graines de Blé Dur',
    title_ar: 'بذور القمح الصلب',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80',
    youtube_url: null,
    is_available: true,
    price: 4200,
    stock_quantity_mock: 500,
  },
  {
    id: 'prod-3',
    category_id: 'cat-1',
    ref: 'PHY-002',
    title_fr: 'Pesticide Bio',
    title_ar: 'مبيد حشري عضوي',
    image_url: 'https://images.unsplash.com/photo-1587334274328-64186a80aebf?auto=format&fit=crop&w=400&q=80',
    youtube_url: null,
    is_available: false,
    price: 1800,
    stock_quantity_mock: 0,
  },
  {
    id: 'prod-4',
    category_id: 'cat-3',
    ref: 'API-001',
    title_fr: 'Ruche en bois complète',
    title_ar: 'خلية نحل خشبية كاملة',
    image_url: 'https://images.unsplash.com/photo-1587049352847-8d4e8941554a?auto=format&fit=crop&w=400&q=80',
    youtube_url: null,
    is_available: true,
    price: 12500,
    stock_quantity_mock: 50,
  },
  {
    id: 'prod-5',
    category_id: 'cat-5',
    ref: 'MAT-001',
    title_fr: 'Système Goutte à Goutte 100m',
    title_ar: 'نظام الري بالتنقيط 100م',
    description_fr: 'Système d\'irrigation complet pour optimiser la consommation d\'eau. Facile à installer et très durable.',
    description_ar: 'نظام ري كامل لتحسين استهلاك المياه. سهل التركيب ومتين للغاية.',
    image_url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=400&q=80',
    youtube_url: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    is_available: true,
    price: 8900,
    stock_quantity_mock: 200,
  },
];

export let mockOrders: Order[] = [
  {
    id: 'ord-1234',
    client_id: 'client-1',
    client_name: 'Ferme Agricole Tizi',
    status: 'PENDING',
    total_amount: 0,
    created_at: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        order_id: 'ord-1234',
        product_id: 'prod-1',
        requested_qty: 200,
        approved_qty: null,
        product: mockProducts[0],
      },
      {
        id: 'item-2',
        order_id: 'ord-1234',
        product_id: 'prod-5',
        requested_qty: 10,
        approved_qty: null,
        product: mockProducts[4],
      }
    ]
  }
];
