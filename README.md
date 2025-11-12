# 🍽️ CloudMenu — QR Ordering, Live Kitchen, Smart Billing

**Full product scope:** Customers scan & order • Chefs track prep in real-time • Waiters finalize live bills • Admins see analytics.

## Monorepo
cloudmenu/
├─ backend/ # Spring Boot + MySQL + STOMP
├─ web/ # Next.js Admin (Chef, Waiter, Analytics)
└─ mobile/ # React Native (planned)

## Tech
Java 17, Spring Boot 3, JPA/Hibernate, MySQL • Next.js (App Router), TS, Tailwind • STOMP WebSockets • JWT

## Quick Start
**Backend**
```bash
cd backend
mvn spring-boot:run
cd web
npm i
npm run dev
.env.local:
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_WS_BASE=http://localhost:8080

Key Endpoints

GET /api/chef/orders?restaurantId=1

PATCH /api/chef/order-items/{id}/status?status=READY

GET /api/waiter/active-orders?restaurantId=1

GET /api/waiter/orders/{orderId}/live-bill

POST /api/waiter/orders/{orderId}/finalize-bill

GET /api/print/receipt/{orderId}

WebSocket Topics
/topic/orders/{restaurantId}, /topic/order-items/{restaurantId}, /topic/billing/{restaurantId}

Roles
ADMIN, CHEF, WAITER

Roadmap
Customer QR app • Redis cache • PDF receipts • Deployment (Render/AWS) • CI/CD

Contact: Sahyadri — GitHub @Sahyadri48 • www.linkedin.com/in/sahyadri-pukale-a1s1k/ • sahyadri282@gmail.com

From your repo root:
```bat
notepad README.md

git add README.md
git commit -m "docs: recruiter-friendly README"
git pushgit add README.md
git commit -m "docs: recruiter-friendly README"
git push
