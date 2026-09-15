import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { prisma } from './src/server/prisma.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// === API ROUTES (Prisma + Neon PostgreSQL) ===

// 1. Auth / Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, device_fingerprint } = req.body;
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          device_fingerprint,
          is_approved: false,
          role: 'CLIENT',
        },
      });
    }
    
    res.json({ success: true, message: 'Account pending approval', user });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: String(error) });
  }
});

// 2. Catalog (Client)
app.get('/api/products', async (req, res) => {
  try {
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
    const search = req.query.search ? String(req.query.search).toLowerCase() : undefined;

    const where: any = {};
    if (categoryId) where.category_id = categoryId;
    if (search) {
      where.OR = [
        { title_fr: { contains: search, mode: 'insensitive' } },
        { title_ar: { contains: search, mode: 'insensitive' } },
        { ref: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: String(error) });
  }
});
  
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: String(error) });
  }
});

// 3. Orders (Client)
app.post('/api/orders', async (req, res) => {
  try {
    const { items, client_id, total_amount } = req.body;

    // S'assurer qu'un client par défaut existe si non fourni
    let targetClientId = client_id;
    if (!targetClientId) {
      const defaultUser = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
      if (defaultUser) {
        targetClientId = defaultUser.id;
      } else {
        // Créer un client par défaut si aucun n'existe
        const newClient = await prisma.user.create({
          data: { email: `client-${Date.now()}-temp@agrorayane.com`, role: 'CLIENT', is_approved: true }
        });
        targetClientId = newClient.id;
      }
    }

    const newOrder = await prisma.order.create({
      data: {
        client_id: targetClientId,
        status: 'PENDING',
        total_amount: total_amount || 0,
        items: {
          create: items.map((it: any) => ({
            product_id: it.product_id,
            requested_qty: it.requested_qty,
            approved_qty: null,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        client: true,
      },
    });

    res.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: String(error) });
  }
});

// 4. Back-Office (Commercial / Agents)
app.get('/api/commercial/agents', async (req, res) => {
  try {
    const agents = await prisma.user.findMany({ where: { role: 'COMMERCIAL' } });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/commercial/agents', async (req, res) => {
  try {
    const { email, password } = req.body;
    const newAgent = await prisma.user.create({
      data: {
        email,
        password,
        role: 'COMMERCIAL',
        is_approved: true,
      },
    });
    res.json({ success: true, agent: newAgent });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/commercial/agents/:id', async (req, res) => {
  try {
    const agentId = req.params.id;
    const updated = await prisma.user.update({
      where: { id: agentId },
      data: req.body,
    });
    res.json({ success: true, agent: updated });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/commercial/agents/:id', async (req, res) => {
  try {
    const agentId = req.params.id;
    await prisma.user.delete({ where: { id: agentId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/commercial/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        client: true,
        items: { include: { product: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching commercial orders:', error);
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/commercial/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/commercial/categories', async (req, res) => {
  try {
    const { name_fr, name_ar } = req.body;
    const newCategory = await prisma.category.create({
      data: { name_fr, name_ar },
    });
    res.json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/commercial/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name_fr, name_ar } = req.body;
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name_fr, name_ar },
    });
    res.json({ success: true, category: updated });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/commercial/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    await prisma.category.delete({ where: { id: categoryId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/commercial/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/commercial/products', async (req, res) => {
  try {
    const { category_id, ref, title_fr, title_ar, image_url, youtube_url, is_available } = req.body;
    const newProduct = await prisma.product.create({
      data: {
        category_id,
        ref,
        title_fr,
        title_ar,
        image_url,
        youtube_url,
        is_available: is_available !== undefined ? is_available : true,
      },
    });
    res.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/commercial/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updated = await prisma.product.update({
      where: { id: productId },
      data: req.body,
    });
    res.json({ success: true, product: updated });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/commercial/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    await prisma.product.delete({ where: { id: productId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/commercial/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { items, status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status || 'APPROVED',
      },
    });

    if (items && Array.isArray(items)) {
      for (const updateItem of items) {
        if (updateItem.order_item_id) {
          await prisma.orderItem.update({
            where: { id: updateItem.order_item_id },
            data: { approved_qty: updateItem.approved_qty },
          });
        }
      }
    }

    const finalOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true, items: { include: { product: true } } },
    });

    res.json({ success: true, order: finalOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: String(error) });
  }
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Si on lance le fichier directement en local (node server.ts ou via ts-node)
if (process.env.NODE_ENV !== 'production') {
  setupLocalServer();
}

// Export indispensable pour Vercel (Serverless)
export default app;