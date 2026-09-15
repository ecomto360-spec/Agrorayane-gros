import React, { useState, useEffect } from 'react';
import { Order, Category, Product } from '../types';
import { FileText, Check, AlertTriangle, ArrowRight, Package, Plus, Save, Image as ImageIcon, Video, X, Tag, Upload, Search, User } from 'lucide-react';

export default function BackOffice() {
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'categories' | 'agent'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [corrections, setCorrections] = useState<Record<string, number>>({});

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    ref: '', title_fr: '', title_ar: '', description_fr: '', description_ar: '', category_id: '',
    image_url: '', youtube_url: '', stock_quantity_mock: 0, price: 0
  });
  const [productSearch, setProductSearch] = useState('');

  // Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name_fr: '', name_ar: '' });

  // Agent State
  const [agents, setAgents] = useState<any[]>([]);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [newAgent, setNewAgent] = useState({ name: '', login: '', email: '', role: 'Consultation (Lecture seule)', password: '', active: true });

  const fetchOrders = async () => {
    const res = await fetch('/api/commercial/orders');
    const data = await res.json();
    setOrders(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchCatalogData = async () => {
    const resP = await fetch('/api/commercial/products');
    setProducts(await resP.json());
    const resC = await fetch('/api/commercial/categories');
    setCategories(await resC.json());
  };

  const fetchAgentInfo = async () => {
    const res = await fetch('/api/commercial/agents');
    setAgents(await res.json());
  };

  useEffect(() => {
    if (activeTab === 'catalog' || activeTab === 'categories') {
      fetchCatalogData();
    } else if (activeTab === 'agent') {
      fetchAgentInfo();
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'orders' && orders.length > 0 && !selectedOrder) {
      const firstPending = orders.find(o => o.status === 'PENDING');
      if (firstPending) {
        selectOrder(firstPending);
      }
    }
  }, [orders, activeTab]);

  const selectOrder = (order: Order) => {
    setSelectedOrder(order);
    const initialCorrections: Record<string, number> = {};
    order.items.forEach(item => {
      initialCorrections[item.id] = item.approved_qty !== null ? item.approved_qty : item.requested_qty;
    });
    setCorrections(initialCorrections);
  };

  const handleUpdateQty = (itemId: string, qty: number) => {
    setCorrections(prev => ({ ...prev, [itemId]: qty }));
  };

  const approveOrder = async () => {
    if (!selectedOrder) return;
    const itemsToUpdate = Object.entries(corrections).map(([id, qty]) => ({
      order_item_id: id,
      approved_qty: qty
    }));

    await fetch(`/api/commercial/orders/${selectedOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsToUpdate })
    });
    
    setSelectedOrder(null);
    fetchOrders();
    alert('Commande validée et BL généré !');
  };

  const openAddForm = () => {
    setEditingProductId(null);
    setNewProduct({ ref: '', title_fr: '', title_ar: '', description_fr: '', description_ar: '', category_id: '', image_url: '', youtube_url: '', stock_quantity_mock: 0, price: 0 });
    setIsAddingProduct(true);
  };

  const openEditForm = (p: Product) => {
    setEditingProductId(p.id);
    setNewProduct({
      ref: p.ref,
      title_fr: p.title_fr,
      title_ar: p.title_ar,
      description_fr: p.description_fr || '',
      description_ar: p.description_ar || '',
      category_id: p.category_id,
      image_url: p.image_url || '',
      youtube_url: p.youtube_url || '',
      stock_quantity_mock: p.stock_quantity_mock || 0,
      price: p.price
    });
    setIsAddingProduct(true);
  };

  const deleteProduct = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    
    await fetch(`/api/commercial/products/${id}`, { method: 'DELETE' });
    if (editingProductId === id) {
      setIsAddingProduct(false);
      setEditingProductId(null);
    }
    fetchCatalogData();
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      await fetch(`/api/commercial/products/${editingProductId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      alert('Produit modifié avec succès !');
    } else {
      await fetch('/api/commercial/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      alert('Produit ajouté avec succès !');
    }
    setIsAddingProduct(false);
    setEditingProductId(null);
    setNewProduct({ ref: '', title_fr: '', title_ar: '', description_fr: '', description_ar: '', category_id: '', image_url: '', youtube_url: '', stock_quantity_mock: 0, price: 0 });
    fetchCatalogData();
  };

  const openAddCategoryForm = () => {
    setEditingCategoryId(null);
    setNewCategory({ name_fr: '', name_ar: '' });
    setIsAddingCategory(true);
  };

  const openEditCategoryForm = (c: Category) => {
    setEditingCategoryId(c.id);
    setNewCategory({ name_fr: c.name_fr, name_ar: c.name_ar });
    setIsAddingCategory(true);
  };

  const deleteCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;
    
    await fetch(`/api/commercial/categories/${id}`, { method: 'DELETE' });
    if (editingCategoryId === id) {
      setIsAddingCategory(false);
      setEditingCategoryId(null);
    }
    fetchCatalogData();
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategoryId) {
      await fetch(`/api/commercial/categories/${editingCategoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      alert('Catégorie modifiée avec succès !');
    } else {
      await fetch('/api/commercial/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      alert('Catégorie ajoutée avec succès !');
    }
    setIsAddingCategory(false);
    setEditingCategoryId(null);
    setNewCategory({ name_fr: '', name_ar: '' });
    fetchCatalogData();
  };

  const openAddAgentForm = () => {
    setEditingAgentId(null);
    setNewAgent({ name: '', login: '', email: '', role: 'Consultation (Lecture seule)', password: '', active: true });
    setIsAddingAgent(true);
  };

  const saveAgentInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgentId) {
      await fetch(`/api/commercial/agents/${editingAgentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });
      alert('Utilisateur modifié avec succès !');
    } else {
      await fetch('/api/commercial/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });
      alert('Utilisateur créé avec succès !');
    }
    setIsAddingAgent(false);
    setEditingAgentId(null);
    fetchAgentInfo();
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-slate-900 text-white">
          <div className="flex items-center gap-4">
            <img src="https://www.agrorayane.com/wp-content/uploads/2023/06/icone-agrorayane.png" alt="Agro Rayane" className="w-[108px] h-[108px] object-contain bg-white rounded-xl p-3 shadow-sm" referrerPolicy="no-referrer" />
            <div>
              <p className="text-sm font-semibold text-slate-300">Espace Commercial / Gérant</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col bg-slate-100 border-b border-gray-200">
          <div className="flex p-2 gap-1 border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${activeTab === 'orders' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Commandes
            </button>
            <button 
              onClick={() => setActiveTab('catalog')} 
              className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${activeTab === 'catalog' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Catalogue
            </button>
            <button 
              onClick={() => setActiveTab('categories')} 
              className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${activeTab === 'categories' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Catégories
            </button>
          </div>
          <div className="flex p-2">
            <button 
              onClick={() => setActiveTab('agent')} 
              className={`flex-1 py-2 text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 ${activeTab === 'agent' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User size={16} /> Utilisateurs
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'orders' ? (
            <>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Demandes en attente</h2>
              {orders.filter(o => o.status === 'PENDING').map(order => (
                <button 
                  key={order.id}
                  onClick={() => selectOrder(order)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800">{order.client_name}</span>
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md font-medium">PENDING</span>
                  </div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>Ref: {order.id}</span>
                    <span>{order.items.length} articles</span>
                  </div>
                </button>
              ))}

              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8">Traitées (Approuvées)</h2>
              {orders.filter(o => o.status === 'APPROVED').map(order => (
                <div key={order.id} className="w-full text-left p-4 rounded-xl border border-gray-200 bg-gray-50 opacity-70">
                   <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800">{order.client_name}</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium">APPROVED</span>
                  </div>
                  <div className="text-sm text-gray-500">Ref: {order.id}</div>
                </div>
              ))}
            </>
          ) : activeTab === 'catalog' ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Produits Actifs ({products.length})</h2>
                <button 
                  onClick={openAddForm}
                  className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 rounded text-sm font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus size={16} /> Nouveau
                </button>
              </div>
              <div className="mb-4 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {products.filter(p => p.title_fr.toLowerCase().includes(productSearch.toLowerCase()) || p.ref.toLowerCase().includes(productSearch.toLowerCase()) || p.title_ar.includes(productSearch)).map(product => (
                <div 
                  key={product.id} 
                  onClick={() => openEditForm(product)}
                  className={`bg-white p-3 rounded-xl shadow-sm border ${editingProductId === product.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-100'} flex gap-3 items-center cursor-pointer hover:border-emerald-300 transition-all`}
                >
                  <img src={product.image_url!} className="w-12 h-12 object-cover rounded border" alt="" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{product.title_fr}</p>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>{product.ref} - <span className="font-bold text-emerald-600">{product.price.toLocaleString('fr-FR')} DA</span></span>
                      <span className={product.stock_quantity_mock! > 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                        Stock: {product.stock_quantity_mock}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteProduct(e, product.id)} 
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Supprimer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </>
          ) : activeTab === 'categories' ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Catégories ({categories.length})</h2>
                <button 
                  onClick={openAddCategoryForm}
                  className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded text-sm font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus size={16} /> Nouvelle
                </button>
              </div>
              {categories.map(category => (
                <div 
                  key={category.id} 
                  onClick={() => openEditCategoryForm(category)}
                  className={`bg-white p-3 rounded-xl shadow-sm border ${editingCategoryId === category.id ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-100'} flex justify-between items-center cursor-pointer hover:border-purple-300 transition-all`}
                >
                  <div>
                    <p className="text-sm font-bold text-gray-800">{category.name_fr}</p>
                    <p className="text-xs text-gray-500 mt-1" dir="rtl">{category.name_ar}</p>
                  </div>
                  <button 
                    onClick={(e) => deleteCategory(e, category.id)} 
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Supprimer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </>
          ) : activeTab === 'agent' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
               <User className="w-16 h-16 opacity-20" />
               <p className="text-sm font-medium">Gestion des utilisateurs et rôles commerciaux</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Main Area */}
      <div className="w-2/3 bg-gray-50 flex flex-col">
        {activeTab === 'orders' ? (
          selectedOrder ? (
            <>
              <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Validation de la commande</h2>
                  <p className="text-gray-500">Client: {selectedOrder.client_name} | Ref: {selectedOrder.id}</p>
                </div>
                <div className="flex gap-3">
                   <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                      <FileText className="w-4 h-4" />
                      Voir PDF Brouillon
                   </button>
                   <button onClick={approveOrder} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-md">
                      <Check className="w-4 h-4" />
                      Valider & Générer BL
                   </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 border-b border-gray-200 font-semibold text-gray-600 text-sm">
                    <div className="col-span-5">Produit</div>
                    <div className="col-span-2 text-center text-amber-700 bg-amber-50 rounded py-1">Demande Client</div>
                    <div className="col-span-2 text-center text-slate-500">Stock Réel</div>
                    <div className="col-span-3 text-center text-blue-700 bg-blue-50 rounded py-1">Correction Commercial</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-gray-100">
                    {selectedOrder.items.map(item => {
                      const req = item.requested_qty;
                      const stock = item.product?.stock_quantity_mock || 0;
                      const approved = corrections[item.id] ?? req;
                      const isShortage = stock < req;

                      return (
                        <div key={item.id} className={`grid grid-cols-12 gap-4 p-4 items-center ${isShortage ? 'bg-red-50/30' : ''}`}>
                          <div className="col-span-5 flex items-center gap-3">
                            <img src={item.product?.image_url!} className="w-12 h-12 rounded object-cover border border-gray-200" alt="" />
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{item.product?.title_fr}</p>
                              <p className="text-xs text-gray-500">{item.product?.ref}</p>
                            </div>
                          </div>
                          
                          <div className="col-span-2 text-center font-bold text-lg text-gray-700">
                            {req}
                          </div>
                          
                          <div className="col-span-2 flex flex-col items-center justify-center">
                            <span className={`text-sm font-bold ${stock === 0 ? 'text-red-500' : (stock < req ? 'text-orange-500' : 'text-green-600')}`}>
                              {stock}
                            </span>
                            {isShortage && <AlertTriangle className="w-4 h-4 text-orange-500 mt-1" />}
                          </div>
                          
                          <div className="col-span-3 flex items-center justify-center gap-3">
                            <ArrowRight className="w-4 h-4 text-gray-300" />
                            <div className="relative">
                              <input 
                                type="number"
                                min="0"
                                value={approved}
                                onChange={(e) => handleUpdateQty(item.id, parseInt(e.target.value) || 0)}
                                className={`w-24 text-center text-lg font-bold border-2 rounded-lg py-2 focus:outline-none focus:ring-2 ${
                                  approved !== req ? 'border-blue-400 bg-blue-50 text-blue-700 focus:ring-blue-200' : 'border-gray-200 bg-gray-50 focus:border-blue-400'
                                }`}
                              />
                              {approved !== req && (
                                <span className="absolute -top-2 -right-2 bg-blue-100 text-blue-700 text-[10px] px-1.5 rounded font-bold border border-blue-200">Modifié</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
               <FileText className="w-16 h-16 opacity-20" />
               <p className="text-lg font-medium">Sélectionnez une commande à valider</p>
            </div>
          )
        ) : activeTab === 'catalog' ? (
          isAddingProduct ? (
            <>
              <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{editingProductId ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
                  <p className="text-gray-500">{editingProductId ? 'Mettez à jour les informations de ce produit' : 'Enrichissez le catalogue avec un nouvel article'}</p>
                </div>
                <button onClick={() => { setIsAddingProduct(false); setEditingProductId(null); }} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <form onSubmit={saveProduct} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8 max-w-4xl mx-auto">
                  
                  {/* Title Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Titre (Français)</label>
                      <input required value={newProduct.title_fr} onChange={e => setNewProduct({...newProduct, title_fr: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Ex: Engrais NPK 15-15-15..." />
                    </div>
                    <div dir="rtl">
                      <label className="block text-sm font-bold text-gray-700 mb-2 text-right">Titre (Arabe)</label>
                      <input required value={newProduct.title_ar} onChange={e => setNewProduct({...newProduct, title_ar: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Ex: سماد NPK..." />
                    </div>
                  </div>

                  {/* Description Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description (Français) <span className="font-normal text-gray-400 text-xs">- Optionnel</span></label>
                      <textarea value={newProduct.description_fr} onChange={e => setNewProduct({...newProduct, description_fr: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none min-h-[100px]" placeholder="Description détaillée..." />
                    </div>
                    <div dir="rtl">
                      <label className="block text-sm font-bold text-gray-700 mb-2 text-right">Description (Arabe) <span className="font-normal text-gray-400 text-xs">- Optionnel</span></label>
                      <textarea value={newProduct.description_ar} onChange={e => setNewProduct({...newProduct, description_ar: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none min-h-[100px]" placeholder="وصف تفصيلي..." />
                    </div>
                  </div>

                  {/* Metadatas */}
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Tag size={16}/> Référence SKU</label>
                      <input required value={newProduct.ref} onChange={e => setNewProduct({...newProduct, ref: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Ex: PHY-001" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Package size={16}/> Catégorie</label>
                      <select required value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                        <option value="">Sélectionner...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name_fr} - {c.name_ar}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Prix (DA)</label>
                      <input required type="number" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-bold text-lg text-emerald-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Stock Initial</label>
                      <input required type="number" min="0" value={newProduct.stock_quantity_mock} onChange={e => setNewProduct({...newProduct, stock_quantity_mock: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-bold text-lg" />
                    </div>
                  </div>

                  {/* Media */}
                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><ImageIcon size={16}/> Image du produit</label>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <input required value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="URL de l'image (https://...)" />
                          <span className="text-sm font-bold text-gray-400">OU</span>
                          <label htmlFor="image-upload" className="cursor-pointer bg-white hover:bg-gray-50 text-emerald-700 px-4 py-3 rounded-lg font-bold border border-emerald-300 transition-colors flex items-center gap-2">
                            <Upload size={18} />
                            Uploader
                          </label>
                          <input type="file" accept="image/*" id="image-upload" className="hidden" onChange={handleImageUpload} />
                        </div>
                      </div>
                      {newProduct.image_url && (
                        <div className="mt-4 border-2 border-dashed border-emerald-200 rounded-lg p-2 bg-white flex justify-center">
                          <img src={newProduct.image_url} className="h-32 rounded object-cover" alt="Preview" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Video size={16}/> Lien YouTube (Optionnel)</label>
                      <input value={newProduct.youtube_url} onChange={e => setNewProduct({...newProduct, youtube_url: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="https://youtube.com/..." />
                      <p className="text-xs text-gray-500 mt-2">Le lien de la vidéo sera intégré directement sur la fiche produit du client.</p>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
                      <Save size={20} /> {editingProductId ? 'Enregistrer les modifications' : 'Publier le produit'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
               <Package className="w-16 h-16 opacity-20" />
               <p className="text-lg font-medium">Sélectionnez un produit ou ajoutez-en un nouveau</p>
            </div>
          )
        ) : activeTab === 'categories' ? (
          isAddingCategory ? (
            <>
              <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{editingCategoryId ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h2>
                  <p className="text-gray-500">{editingCategoryId ? 'Mettez à jour le nom de cette catégorie' : 'Créez une nouvelle catégorie pour organiser vos produits'}</p>
                </div>
                <button onClick={() => { setIsAddingCategory(false); setEditingCategoryId(null); }} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <form onSubmit={saveCategory} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8 max-w-4xl mx-auto">
                  
                  {/* Title Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nom (Français)</label>
                      <input required value={newCategory.name_fr} onChange={e => setNewCategory({...newCategory, name_fr: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" placeholder="Ex: Matériel agricole..." />
                    </div>
                    <div dir="rtl">
                      <label className="block text-sm font-bold text-gray-700 mb-2 text-right">Nom (Arabe)</label>
                      <input required value={newCategory.name_ar} onChange={e => setNewCategory({...newCategory, name_ar: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" placeholder="Ex: معدات زراعية..." />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
                      <Save size={20} /> {editingCategoryId ? 'Enregistrer les modifications' : 'Créer la catégorie'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
               <Package className="w-16 h-16 opacity-20" />
               <p className="text-lg font-medium">Sélectionnez une catégorie ou créez-en une nouvelle</p>
            </div>
          )
        ) : activeTab === 'agent' ? (
          <div className="p-8 h-full bg-slate-50/50 flex flex-col">
            {isAddingAgent ? (
              <div className="flex-1 overflow-y-auto">
                 <div className="flex items-center gap-4 mb-6 cursor-pointer" onClick={() => setIsAddingAgent(false)}>
                   <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
                   <div>
                     <h2 className="text-2xl font-bold text-slate-800">Nouvel Utilisateur</h2>
                     <p className="text-sm text-slate-500">Créer un compte d'accès avec email et mot de passe</p>
                   </div>
                 </div>

                 <form onSubmit={saveAgentInfo} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6">Informations Générales</h3>
                    <div className="grid grid-cols-2 gap-8 mb-10">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nom & Prénom</label>
                        <input required value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="ex: Ahmed Benali" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Identifiant unique (Login) *</label>
                        <input required value={newAgent.login} onChange={e => setNewAgent({...newAgent, login: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="ex: abenali" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Adresse Email de connexion *</label>
                        <input type="email" required value={newAgent.email} onChange={e => setNewAgent({...newAgent, email: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="ex: abenali@carisoft.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Rôle attribué *</label>
                        <select required value={newAgent.role} onChange={e => setNewAgent({...newAgent, role: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
                          <option>Consultation (Lecture seule)</option>
                          <option>Commercial</option>
                          <option>Administrateur</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8 mb-8">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6">Sécurité & Mot de passe</h3>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mot de passe initial *</label>
                          <div className="relative">
                            <input type="password" required value={newAgent.password} onChange={e => setNewAgent({...newAgent, password: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="Saisir le mot de passe" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
                          <input type="password" required className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="Ressaisir le mot de passe" />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 mb-8 flex items-start gap-3">
                      <input type="checkbox" id="active" checked={newAgent.active} onChange={e => setNewAgent({...newAgent, active: e.target.checked})} className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      <div>
                        <label htmlFor="active" className="block text-sm font-bold text-slate-800">Compte Actif</label>
                        <p className="text-xs text-slate-500">Autorise cet utilisateur à se connecter à la plateforme</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                      <button type="button" onClick={() => setIsAddingAgent(false)} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                        Annuler
                      </button>
                      <button type="submit" className="bg-[#1a56db] hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm flex items-center gap-2 transition-colors">
                        <Save size={18} /> Créer le compte
                      </button>
                    </div>
                 </form>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestion des Utilisateurs & Rôles</h2>
                    <p className="text-sm text-slate-500 mt-1">Contrôle des accès, identifiants, emails et mots de passe</p>
                  </div>
                  <button onClick={openAddAgentForm} className="bg-[#1a56db] hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                    <Plus size={18} /> Nouvel Utilisateur
                  </button>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4">Utilisateur & Identifiant</div>
                    <div className="col-span-3">Email de connexion</div>
                    <div className="col-span-2">Rôle</div>
                    <div className="col-span-2">Statut</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {agents.length > 0 ? agents.map(agent => (
                      <div key={agent.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                        <div className="col-span-4">
                          <p className="font-bold text-sm text-slate-800">{agent.name}</p>
                          <p className="text-xs text-slate-500">{agent.login}</p>
                        </div>
                        <div className="col-span-3 text-sm text-slate-600">{agent.email}</div>
                        <div className="col-span-2 text-sm text-slate-600">{agent.role}</div>
                        <div className="col-span-2">
                           <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${agent.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                             {agent.active ? 'Actif' : 'Inactif'}
                           </span>
                        </div>
                        <div className="col-span-1 text-right">
                           {/* Actions go here */}
                        </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center text-slate-400 text-sm">
                        Aucun utilisateur enregistré
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
