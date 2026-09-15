import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { mockProducts, mockCategories, mockOrders } from './src/data/mock';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// === MOCK API ROUTES (Simulating NestJS behavior) ===

// 1. Auth (Simulated)
app.post('/api/auth/register', (req, res) => {
  const { email, device_fingerprint } = req.body;
  res.json({ success: true, message: 'Account pending approval', user: { email, device_fingerprint, is_approved: false } });
});

// 2. Catalog (Client)
app.get('/api/products', (req, res) => {
  let filtered = [...mockProducts];
  if (req.query.categoryId) {
    filtered = filtered.filter(p => p.category_id === req.query.categoryId);
  }
  if (req.query.search) {
    const s = String(req.query.search).toLowerCase();
    filtered = filtered.filter(p => p.title_fr.toLowerCase().includes(s) || p.title_ar.includes(s) || p.ref.toLowerCase().includes(s));
  }
  // Remove stock quantity to respect business rule #2
  const clientSafeProducts = filtered.map(({ stock_quantity_mock, ...rest }) => rest);
  res.json(clientSafeProducts);
});
  
app.get('/api/categories', (req, res) => {
  res.json(mockCategories);
});

// 3. Orders (Client)
app.post('/api/orders', (req, res) => {
  const { items, client_id } = req.body;
  const newOrder = {
    id: `ord-${Math.floor(Math.random()*10000)}`,
    client_id: client_id || 'client-1',
    client_name: 'Ferme Agricole Tizi',
    status: 'PENDING' as any,
    total_amount: 0,
    created_at: new Date().toISOString(),
    items: items.map((it: any, i: number) => {
      const product = mockProducts.find(p => p.id === it.product_id);
      return {
        id: `item-${Date.now()}-${i}`,
        order_id: 'new',
        product_id: it.product_id,
        requested_qty: it.requested_qty,
        approved_qty: null,
        product: product
      };
    })
  };
  mockOrders.push(newOrder);
  res.json({ success: true, order: newOrder });
});

// 4. Back-Office (Commercial)
let mockAgents: any[] = [];

app.get('/api/commercial/agents', (req, res) => {
  res.json(mockAgents);
});

app.post('/api/commercial/agents', (req, res) => {
  const newAgent = { id: `agent-${Date.now()}`, ...req.body };
  mockAgents.push(newAgent);
  res.json({ success: true, agent: newAgent });
});

app.patch('/api/commercial/agents/:id', (req, res) => {
  const agentId = req.params.id;
  const index = mockAgents.findIndex(a => a.id === agentId);
  if (index === -1) return res.status(404).json({ error: 'Agent not found' });
  
  mockAgents[index] = { ...mockAgents[index], ...req.body };
  res.json({ success: true, agent: mockAgents[index] });
});

app.delete('/api/commercial/agents/:id', (req, res) => {
  const agentId = req.params.id;
  const index = mockAgents.findIndex(a => a.id === agentId);
  if (index !== -1) {
    mockAgents.splice(index, 1);
  }
  res.json({ success: true });
});

app.get('/api/commercial/orders', (req, res) => {
  res.json(mockOrders);
});

app.get('/api/commercial/categories', (req, res) => {
  res.json(mockCategories);
});

app.post('/api/commercial/categories', (req, res) => {
  const newCategory = {
    id: `cat-${Date.now()}`,
    name_fr: req.body.name_fr,
    name_ar: req.body.name_ar,
  };
  mockCategories.push(newCategory);
  res.json({ success: true, category: newCategory });
});

app.patch('/api/commercial/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const index = mockCategories.findIndex(c => c.id === categoryId);
  if (index === -1) return res.status(404).json({ error: 'Category not found' });
  
  mockCategories[index] = {
    ...mockCategories[index],
    name_fr: req.body.name_fr,
    name_ar: req.body.name_ar,
  };
  res.json({ success: true, category: mockCategories[index] });
});

app.delete('/api/commercial/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const index = mockCategories.findIndex(c => c.id === categoryId);
  if (index !== -1) {
    mockCategories.splice(index, 1);
  }
  res.json({ success: true });
});

app.get('/api/commercial/products', (req, res) => {
  res.json(mockProducts);
});

app.post('/api/commercial/products', (req, res) => {
  const newProduct = {
    id: `prod-${Date.now()}`,
    ...req.body,
    is_available: req.body.stock_quantity_mock > 0
  };
  mockProducts.unshift(newProduct);
  res.json({ success: true, product: newProduct });
});

app.patch('/api/commercial/products/:id', (req, res) => {
  const productId = req.params.id;
  const index = mockProducts.findIndex(p => p.id === productId);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  
  mockProducts[index] = {
    ...mockProducts[index],
    ...req.body,
    is_available: req.body.stock_quantity_mock !== undefined ? req.body.stock_quantity_mock > 0 : mockProducts[index].is_available
  };
  res.json({ success: true, product: mockProducts[index] });
});

app.delete('/api/commercial/products/:id', (req, res) => {
  const productId = req.params.id;
  const index = mockProducts.findIndex(p => p.id === productId);
  if (index !== -1) {
    mockProducts.splice(index, 1);
  }
  res.json({ success: true });
});

app.patch('/api/commercial/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const { items } = req.body;
  
  const orderIndex = mockOrders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });
  
  const order = mockOrders[orderIndex];
  order.status = 'APPROVED';
  
  items.forEach((updateItem: any) => {
    const item = order.items.find(i => i.id === updateItem.order_item_id);
    if (item) {
      item.approved_qty = updateItem.approved_qty;
    }
  });
  
  res.json({ success: true, order });
});

app.get('/api/commercial/orders/:id/pdf', (req, res) => {
  res.json({ url: `/pdfs/BL-${req.params.id}.pdf` });
});

// Configuration pour le développement local uniquement
async function setupLocalServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Si on lance le fichier directement en local (node server.ts ou via ts-node)
if (process.env.NODE_ENV !== 'production') {
  setupLocalServer();
}

// Export indispensable pour Vercel (Serverless)
export default app;