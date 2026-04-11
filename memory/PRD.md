# Energica Solutions Store - PRD

## Original Problem Statement
Build an online store for Energica Solutions (solar EPC distributor, Pune) similar to Glannu Store. Product catalog with RFQ via WhatsApp, admin panel for product management.

## Architecture
- **Backend**: FastAPI + MongoDB + JWT Auth
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Database**: MongoDB (products, users, rfqs collections)

## User Personas
1. **Solar EPC/Installer**: Browses products, adds to quote, submits RFQ via WhatsApp
2. **Admin**: Manages products, prices, stock, views RFQs

## Core Requirements
- [x] Product catalog (100 products, 14 categories)
- [x] Category filtering, search, sort
- [x] Product detail pages (features, specs, applications, similar products)
- [x] Add to Quote cart system with localStorage persistence
- [x] WhatsApp RFQ submission (wa.me/918007520000)
- [x] Transit mode selection (Ex-Works, Door Delivery, Transport/Freight)
- [x] Admin panel with JWT auth
- [x] Product CRUD (edit price, stock, name, status)
- [x] RFQ tracking in admin
- [x] Responsive design (mobile + desktop)
- [x] Energica branding (logo, colors, contact info)

## What's Been Implemented (Feb 2026)
- Complete product catalog with 100 items across 14 categories
- Full-featured store with hero banner, category sidebar, search, sort
- Product detail pages with features, applications, datasheet request
- Quote drawer with item management, transit mode, WhatsApp CTA
- Admin dashboard with product management and RFQ viewing
- JWT-based admin authentication
- All API endpoints tested and working (100% pass rate)

## Prioritized Backlog
### P0 (Critical)
- All P0 features implemented

### P1 (Important)
- Add more product images per category (currently using category-level placeholders)
- Bulk product import from Excel
- Product image upload via admin panel

### P2 (Nice to Have)
- User accounts for repeat customers
- Order history tracking
- Email notifications for new RFQs
- Product comparison feature
- Inventory alerts (low stock notifications)
