🍽️ CloudMenu

CloudMenu is a full-stack, QR-based restaurant ordering and management system designed to simplify in-restaurant ordering, billing, and live order tracking.
Customers can scan a QR code to view the menu and place orders, while restaurant owners manage orders, menus, and analytics through an admin dashboard.

✨ Key Features
👥 Customer Side

Scan QR code to access the menu

Browse menu items with add-ons

Place orders without installing an app

Live order status updates

Seamless in-restaurant experience

🧑‍🍳 Restaurant / Admin Side

Secure authentication & role-based access

Menu and category management

Live order tracking (real-time updates)

Billing and order history

Analytics dashboard (sales, popular items, trends)

Subscription & upgrade flow
🏗️ Project Structure (Monorepo)
cloudmenu/
├── cloudmenu-backend/   # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── cloudmenu-web/       # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
│
└── .gitignore

🛠️ Tech Stack
Backend

Java 17

Spring Boot

Spring Security + JWT

Spring Data JPA

MySQL

REST APIs

SSE / WebSocket (real-time updates)

Frontend

Next.js (App Router)

TypeScript

Tailwind CSS

React Server Components

REST API integration

🔐 Authentication & Security

JWT-based authentication

Role-based access control (Admin / Restaurant / Customer)

Secured REST endpoints using Spring Security

📊 Real-Time Features

Live order updates for kitchen & admin dashboard

Server-Sent Events (SSE) / WebSocket integration

Instant UI updates without page refresh

🚀 Getting Started (Local Setup)
Prerequisites

Java 17+

Node.js 18+

MySQL

Maven

🔧 Backend Setup
cd cloudmenu-backend
./mvnw spring-boot:run


Update application.properties with:

Database credentials

JWT secret

Server port

🎨 Frontend Setup
cd cloudmenu-web
npm install
npm run dev


Frontend runs on:

http://localhost:3000

🌱 Environment Variables

Backend:

DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET


Frontend:

NEXT_PUBLIC_API_BASE_URL

📌 Use Cases

Cafes & restaurants replacing paper menus

Quick-service restaurants (QSRs)

Small to mid-scale dining businesses

Digital ordering without POS dependency

🧠 Learning & Design Focus

Clean REST API design

Layered architecture (Controller → Service → Repository)

DTO-based data transfer

Scalable monorepo structure

Production-ready backend practices
