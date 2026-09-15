import { pgTable, serial, text, timestamp, integer, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('client'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  nameFr: text('name_fr').notNull(),
  nameAr: text('name_ar'),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id),
  nameFr: text('name_fr').notNull(),
  nameAr: text('name_ar'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(0),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
});

export const stockCorrections = pgTable('stock_corrections', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id),
  userId: integer('user_id').references(() => users.id),
  quantityChange: integer('quantity_change').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});