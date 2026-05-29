-- Migration: 002_products_add_image.sql
-- Description: Adds imageUrl column to products table

ALTER TABLE public."products"
  ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
