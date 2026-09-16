import React, { useState, useEffect } from 'react';
import { Order, Category, Product } from '../types';
import { FileText, Check, AlertTriangle, ArrowRight, Package, Plus, Save, Image as ImageIcon, Video, X, Tag, Upload, Search, User, Eye, ShoppingBag, Trash2, ArrowLeft, MoreHorizontal, Pencil, HelpCircle, Database, Download } from 'lucide-react';

export default function BackOffice() {
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'categories' | 'agent' | 'backup'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [corrections, setCorrections] = useState<Record<string, number>>({});
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'approved' | 'cancelled' | 'trash'>('all');

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
    // Removed auto-selection of orders to allow the list view to render by default
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
    
    // Optimistic UI update
    setProducts(prev => prev.filter(p => p.id !== id));
    
    if (editingProductId === id) {
      setIsAddingProduct(false);
      setEditingProductId(null);
    }

    try {
      await fetch(`/api/commercial/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
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
    
    // Optimistic UI update
    setCategories(prev => prev.filter(c => c.id !== id));
    
    if (editingCategoryId === id) {
      setIsAddingCategory(false);
      setEditingCategoryId(null);
    }
    
    try {
      await fetch(`/api/commercial/categories/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        const res = await fetch(`/api/commercial/categories/${editingCategoryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCategory)
        });
        if (!res.ok) throw new Error("Erreur lors de la modification");
        alert('Catégorie modifiée avec succès !');
      } else {
        const res = await fetch('/api/commercial/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCategory)
        });
        if (!res.ok) throw new Error("Erreur lors de l'ajout (Vérifiez la connexion au serveur)");
        alert('Catégorie ajoutée avec succès !');
      }
      setIsAddingCategory(false);
      setEditingCategoryId(null);
      setNewCategory({ name_fr: '', name_ar: '' });
      fetchCatalogData();
    } catch (err: any) {
      alert(err.message);
    }
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

  const handleExport = () => {
    try {
      const backupData = {
        products,
        categories,
        orders,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_agrorayane_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erreur lors de l'exportation des données.");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (!window.confirm("Attention : L'importation peut écraser ou créer des doublons. Voulez-vous continuer ?")) {
           if (e.target) e.target.value = '';
           return;
        }

        alert(`Données lues : ${data.products?.length || 0} produits, ${data.categories?.length || 0} catégories, ${data.orders?.length || 0} commandes.\n\nNote: L'enregistrement réel en base via import massif nécessite une route API spécifique non disponible actuellement. Ceci est une simulation.`);
        
        // Simulation frontend pour voir les données
        if (data.products) setProducts(data.products);
        if (data.categories) setCategories(data.categories);
        if (data.orders) setOrders(data.orders);
        
      } catch (err) {
        alert("Erreur : Le fichier JSON est invalide ou corrompu.");
      }
      if (e.target) e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-[280px] shrink-0 border-r border-gray-200 bg-white flex flex-col">
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
          <div className="flex p-2 gap-1 border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('agent')} 
              className={`flex-1 py-2 text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 ${activeTab === 'agent' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User size={16} /> Utilisateurs
            </button>
            <button 
              onClick={() => setActiveTab('backup')} 
              className={`flex-1 py-2 text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 ${activeTab === 'backup' ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Database size={16} /> Sauvegarde
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'orders' ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
               <ShoppingBag className="w-16 h-16 opacity-20" />
               <p className="text-sm font-medium">Gestion globale des commandes</p>
            </div>
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
      <div className="flex-1 bg-gray-50 flex flex-col min-w-0">
        {activeTab === 'orders' ? (
          selectedOrder ? (
            <>
              <div className="flex-1 flex flex-col bg-[#f0f0f1] overflow-y-auto p-4 sm:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                   <button onClick={() => setSelectedOrder(null)} className="text-[#a7aaad] hover:text-[#2271b1] transition-colors" title="Retour">
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                   <h1 className="text-[22px] font-normal text-[#1d2327]">Modifier commande</h1>
                   <button className="px-3 py-1 text-[13px] text-[#2271b1] border border-[#2271b1] rounded hover:bg-[#f6f7f7] bg-white transition-colors">Ajouter une commande</button>
                </div>

                {/* Main Card */}
                <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm">
                   {/* Card Title */}
                   <div className="p-5 border-b border-[#c3c4c7]">
                      <h2 className="text-[18px] font-semibold text-[#1d2327] mb-1">Commande n° {selectedOrder.id.split('-')[1] || selectedOrder.id}</h2>
                      <p className="text-[13px] text-[#646970]">Paiement par Paiement à la livraison. Payé le 14 septembre 2026 à 4:40 am. Adresse IP du client : 41.100.171.43</p>
                   </div>

                   {/* 3 Columns Section */}
                   <div className="grid grid-cols-1 md:grid-cols-3 p-5 gap-8 border-b border-[#c3c4c7]">
                      {/* Col 1: Général */}
                      <div>
                         <h3 className="font-semibold text-[#1d2327] text-[14px] mb-4">Général</h3>
                         
                         <div className="mb-4">
                            <label className="block text-[13px] text-[#1d2327] font-semibold mb-1">Date de création</label>
                            <div className="flex gap-2 items-center">
                               <input type="date" className="border border-[#8c8f94] rounded-sm px-2 py-1 text-[13px] w-32 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" defaultValue="2026-09-14" />
                               <input type="text" className="border border-[#8c8f94] rounded-sm px-2 py-1 text-[13px] w-12 text-center focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" defaultValue="04" />
                               <span>:</span>
                               <input type="text" className="border border-[#8c8f94] rounded-sm px-2 py-1 text-[13px] w-12 text-center focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" defaultValue="40" />
                            </div>
                         </div>

                         <div className="mb-4">
                            <label className="block text-[13px] text-[#1d2327] font-semibold mb-1">État</label>
                            <select 
                              className="w-full border border-[#8c8f94] rounded-sm px-2 py-1.5 text-[13px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                              value={selectedOrder.status === 'PENDING' ? 'en_cours' : (selectedOrder.status === 'APPROVED' ? 'terminee' : 'annulee')}
                              onChange={(e) => {
                                 const val = e.target.value;
                                 let newStatus: 'PENDING' | 'APPROVED' | 'CANCELLED' = 'PENDING';
                                 if (val === 'terminee') newStatus = 'APPROVED';
                                 if (val === 'annulee') newStatus = 'CANCELLED';
                                 
                                 // Optimistic UI update
                                 setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
                                 setSelectedOrder({...selectedOrder, status: newStatus});
                                 
                                 // Need a real endpoint to just update status in a real app, 
                                 // but here we reuse approveOrder logic if we switch to terminee
                                 if (newStatus === 'APPROVED') {
                                    approveOrder();
                                 }
                              }}
                            >
                               <option value="attente_paiement">Attente paiement</option>
                               <option value="en_cours">En cours</option>
                               <option value="en_attente">En attente</option>
                               <option value="terminee">Terminée</option>
                               <option value="annulee">Annulée</option>
                               <option value="remboursee">Remboursée</option>
                            </select>
                         </div>

                         <div>
                            <label className="block text-[13px] text-[#1d2327] font-semibold mb-1">Client</label>
                            <select 
                               defaultValue={selectedOrder.client_name}
                               className="w-full border border-[#8c8f94] rounded-sm px-2 py-1.5 text-[13px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                            >
                               <option value="Invité">Invité</option>
                               <option value={selectedOrder.client_name}>{selectedOrder.client_name}</option>
                            </select>
                         </div>
                      </div>

                      {/* Col 2: Facturation */}
                      <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-[#1d2327] text-[14px]">Facturation</h3>
                            <button className="text-[#a7aaad] hover:text-[#2271b1]"><Pencil className="w-3.5 h-3.5" /></button>
                         </div>
                         <div className="text-[13px] text-[#3c434a] leading-relaxed mb-4">
                            {selectedOrder.client_name}<br/>
                            Pharmacie de garde<br/>
                            Sidi Bel Abbes<br/>
                            22
                         </div>
                         
                         <div className="mb-2">
                            <span className="font-semibold text-[#1d2327] text-[13px]">Adresse e-mail:</span><br/>
                            <span className="text-[13px] text-[#3c434a]">Aucune adresse e-mail définie.</span>
                         </div>
                         
                         <div>
                            <span className="font-semibold text-[#1d2327] text-[13px]">Téléphone:</span><br/>
                            <a href="#" className="text-[13px] text-[#2271b1] hover:underline">0658405604</a>
                         </div>
                      </div>

                      {/* Col 3: Expédition */}
                      <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-[#1d2327] text-[14px]">Expédition</h3>
                            <button className="text-[#a7aaad] hover:text-[#2271b1]"><Pencil className="w-3.5 h-3.5" /></button>
                         </div>
                         <div className="text-[13px] text-[#3c434a]">
                            Aucune adresse de livraison.
                         </div>
                      </div>
                   </div>

                   {/* Items Table Section */}
                   <div className="p-0 border-b border-[#c3c4c7]">
                      <table className="w-full text-left text-[13px]">
                         <thead className="bg-[#f6f7f7] text-[#1d2327] font-semibold border-b border-[#c3c4c7]">
                            <tr>
                               <th className="py-2 px-4 w-16">Article</th>
                               <th className="py-2 px-4"></th>
                               <th className="py-2 px-4 text-right w-32">Prix</th>
                               <th className="py-2 px-4 text-center w-20">Qté</th>
                               <th className="py-2 px-4 text-right w-32">Total</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-[#f0f0f1]">
                            {selectedOrder.items.map(item => (
                               <tr key={item.id} className="hover:bg-[#f6f7f7]">
                                  <td className="py-3 px-4">
                                     <div className="w-10 h-10 border border-[#e2e4e7] p-0.5 bg-white flex items-center justify-center">
                                        <img src={item.product?.image_url} alt="" className="max-w-full max-h-full object-contain" />
                                     </div>
                                  </td>
                                  <td className="py-3 px-4 text-[#2271b1] hover:underline cursor-pointer">
                                     {item.product?.title_fr}
                                  </td>
                                  <td className="py-3 px-4 text-right text-[#3c434a]">
                                     {item.product?.price.toLocaleString('fr-FR')} د.ج
                                  </td>
                                  <td className="py-3 px-4 text-center text-[#3c434a]">
                                     × {item.requested_qty}
                                  </td>
                                  <td className="py-3 px-4 text-right text-[#3c434a]">
                                     {(item.product?.price! * item.requested_qty).toLocaleString('fr-FR')} د.ج
                                  </td>
                               </tr>
                            ))}
                            
                            {/* Shipping Row Mock */}
                            <tr className="hover:bg-[#f6f7f7]">
                               <td className="py-3 px-4 text-center text-[#a7aaad] text-lg">
                                  🚚
                               </td>
                               <td className="py-3 px-4 text-[#3c434a]">
                                  Yalidine Livraison a la maison
                               </td>
                               <td className="py-3 px-4 text-right text-[#3c434a]"></td>
                               <td className="py-3 px-4 text-center text-[#3c434a]"></td>
                               <td className="py-3 px-4 text-right text-[#3c434a]">
                                  850,00 د.ج
                               </td>
                            </tr>
                         </tbody>
                      </table>
                   </div>

                   {/* Totals Section */}
                   <div className="p-5 flex justify-end">
                      <div className="w-full max-w-[300px]">
                         <div className="flex justify-between items-center mb-2 text-[13px]">
                            <span className="text-[#646970] text-right w-full pr-4">Sous-total des articles :</span>
                            <span className="text-[#1d2327] font-semibold whitespace-nowrap">{selectedOrder.total_amount?.toLocaleString('fr-FR') || 0} د.ج</span>
                         </div>
                         <div className="flex justify-between items-center mb-2 text-[13px]">
                            <span className="text-[#646970] text-right w-full pr-4">Expédition :</span>
                            <span className="text-[#1d2327] font-semibold whitespace-nowrap">850,00 د.ج</span>
                         </div>
                         <div className="flex justify-between items-center mb-4 text-[13px]">
                            <span className="text-[#646970] text-right w-full pr-4">Total de la commande :</span>
                            <span className="text-[#1d2327] font-bold whitespace-nowrap">{((selectedOrder.total_amount || 0) + 850).toLocaleString('fr-FR')} د.ج</span>
                         </div>
                         
                         <div className="border-t border-[#c3c4c7] pt-4 flex justify-between items-center text-[13px]">
                            <span className="text-[#646970] text-right w-full pr-4 font-semibold">Payé :</span>
                            <span className="text-[#1d2327] font-bold whitespace-nowrap">{((selectedOrder.total_amount || 0) + 850).toLocaleString('fr-FR')} د.ج</span>
                         </div>
                         <div className="text-right text-[11px] text-[#646970] mt-1">
                            septembre 14, 2026
                         </div>
                      </div>
                   </div>

                   {/* Footer */}
                   <div className="p-4 bg-[#f6f7f7] border-t border-[#c3c4c7] flex justify-between items-center rounded-b-sm">
                      <button className="px-3 py-1.5 text-[13px] text-[#2271b1] border border-[#2271b1] bg-white rounded-sm hover:bg-[#f0f0f1] transition-colors">
                         Remboursement
                      </button>
                      <div className="text-[13px] text-[#646970] flex items-center gap-1">
                         <HelpCircle className="w-4 h-4 text-gray-400" />
                         Cette commande n'est plus modifiable.
                      </div>
                   </div>

                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col p-8 bg-gray-50 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Commandes</h1>
                <button className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">Ajouter une commande</button>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-3 text-sm mb-4">
                <button onClick={() => setOrderFilter('all')} className={`${orderFilter === 'all' ? 'font-bold text-gray-900' : 'text-blue-600 hover:underline'}`}>Tout <span className="text-gray-500 font-normal">({orders.length})</span></button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setOrderFilter('pending')} className={`${orderFilter === 'pending' ? 'font-bold text-gray-900' : 'text-blue-600 hover:underline'}`}>En cours <span className="text-gray-500 font-normal">({orders.filter(o => o.status === 'PENDING').length})</span></button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setOrderFilter('approved')} className={`${orderFilter === 'approved' ? 'font-bold text-gray-900' : 'text-blue-600 hover:underline'}`}>Terminée <span className="text-gray-500 font-normal">({orders.filter(o => o.status === 'APPROVED').length})</span></button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setOrderFilter('cancelled')} className={`${orderFilter === 'cancelled' ? 'font-bold text-gray-900' : 'text-blue-600 hover:underline'}`}>Annulée <span className="text-gray-500 font-normal">({orders.filter(o => o.status === 'CANCELLED').length})</span></button>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap justify-between items-center bg-white p-2 border border-gray-300 border-b-0">
                <div className="flex items-center gap-2">
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-blue-500">
                    <option>Actions groupées</option>
                    <option>Marquer en cours</option>
                    <option>Marquer terminée</option>
                    <option>Marquer annulée</option>
                    <option>Mettre à la corbeille</option>
                  </select>
                  <button className="px-3 py-1 text-sm font-medium border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 text-gray-700">Appliquer</button>
                  
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-blue-500 ml-2">
                    <option>Toutes les dates</option>
                    <option>septembre 2026</option>
                    <option>août 2026</option>
                    <option>juillet 2026</option>
                  </select>

                  <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-blue-500">
                    <option>Tous les canaux de vente</option>
                  </select>

                  <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-blue-500">
                    <option>Filtrer par client enregistré</option>
                  </select>
                  <button className="px-3 py-1 text-sm font-medium border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 text-gray-700">Filtrer</button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{orders.length} éléments</span>
                  <div className="flex items-center gap-1">
                    <button className="px-2 py-1 border border-gray-300 bg-gray-100 text-gray-400 rounded cursor-not-allowed text-xs">«</button>
                    <button className="px-2 py-1 border border-gray-300 bg-gray-100 text-gray-400 rounded cursor-not-allowed text-xs">‹</button>
                    <input type="text" value="1" readOnly className="w-8 text-center border border-gray-300 rounded py-1 text-sm bg-white" />
                    <span className="text-sm text-gray-600">sur 1</span>
                    <button className="px-2 py-1 border border-gray-300 bg-gray-100 text-gray-400 rounded cursor-not-allowed text-xs">›</button>
                    <button className="px-2 py-1 border border-gray-300 bg-gray-100 text-gray-400 rounded cursor-not-allowed text-xs">»</button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end bg-white px-2 pb-2 border-l border-r border-gray-300">
                 <div className="flex items-center gap-2">
                    <input type="text" className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                    <button className="px-3 py-1 text-sm font-medium border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 text-gray-700">Recherche commandes</button>
                 </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-300 overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-300 font-semibold">
                    <tr>
                      <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                      <th className="p-3 font-semibold text-blue-600 hover:underline cursor-pointer">Commande <ArrowRight className="inline w-3 h-3 rotate-90"/></th>
                      <th className="p-3 font-semibold text-blue-600 hover:underline cursor-pointer">Date <ArrowRight className="inline w-3 h-3 rotate-90"/></th>
                      <th className="p-3 font-semibold">État</th>
                      <th className="p-3 font-semibold text-right text-blue-600 hover:underline cursor-pointer">Total <ArrowRight className="inline w-3 h-3 rotate-90"/></th>
                      <th className="p-3 font-semibold">Origine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.filter(o => {
                      if (orderFilter === 'all') return true;
                      if (orderFilter === 'pending') return o.status === 'PENDING';
                      if (orderFilter === 'approved') return o.status === 'APPROVED';
                      if (orderFilter === 'cancelled') return o.status === 'CANCELLED';
                      return true;
                    }).map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 group">
                        <td className="p-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <button onClick={() => selectOrder(order)} className="text-blue-600 font-bold hover:underline">
                              #{order.id.split('-')[1]} {order.client_name.toUpperCase()}
                            </button>
                            <button onClick={() => selectOrder(order)} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-gray-500">il y a quelques heures</td>
                        <td className="p-3">
                          {order.status === 'PENDING' && <span className="bg-[#e5f5e5] text-[#1c662b] px-2.5 py-1 rounded font-medium text-xs">En cours</span>}
                          {order.status === 'APPROVED' && <span className="bg-[#e0e5eb] text-[#3c434a] px-2.5 py-1 rounded font-medium text-xs">Terminée</span>}
                          {order.status === 'CANCELLED' && <span className="bg-[#f0f0f1] text-[#a7aaad] px-2.5 py-1 rounded font-medium text-xs line-through">Annulée</span>}
                        </td>
                        <td className="p-3 text-right text-gray-500">
                          {order.total_amount ? order.total_amount.toLocaleString('fr-FR') : '0,00'} د.ج
                        </td>
                        <td className="p-3 text-gray-500">Inconnu</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
        ) : activeTab === 'backup' ? (
          <div className="flex-1 flex flex-col p-8 bg-gray-50 overflow-y-auto">
            <div className="flex items-center gap-4 mb-8">
              <Database className="w-8 h-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sauvegarde et Restauration</h1>
                <p className="text-sm text-gray-500">Exportez et importez les données du catalogue, des commandes et des utilisateurs (Format JSON).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              {/* Export Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-start gap-4">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                   <Download className="w-6 h-6" />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold text-gray-800 mb-2">Exporter les données</h2>
                   <p className="text-sm text-gray-500 mb-6">
                     Téléchargez un fichier JSON contenant l'intégralité de la base de données (produits, catégories, commandes) pour l'archiver localement en toute sécurité.
                   </p>
                 </div>
                 <button 
                   onClick={handleExport}
                   className="mt-auto flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-sm"
                 >
                   <Download className="w-4 h-4" />
                   Générer la sauvegarde
                 </button>
              </div>

              {/* Import Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-start gap-4">
                 <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                   <Upload className="w-6 h-6" />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold text-gray-800 mb-2">Importer des données</h2>
                   <p className="text-sm text-gray-500 mb-6">
                     Restaurez la base de données à partir d'un fichier de sauvegarde `.json`. Attention, l'importation écrasera les données locales actuelles de la session.
                   </p>
                 </div>
                 
                 <div className="mt-auto w-full">
                    <label className="flex items-center justify-center gap-2 w-full px-6 py-2.5 bg-white border-2 border-dashed border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 cursor-pointer font-bold transition-colors">
                      <Upload className="w-4 h-4" />
                      Sélectionner le fichier JSON
                      <input 
                        type="file" 
                        accept=".json"
                        className="hidden" 
                        onChange={handleImport}
                      />
                    </label>
                 </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
