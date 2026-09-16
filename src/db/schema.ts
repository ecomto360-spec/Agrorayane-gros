import { pgTable, text, timestamp, integer, boolean, serial, doublePrecision } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  login: text('login'),
  password_hash: text('password_hash'),
  role: text('role').notNull(), // 'CLIENT', 'COMMERCIAL', 'ADMIN'
  active: boolean('active').default(false).notNull(), // Clients must be approved by admin
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name_fr: text('name_fr').notNull(),
  name_ar: text('name_ar').notNull(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  category_id: text('category_id').references(() => categories.id).notNull(),
  title_fr: text('title_fr').notNull(),
  title_ar: text('title_ar').notNull(),
  description_fr: text('description_fr'),
  description_ar: text('description_ar'),
  ref: text('ref').notNull(),
  price: doublePrecision('price').notNull(),
  stock_quantity: integer('stock_quantity').notNull().default(0),
  image_url: text('image_url'),
  video_url: text('video_url'),
  is_available: boolean('is_available').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  client_id: text('client_id').references(() => users.id).notNull(),
  status: text('status').notNull(), // 'PENDING', 'APPROVED', 'CANCELLED'
  total_amount: doublePrecision('total_amount').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  order_id: text('order_id').references(() => orders.id).notNull(),
  product_id: text('product_id').references(() => products.id).notNull(),
  requested_qty: integer('requested_qty').notNull(),
  approved_qty: integer('approved_qty'),
});

export const stockCorrections = pgTable('stock_corrections', {
  id: serial('id').primaryKey(),
  order_item_id: text('order_item_id').references(() => orderItems.id).notNull(),
  agent_id: text('agent_id').references(() => users.id).notNull(),
  original_qty: integer('original_qty').notNull(),
  corrected_qty: integer('corrected_qty').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
