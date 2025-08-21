This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
# 🏥 CareWork Manager Platform

A full-stack workforce management demo application built for **Care Workers** and **Managers**, featuring **shift tracking, geofencing, analytics dashboards, and role-based access control**.  

This repository demonstrates modern **GraphQL API design with Prisma**, **role-based authentication with Auth0**, and **interactive dashboards with Next.js, Ant Design, and D3.js**.

---

## 🌟 Overview

The platform solves the problem of **worksite and shift management** for care staff:

- **Care Workers** → clock in/out at worksites using geolocation, track hours, and review shift history.  
- **Managers** → create worksites, view all workers' shifts, and monitor activity across the organization.  
- **Analytics dashboards** → provide care workers with personal stats and managers with cross-worker insights.  

---

## 🛠 Tech Stack

### Backend
- **GraphQL Yoga** → lightweight, type-safe GraphQL server  
- **Prisma ORM** → schema-driven data access with PostgreSQL  
- **PostgreSQL** → relational DB storing users, shifts, and worksites  
- **Auth0** → authentication & identity provider (JWTs, user claims)

### Frontend
- **Next.js 15** → fullstack React framework (SSR + API routes)  
- **React 18** → component-driven UI  
- **Ant Design** → UI component system for polished dashboards  
- **D3.js** → interactive charts and analytics  

### Deployment
- **Vercel** → hosting & serverless API routes  
- **Supabase (optional)** → could be used for role claim syncing if extending beyond Auth0  

---

## 🏗 Architecture
Next.js (Pages + Components)
│
├── app/ # App Router pages
│ ├── dashboard/ # CareWorker + Manager dashboards
│ ├── api/graphql/ # GraphQL API endpoint
│
├── lib/
│ ├── graphqlfetch.ts # Client fetcher for GraphQL
│ └── auth0.ts # Auth0 SDK helpers
│
Backend (GraphQL Yoga + Prisma)
│
├── schema.graphql # GraphQL schema
├── resolvers.ts # Query + Mutation resolvers
├── prisma/schema.prisma # Database schema


---

## 🗄 Database Schema
model User {
  id        Int      @id @default(autoincrement())
  auth0Id   String   @unique
  email     String
  role      String   // "CareWorker" | "Manager"
  shifts    Shift[]
  worksites Worksite[] @relation("ManagerWorksites")
}

model Worksite {
  id        Int      @id @default(autoincrement())
  name      String
  latitude  Float
  longitude Float
  radius    Float
  managerId Int
  manager   User     @relation("ManagerWorksites", fields: [managerId], references: [id])
  shifts    Shift[]
  createdAt DateTime @default(now())
}

model Shift {
  id        Int      @id @default(autoincrement())
  userId    Int
  worksiteId Int
  user      User
  worksite  Worksite
  clockIn   DateTime
  clockOut  DateTime?
  note      String?
  location  String
}
Resolvers

Query.me → returns current authenticated user
Query.myShifts → role-dependent
CareWorker → only their shifts
Manager → all shifts
Mutation.clockIn → validates geolocation radius, creates new shift
Mutation.clockOut → closes shift with optional note
Mutation.createWorksite → managers only
Mutation.makeMeManager → dev utility to flip role = "Manager"

Authentication & RBAC
Users authenticate via Auth0 → JWT contains sub, email, etc.
On first login, backend creates a User record in DB with default role CareWorker.
Resolvers enforce role-based access:
CareWorker: can clockIn, clockOut, view only their own shifts.
Manager: can createWorksite, users, and view all shifts.
For demo: makeMeManager mutation flips current user to Manager.
This avoids configuring Auth0 role management during development.

Future Improvements
Secure RBAC with Auth0 role claims (remove makeMeManager)
Add more detailed analytics (monthly, per worksite)
Offline clock-in/out with sync on reconnect
Push notifications for shift reminders




MIT License © 2025
