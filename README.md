# Ultimate Multi-Tenant SaaS ERP + POS System

This repository contains the architecture and foundations for a massive enterprise-scale Platform featuring ERP, Multi-Vendor Marketplace, real-time POS, and KDS synchronization.

## 🏗️ Architecture Overview

The system is designed as a modular monolithic API with decoupled frontend modules for massive scalability.

### Modules Available/Outlined:
1. **API Layer (`/api`)**: Node.js/Express, Socket.io, Prisma ORM targeting PostgreSQL.
2. **POS Terminal (`/pos`)**: Fast retail billing UI, Cart management, Socket triggers.
3. **KDS System (`/kds`)**: Real-time kitchen view, dynamic timer checks, push-based order cards.
4. *(Additional planned modules: `/admin`, `/customer`, `/waiter`, `/kiosk`, `/vendor`, `/rider`)*

## 🛠️ Stack

*   **Database**: PostgreSQL via Prisma
*   **Backend**: Node.js, Express, JWT Auth, Socket.io
*   **Web Platforms**: React, Vite, CSS Glassmorphism, GSAP Animations

## 🚀 Setup & Local Development

### 1. Database & Backend
Ensure you have Node.js (v18+) and PostgreSQL installed.

```bash
cd api
npm install
```

Create a PostgreSQL database and configure your `.env` (use `.env.example` as reference).

```bash
npx prisma generate
npx prisma db push
```

Start the master API server:
```bash
npm run dev
```
*(Server starts natively on `http://localhost:5000`)*

### 2. Running POS Terminal
```bash
cd pos
npm install
npm run dev
```
*(Available on `http://localhost:3001`)*

### 3. Running Kitchen Display System (KDS)
```bash
cd kds
npm install
npm run dev
```
*(Available on `http://localhost:3002`)*

## 🚢 Deployment Guide

### Backend API (Railway)
1. Fork or push this repository to GitHub.
2. Sign into [Railway.app](https://railway.app).
3. Create a new project -> **Deploy from GitHub repo**.
4. Select the repository. Set the Root Directory to `/api`.
5. Railway will automatically detect the `Dockerfile` or `railway.toml`.
6. Add the required environment variables under Variables (Database URL, JWT_SECRET, etc).
7. Ensure Railway provisions a PostgreSQL database and exposes its connection URL to your app.

### Frontend Apps (Vercel)
Each frontend application (POS, KDS, etc.) is configured as an independent Vercel project.
1. Sign into [Vercel](https://vercel.com).
2. Add New Project -> Import from GitHub repository.
3. For "Root Directory", select the module you're deploying (e.g., `pos/` or `kds/`).
4. Framework Preset should auto-detect "Vite".
5. Click **Deploy**. Vercel will build and serve using the included `vercel.json` rewrite routing.

We have applied:
- **RBAC**: Handled via middleware in API.
- **Micro-animations**: GSAP integrated.
- **Glassmorphism**: Hand-crafted CSS logic built on `index.css`.
- **Database**: 100% relational schema inside `api/prisma/schema.prisma`.
