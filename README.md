🍽️ CloudMenu – QR-Based Restaurant Ordering System

CloudMenu is a full-stack, QR-based restaurant ordering and management system built to modernize in-restaurant ordering.
Customers scan a QR code to view the menu and place orders from their mobile phones, while restaurant owners manage menus, orders, and analytics via a web dashboard and backend services.
This project is built as a monorepo containing backend, web, and mobile applications.

🚀 Tech Stack
Backend

Java 17
Spring Boot
Spring Data JPA (Hibernate)
MySQL
REST APIs
Web (Admin Dashboard)
Next.js
React
TypeScript
Tailwind CSS
Axios
Mobile (Customer App)
React Native
Expo
TypeScript
Redux Toolkit
Expo Router
Tools & IDEs
VS Code
Git & GitHub
MySQL Workbench / CLI
Maven
npm / Node.js

📁 Monorepo Folder Structure
cloudmenu/
├── cloudmenu-backend/       # Spring Boot backend
│   ├── src/main/java
│   ├── src/main/resources
│   └── pom.xml
│
├── cloudmenu-web/           # Next.js admin dashboard
│   ├── app/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── cloudmenu-mobile/        # Expo / React Native customer app
│   ├── app/                 # Expo Router screens
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── features/        # Redux slices
│   │   ├── hooks/
│   │   ├── navigation/
│   │   ├── store/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md

🧠 System Architecture

        ┌────────────┐
        │   Customer │
        │  Mobile App│
        │ (Expo RN)  │
        └─────┬──────┘
              │ REST APIs
              ▼
        ┌────────────┐
        │ Spring Boot│
        │   Backend  │
        │ (Business  │
        │   Logic)   │
        └─────┬──────┘
              │ JPA / Hibernate
              ▼
        ┌────────────┐
        │   MySQL    │
        │  Database  │
        └────────────┘
              ▲
              │ REST APIs
        ┌─────┴──────┐
        │  Admin Web │
        │  Dashboard │
        │  (Next.js) │
        └────────────┘
🔄 Application Flow (High Level)

Customer scans QR code
Mobile app loads menu from backend
Customer adds items and places order
Backend stores order in MySQL
Admin dashboard fetches live orders
Admin updates order status
Customer sees updated order status

⚙️ Prerequisites

Install the following before running the project:

Java 17+
Maven
Node.js 18+
npm
MySQL 8+
Git
VS Code
Expo CLI
Install Expo CLI:
npm install -g expo-cli


 Backend Setup (Spring Boot)
1️ Navigate to backend

cd cloudmenu-backend

2️ Create MySQL Database
CREATE DATABASE cloudmenu;

3 Run Backend
mvn spring-boot:run

4 Backend URL
http://localhost:8080

🌐 Web App Setup (Next.js – Admin Dashboard)
1️⃣ Navigate to web app
cd cloudmenu-web

2️⃣ Install dependencies
npm install

3️⃣ Configure Environment Variables

Create .env.local:

NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

4️⃣ Run Web App
npm run dev


Web app runs at:

http://localhost:3000

📱 Mobile App Setup (Expo – Customer App)
1️⃣ Navigate to mobile app
cd cloudmenu-mobile

2️⃣ Install dependencies
npm install

3️⃣ Configure Environment Variables

Create .env:

EXPO_PUBLIC_API_BASE_URL=http://localhost:8080

4️⃣ Start Expo
npx expo start


Run using:

Expo Go (scan QR)

Android Emulator

iOS Simulator (Mac)

▶️ Recommended Execution Order

Start MySQL

Run Spring Boot backend
Run Next.js web app
Run Expo mobile app

🧩 Redux Architecture (Mobile)

features/ → Redux slices (cart, menu, order)
store/ → Root reducer & store config
hooks/ → Typed Redux hooks
api/ → API abstraction layer

State flow:

UI → Redux Action → Slice → API → Backend → Store → UI

🔐 Environment & Security
.env files are ignored
node_modules excluded
Database credentials not committed
API URLs configurable per environment

❗ Common Issues & Fixes
Expo not found
npm install -g expo-cli

Port already in use
npx expo start --port 19001

MySQL connection error

Ensure MySQL is running

Check username/password

Verify database exists


📈 Future Enhancements

Payment gateway integration
Cloud deployment (AWS / Render)
CI/CD pipelines


