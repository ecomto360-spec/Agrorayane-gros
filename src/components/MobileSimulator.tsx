import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Product, Category } from '../types';
import { ShoppingCart, Search, CheckCircle2, XCircle, Menu, X, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function MobileSimulator() {
  const { lang, setLang, t, isRtl } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.append('categoryId', activeCategory);
    if (search) params.append('search', search);
    fetch(`/api/products?${params.toString()}`).then(res => res.json()).then(setProducts);
  }, [activeCategory, search]);

  const addToCart = (product: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, { product, qty }];
    });
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;
    const items = cart.map(c => ({ product_id: c.product.id, requested_qty: c.qty }));
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, client_id: 'client-1' })
    });
    setCart([]);
    setShowCart(false);
    alert(t('order_success'));
  };

  return (
    <div className="flex justify-center items-center h-full min-h-[800px] bg-slate-900 py-10">
      {/* Phone Mockup Container */}
      <div className="w-[400px] h-[800px] bg-slate-50 rounded-[3rem] shadow-2xl border-[14px] border-slate-800 overflow-hidden relative flex flex-col font-sans">
        
        {/* Header */}
        <header className="bg-emerald-700 text-white px-3 py-4 pt-10 shadow-md z-10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Menu className="w-6 h-6 flex-shrink-0 cursor-pointer" onClick={() => setIsMenuOpen(true)} />
            <img 
              src="https://www.agrorayane.com/wp-content/uploads/2023/06/icone-agrorayane.png" 
              alt="Agro Rayane" 
              className="w-16 h-16 object-contain bg-white rounded-full p-1 shadow-sm flex-shrink-0 cursor-pointer" 
              referrerPolicy="no-referrer" 
              onClick={() => setShowCart(false)}
            />
            
            <div className="flex-1 relative">
              <Search className={cn("w-4 h-4 absolute top-2.5 text-emerald-300", isRtl ? "right-2.5" : "left-2.5")} />
              <input 
                type="text" 
                placeholder={t('search')} 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={cn("w-full bg-emerald-800/50 text-xs text-white placeholder-emerald-300 rounded-lg py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors", isRtl ? "pr-8 pl-2" : "pl-8 pr-2")}
              />
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} className="text-[10px] font-bold uppercase bg-emerald-800 px-1.5 py-1 rounded">
                {lang === 'fr' ? 'AR' : 'FR'}
              </button>
              <button className="relative ml-1" onClick={() => setShowCart(true)}>
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Sidebar Drawer Overlay */}
        {isMenuOpen && (
          <div className="absolute inset-0 z-50 flex" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Overlay backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Drawer */}
            <div className="relative w-3/4 max-w-[280px] h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
              <div className="p-4 pb-6 border-b border-emerald-800 flex items-center justify-between bg-emerald-700 text-white pt-10">
                <h2 className="font-bold text-lg">{lang === 'fr' ? 'Catégories' : 'فئات'}</h2>
                <X className="w-6 h-6 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                <button 
                  onClick={() => { setActiveCategory(''); setIsMenuOpen(false); }}
                  className={cn("text-left px-4 py-3 rounded-xl font-bold transition-colors", activeCategory === '' ? "bg-emerald-100 text-emerald-800" : "text-gray-700 hover:bg-gray-100")}
                >
                  {t('all_categories')}
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setIsMenuOpen(false); }}
                    className={cn("text-left px-4 py-3 rounded-xl font-bold transition-colors", activeCategory === cat.id ? "bg-emerald-100 text-emerald-800" : "text-gray-700 hover:bg-gray-100")}
                  >
                    {lang === 'fr' ? cat.name_fr : cat.name_ar}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {showCart ? (
          <div className="flex-1 bg-gray-50 flex flex-col relative overflow-hidden">
             <div className="p-4 bg-white shadow-sm flex items-center gap-3">
                <button onClick={() => setShowCart(false)} className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeft className={cn("w-6 h-6", isRtl ? "rotate-180" : "")} />
                </button>
                <h2 className="text-xl font-bold text-gray-800 flex-1">{t('cart')}</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-500 text-sm font-medium">{t('catalog')}</button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {cart.map((item, idx) => (
                 <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3">
                    <img src={item.product.image_url!} className="w-16 h-16 object-cover rounded-lg" alt="" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{lang === 'fr' ? item.product.title_fr : item.product.title_ar}</p>
                      <p className="text-xs text-gray-500">{item.product.ref}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{t('qty')}: {item.qty}</span>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
             <div className="p-4 bg-white border-t border-gray-100">
               <button onClick={submitOrder} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors">
                 {t('request_order')}
               </button>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 auto-rows-max pb-8">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                  <div className="h-28 w-full relative shrink-0 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.image_url!} alt={product.title_fr} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {product.is_available ? (
                        <span className="bg-green-100/90 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center backdrop-blur-sm">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> {t('available')}
                        </span>
                      ) : (
                        <span className="bg-red-100/90 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center backdrop-blur-sm">
                          <XCircle className="w-2.5 h-2.5 mr-0.5" /> {t('unavailable')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="mb-2">
                      <p className="text-[10px] font-medium text-gray-400 mb-0.5">{product.ref}</p>
                      <h3 className="font-bold text-gray-800 text-xs line-clamp-2 leading-tight">
                        {lang === 'fr' ? product.title_fr : product.title_ar}
                      </h3>
                    </div>
                    
                    <div className="mt-auto flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold text-emerald-600 text-[13px] whitespace-nowrap">
                          {product.price.toLocaleString('fr-FR')} DA
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-bold text-gray-400">{t('qty')}</span>
                          <input 
                            type="number" 
                            min="1"
                            defaultValue="1"
                            className="w-10 text-xs border border-gray-200 rounded-md px-1 py-1 text-center bg-gray-50 outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                            id={`qty-${product.id}`}
                            disabled={!product.is_available}
                          />
                        </div>
                      </div>
                      <button 
                        disabled={!product.is_available}
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = document.getElementById(`qty-${product.id}`) as HTMLInputElement;
                          if (el) addToCart(product, parseInt(el.value));
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-lg transition-colors mt-1"
                      >
                        {t('add_to_cart')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {selectedProduct && (
          <div className={cn("absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300", isRtl ? "text-right" : "text-left")}>
            <header className="p-4 bg-white flex items-center gap-3 border-b border-gray-100 shadow-sm z-10 shrink-0">
               <button onClick={() => setSelectedProduct(null)} className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                 <ArrowLeft className={cn("w-6 h-6", isRtl ? "rotate-180" : "")} />
               </button>
               <h2 className="text-lg font-bold text-gray-800 flex-1 truncate">
                 {lang === 'fr' ? selectedProduct.title_fr : selectedProduct.title_ar}
               </h2>
            </header>
            
            <div className="flex-1 overflow-y-auto pb-24">
               {selectedProduct.image_url && (
                 <div className="w-full h-64 bg-gray-50 border-b border-gray-100">
                   <img src={selectedProduct.image_url} alt={selectedProduct.title_fr} className="w-full h-full object-contain" />
                 </div>
               )}
               <div className="p-5">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <p className="text-xs font-bold text-gray-400 mb-1">{selectedProduct.ref}</p>
                     <h1 className="text-xl font-bold text-gray-900 leading-tight">
                       {lang === 'fr' ? selectedProduct.title_fr : selectedProduct.title_ar}
                     </h1>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-3 mt-3 mb-6">
                   <div className="text-2xl font-black text-emerald-600">{selectedProduct.price.toLocaleString('fr-FR')} DA</div>
                   <div>
                      {selectedProduct.is_available ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-bold flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {t('available')}
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md font-bold flex items-center">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> {t('unavailable')}
                        </span>
                      )}
                   </div>
                 </div>
                 
                 {((lang === 'fr' && selectedProduct.description_fr) || (lang === 'ar' && selectedProduct.description_ar)) && (
                   <div className="mb-6">
                     <h3 className="font-bold text-gray-800 mb-2">{lang === 'fr' ? 'Description' : 'الوصف'}</h3>
                     <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                       {lang === 'fr' ? selectedProduct.description_fr : selectedProduct.description_ar}
                     </p>
                   </div>
                 )}
                 
                 {selectedProduct.youtube_url && (
                   <div className="mb-6">
                     <h3 className="font-bold text-gray-800 mb-3">{lang === 'fr' ? 'Vidéo de démonstration' : 'فيديو توضيحي'}</h3>
                     <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-gray-200" style={{ paddingTop: '56.25%' }}>
                       <iframe 
                         src={selectedProduct.youtube_url} 
                         className="absolute top-0 left-0 w-full h-full"
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                         allowFullScreen
                       ></iframe>
                     </div>
                   </div>
                 )}
               </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center gap-4 shrink-0">
               <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                 <span className="text-xs font-bold text-gray-500">{t('qty')}</span>
                 <input 
                   type="number" 
                   min="1"
                   defaultValue="1"
                   className="w-12 text-base font-bold bg-transparent outline-none text-center disabled:opacity-50"
                   id={`modal-qty-${selectedProduct.id}`}
                   disabled={!selectedProduct.is_available}
                 />
               </div>
               <button 
                 disabled={!selectedProduct.is_available}
                 onClick={() => {
                   const el = document.getElementById(`modal-qty-${selectedProduct.id}`) as HTMLInputElement;
                   if (el) {
                     addToCart(selectedProduct, parseInt(el.value));
                     setSelectedProduct(null);
                   }
                 }}
                 className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
               >
                 <ShoppingCart className="w-5 h-5" />
                 {t('add_to_cart')}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
