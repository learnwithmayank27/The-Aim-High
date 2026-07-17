# The Aim High Coaching Institute Portal

Welcome to **The Aim High Academy** management portal. This is a complete, production-ready Coaching Management System built for students, teachers, administrators, and parents. It includes offline/online hybrid study materials, PYQs, live sessions, homework assignment pipelines, simulated online fee payments, notice boards, and progress report cards.

Managed by **Prashant Rajput**, based in **Coaching Mandi, Barra-2, Kanpur**.

---

## 🚀 Tech Stack

### Frontend
* **Next.js 15** (App Router & Static Optimization)
* **React 19 & TypeScript**
* **Tailwind CSS v4** (Utility styling & Theme variables)
* **Lucide React** (Modern Icons)
* **Framer Motion** (Apple-inspired micro-animations)

### Backend & Database
* **Node.js & Express.js** (TypeScript)
* **PostgreSQL** (Relational storage)
* **Prisma ORM** (Model mapping & seeds)
* **JWT & BcryptJS** (Role-based authentication & password security)
* **Multer** (Disk uploads served locally during development)
* **Cloudinary** (Production cloud media storage fallback)

---

## 📂 Project Structure

```text
The-Aim-High/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & Storage configurations
│   │   ├── controllers/        # Express handlers (auth, dashboard stats, homework, etc.)
│   │   ├── middleware/         # Auth, Role restriction, global errors, rate limiters
│   │   ├── routes/             # REST routing mounts
│   │   ├── utils/              # JWT, Hashing, Multer file upload
│   │   └── index.ts            # API Server initialization
│   ├── prisma/
│   │   ├── schema.prisma       # Database design
│   │   └── seed.ts             # Seeding entries for demo student, parent, faculty (Prashant Rajput)
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js app pages (Landing, Login, Dashboards)
│   │   ├── context/            # AuthContext session provider
│   │   ├── lib/                # Axios connector API, style merges
│   │   └── globals.css         # CSS-v4 variables for Light/Dark modes
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml          # Local PostgreSQL container configuration
└── README.md
```

---

## ⚙️ Quick Start Installation

Follow these steps to run the complete stack on your local computer.

### Step 1: Boot Up PostgreSQL
Start the local PostgreSQL container in the root directory:
```bash
docker-compose up -d
```
*Alternatively, you can use your own PostgreSQL server. Update the `DATABASE_URL` in `backend/.env`.*

### Step 2: Configure & Start Express API
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Double-check your environment variables in `.env` (already generated with defaults):
   ```ini
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aim_high?schema=public"
   JWT_SECRET="super-secret-jwt-key-for-aim-high-academy"
   ```
3. Sync the Prisma models to the database:
   ```bash
   npx prisma db push
   ```
4. Seed the database with core credentials (including Prashant Rajput):
   ```bash
   npm run db:seed
   ```
5. Launch the API dev server:
   ```bash
   npm run dev
   ```
*The server will run on: [http://localhost:5000](http://localhost:5000)*

### Step 3: Start Next.js Frontend
1. Open a new terminal window and navigate to the frontend:
   ```bash
   cd frontend
   ```
2. Launch the client dev server:
   ```bash
   npm run dev
   ```
*The site will run on: [http://localhost:3000](http://localhost:3000)*

---

## 🔑 Demo Login Accounts

After running the database seed script, you can log in to the portals using:

| Portal Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@aimhigh.com` | `password123` |
| **Faculty (Prashant Rajput)** | `prashant@aimhigh.com` | `password123` |
| **Student (Mayank Sharma)** | `student@aimhigh.com` | `password123` |
| **Parent (Rakesh Sharma)** | `parent@aimhigh.com` | `password123` |

---

## 🔒 Security Measures
* **Password Hashing:** Implemented with `bcryptjs`.
* **Token Guarding:** Custom authorization headers with secure JWT tokens.
* **CORS & Helmet Protection:** Mitigates standard cross-site scripting (XSS) and server identity leaks.
* **Rate Limiting:** Protects `/auth/login` and `/auth/register` endpoints from brute-force queries.
