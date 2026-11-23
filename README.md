# SpendWell — Espresso & Champagne Luxury Expense Tracker

A modern, fintech-grade, full-stack MERN (MongoDB, Express, React, Node.js) personal finance application. Designed with a sophisticated **Espresso & Champagne luxury aesthetic**:
- **Landing Page & Authentication**: **Dark Luxury Theme** (Espresso `#211B18` and Mocha `#49372D` with glowing Champagne `#C6A77B` accents) featuring an animated hero, floating financial dashboard visual, 3D-styled leather wallet, champagne coins (`रु.`), and interactive feature showcases.
- **Logged-in Dashboard & Workspaces**: **Light Luxury Theme** (Warm Ivory `#FAF6F0` background, pure white cards `#FFFFFF`, rich espresso headings and text `#211B18`, champagne accents `#C6A77B`, muted green `#5E7A5A` for income, and warm terracotta `#A85A44` for expenses).

Native **Nepali Rupees (रु.)** currency formatting is implemented throughout the entire interface with zero permanent hardcoded data, real MongoDB dynamic calculations, Recharts analytics, and strict multi-user JWT authentication. Ideal for college project submission and viva demonstration.

---

## 📋 Table of Contents
1. [Overview](#-overview)
2. [Technology Stack](#-technology-stack)
3. [System Architecture](#-system-architecture)
4. [Database Structure](#-database-structure)
5. [REST API Endpoints](#-rest-api-endpoints)
6. [Key Features](#-key-features)
7. [Installation & Setup](#-installation--setup)
8. [Deploying to AWS](#-deploying-to-aws)
9. [Running Automated Tests](#-running-automated-tests)
10. [College Viva & Demonstration Guide](#-college-viva--demonstration-guide)

---

## 🌟 Overview
Spendwell helps individuals track their financial health by recording incomes and expenses, categorizing spending, visualizing monthly trends, and exporting financial statements. All computations are performed dynamically from MongoDB with strict multi-user data isolation.

---

## 🛠 Technology Stack

### Frontend
- **React 19** (Functional components, hooks: `useMemo`, `useCallback`, `useState`, `useEffect`, Context API)
- **Vite 6** (Fast build tool with optimized Rollup code-splitting)
- **React Router 7** (Client-side routing with protected route guards)
- **Recharts** (Interactive SVG-based bar and donut/pie charts)
- **Axios** (HTTP client with request/response interceptors)
- **Vanilla CSS3** (Custom responsive design system with CSS variables, flexbox, and CSS grid)

### Backend
- **Node.js 20+ / 22+** (JavaScript runtime)
- **Express 5** (Fast RESTful API framework)
- **MongoDB & Mongoose 8** (NoSQL document database with schema validation & compound indexes)
- **JSON Web Tokens (JWT)** (Secure token generation)
- **Bcrypt.js** (Salted password hashing with 12 rounds)
- **Cookie-Parser** (HttpOnly, SameSite cookie handling)
- **Helmet & Express-Rate-Limit** (Security headers and brute-force protection)

---

## 📐 System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React Client (Vite)                      │
│      React Router · Context API · Recharts · Axios          │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Proxied /api)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js REST Server                    │
│    Helmet · Rate Limiting · Cookie Parser · Auth Guard      │
├──────────────────────────────┬──────────────────────────────┤
│     /api/auth Routes         │   /api/transactions Routes   │
│  (Register, Login, Me, Out)  │  (Income, Expense, Reports)  │
└──────────────────────────────┼──────────────────────────────┘
                               │ Mongoose ODM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Database                        │
│             Collections: `users`, `transactions`            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄 Database Structure

### 1. `users` Collection
Stores registered user credentials securely.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key, Auto | Unique user identifier |
| `name` | `String` | Required, Trim (2-80 chars) | Full name of the user |
| `email` | `String` | Required, Unique, Lowercase | User email address |
| `passwordHash` | `String` | Required, `select: false` | 12-round bcrypt hashed password |
| `createdAt` | `Date` | Auto timestamp | Timestamp of registration |
| `updatedAt` | `Date` | Auto timestamp | Timestamp of last update |

> **Security Note**: `passwordHash` has `select: false` so it is never returned in queries or serialized to JSON by default.

---

### 2. `transactions` Collection
Stores individual income and expense records.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key, Auto | Unique transaction identifier |
| `user` | `ObjectId` | Required, Ref: `'User'` | Foreign reference to owning user |
| `type` | `String` | Enum: `['income', 'expense']` | Discriminator for transaction type |
| `amount` | `Number` | Required, Min: `0.01` | Monetary value (positive float) |
| `date` | `Date` | Required | Transaction date |
| `description` | `String` | Optional, Max: 200 chars | User notes or description |
| `source` | `String` | Required for `income` | E.g., "Salary", "Freelance", "Dividends" |
| `category` | `String` | Required for `expense`, Enum | E.g., "Food", "Bills", "Shopping" |
| `createdAt` | `Date` | Auto timestamp | Record creation timestamp |
| `updatedAt` | `Date` | Auto timestamp | Record modification timestamp |

#### Expense Categories
1. `Food` 🍔
2. `Transportation` 🚗
3. `Shopping` 🛍️
4. `Education` 📚
5. `Entertainment` 🎬
6. `Healthcare` 💊
7. `Bills` 📄
8. `Other` 📌

#### Database Indexing
- **Compound Index**: `{ user: 1, date: -1 }` on `transactions` ensures fast sorting and filtering queries isolated per user.

---

## 🔌 REST API Endpoints

All transaction endpoints require a valid session cookie verified by `requireAuth` middleware.

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Public / Protected |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account & set session cookie | Public (Rate-limited) |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT cookie | Public (Rate-limited) |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Protected |
| `POST` | `/api/auth/logout` | Clear authentication cookie | Public |

### Transaction Endpoints (`/api/transactions`)
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/transactions/income` | List all incomes for the current user | Yes |
| `POST` | `/api/transactions/income` | Create new income record | Yes |
| `PUT` | `/api/transactions/income/:id` | Update existing income record | Yes |
| `DELETE` | `/api/transactions/income/:id` | Delete income record | Yes |
| `GET` | `/api/transactions/expenses` | List all expenses for the current user | Yes |
| `POST` | `/api/transactions/expenses` | Create new expense record | Yes |
| `PUT` | `/api/transactions/expenses/:id` | Update existing expense record | Yes |
| `DELETE` | `/api/transactions/expenses/:id` | Delete expense record | Yes |
| `GET` | `/api/transactions/summary` | Dashboard metrics (totals, balance, 6-mo trend) | Yes |
| `GET` | `/api/transactions/reports` | Deep analytics (`?months=6` or `12`, category breakdown) | Yes |

---

## ✨ Key Features

1. **Dashboard & Summary Cards**:
   - Total Income, Total Expenses, and Remaining Net Balance.
   - Monthly Income vs. Expenses comparison bar chart (Recharts).
   - Category-wise Expense distribution donut chart (Recharts).
   - Recent 5 transactions overview.

2. **Income & Expense Tracking**:
   - Clean, validated input forms with live feedback.
   - Interactive category chip selector for expenses.
   - Edit and delete modals with confirmation.

3. **History, Search & Filtering**:
   - Filter by type (`All`, `Income`, `Expenses`).
   - Filter by category (`Food`, `Transportation`, etc.).
   - Filter by `From` and `To` custom date ranges.
   - Instant search across descriptions, categories, and amounts.
   - Pagination controls for high-volume record sets.
   - One-click **Export to CSV** for local spreadsheet analysis.

4. **Analytics & Print-Ready Reports**:
   - Savings rate calculation: `((Income - Expense) / Income) * 100`.
   - 6-month and 12-month timeline switches.
   - Category percentage share table with colored progress bars.
   - Print stylesheet (`@media print`) for clean PDF or paper statement printing.

5. **Security & Data Isolation**:
   - Passwords salted and hashed with `bcryptjs`.
   - JWT stored in `HttpOnly`, `SameSite: strict` cookie (inaccessible to malicious client scripts).
   - Strict database filtering: users only ever query their own records.
   - Helmet protection and rate limiting on authentication routes.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (version 20 or higher recommended)
- MongoDB instance (either local `mongodb://localhost:27017` or free MongoDB Atlas cloud cluster)

### 1. Clone or Open the Repository
```bash
cd c:\Users\Asus\Desktop\expense
```

### 2. Install Dependencies
Run from the root directory to install packages for root, client, and server:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` folder:
```bash
cp server/.env.example server/.env
```

Open `server/.env` and configure:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=my_ultra_secure_secret_key_at_least_32_characters_long
NODE_ENV=development
```

*(If using MongoDB Atlas, replace `MONGODB_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/expense_tracker?retryWrites=true&w=majority`)*

### 4. Run the Application
Start both the backend server (port 5000) and frontend client (port 5173) simultaneously:
```bash
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## ☁️ Deploying to AWS

This project deploys the React/Vite frontend and Express API to one Ubuntu EC2 instance, and stores application data in MongoDB Atlas. GitHub Actions transfers the source archive through a private S3 bucket and runs deployment commands through AWS Systems Manager; the instance does not expose SSH. The files are in `infra/`, `server/ecosystem.config.cjs`, and `.github/workflows/deploy.yml`.

> **HTTPS is required before signing in.** Production auth cookies are `Secure`, so they are not accepted over plain HTTP. Use a domain name and finish Step 7 before registering or logging in.

### 1. Prepare GitHub

1. Create a GitHub repository and push this project to its `main` branch. A **private** repository is fine: Actions uploads only committed files to a private S3 bucket.
2. Confirm `server/.env` is not tracked or committed. It is ignored by `.gitignore`; use GitHub secrets for production values instead.

### 2. Create the AWS infrastructure

1. Choose an AWS region and keep it for all AWS resources in this guide.
2. In the AWS Console, open **CloudFormation → Create stack → With new resources**.
3. Upload `infra/ec2-instance.yaml`, set the stack name to `expense-tracker-prod`, and keep the default `t3.small` instance type.
4. Acknowledge the IAM resource creation prompt and create the stack. Wait for `CREATE_COMPLETE`.
5. Open the stack's **Outputs** tab and note `PublicIP`, `InstanceId`, and `DeploymentBucket`.

The template creates an EC2 instance, a VPC, an Elastic IP, a private artifact bucket, and an instance role. Only web ports 80/443 are open; administration uses Systems Manager. The Elastic IP and EC2 instance are billable, so check current regional pricing and set an AWS budget alert. This setup is not guaranteed to be free-tier eligible.

### 3. Create the MongoDB Atlas database

1. Create an Atlas project and an **M0** cluster, then create a database user with a strong password.
2. In **Network Access**, add the `PublicIP` from the CloudFormation outputs with `/32` (for example `203.0.113.10/32`). Do not leave `0.0.0.0/0` enabled.
3. Copy the Atlas driver URI and use a database name such as `expense_tracker`. URL-encode special characters in the database username or password.

### 4. Configure GitHub Actions secrets and variables

In the GitHub repository, open **Settings → Secrets and variables → Actions** and add these repository secrets:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | An AWS access key with permissions to read this stack, upload objects to its deployment bucket, write the two SSM parameters, and run/read Systems Manager commands |
| `AWS_SECRET_ACCESS_KEY` | Matching AWS secret key |
| `AWS_SESSION_TOKEN` | Required for temporary credentials such as AWS Academy/Learner Lab; use a repository secret with this name |
| `MONGODB_URI` | Atlas connection URI for `expense_tracker` |
| `JWT_SECRET` | A randomly generated secret with at least 32 characters |

Add a repository **variable** named `AWS_REGION` with the region used for the CloudFormation stack. Never use root-account access keys. Temporary lab credentials expire; update all three AWS credential secrets when they are renewed.

### 5. Deploy the application

Push a commit to `main`, or open **Actions → Test and deploy SpendWell → Run workflow**. The workflow installs dependencies, runs the server tests, builds the frontend, stores production secrets as encrypted SSM parameters, uploads the committed source to S3, and deploys through SSM.

The first run can take several minutes. Its logs show the instance IP. The workflow fails with a health-check error if the backend cannot connect to Atlas; confirm the Atlas `/32` entry and `MONGODB_URI`, then rerun the workflow.

### 6. Point a domain to the instance

Use a domain you control. Create an **A record** for the app hostname (for example `app.example.com`) pointing to the CloudFormation `PublicIP`. Wait until DNS resolves to that address. Do not create an AAAA record unless IPv6 has also been configured.

### 7. Enable HTTPS

In the AWS Console, open **Systems Manager → Run Command**, choose document `AWS-RunShellScript`, select the instance from the stack outputs, and run the following command after replacing the domain and email:

```bash
sudo certbot --nginx -d app.example.com -m you@example.com --agree-tos --redirect --no-eff-email
```

Certbot updates the Nginx configuration and enables automatic certificate renewal. The deployment script deliberately does not overwrite that configuration after its first setup. Open `https://app.example.com/api/health`; it should return JSON with `"database":"connected"`. The site is now ready for registration and login.

### 8. Verify and troubleshoot

- GitHub **Actions** shows the test and deployment result.
- `https://app.example.com/` loads the frontend; `https://app.example.com/api/health` checks the API and database.
- If SSM reports the instance offline, check the CloudFormation stack events and Systems Manager instance status.
- If the health check fails, check Atlas network access, the URI, and the PM2 output included in the failed command. Do not put production credentials in source files or commit `.env`.
- For later deployments, push to `main`; the same workflow tests and redeploys the application.

---

## 🧪 Running Automated Tests

The backend includes a comprehensive, standalone integration test suite powered by Node's built-in test runner and `mongodb-memory-server` (does not touch your real database):

```bash
# Run tests from project root
npm test
```

### Test Coverage Summary:
- **`auth.test.js`** (6 tests): Connection, password hashing, token validation, protected sessions, unauthorized rejections.
- **`transactions.test.js`** (19 tests): Income CRUD, Expense CRUD, validation rules, dashboard aggregations, report generation, dynamic recalculation, and multi-user data isolation.
- **Total**: **25 passing tests (100% pass rate)**.

---

## 🎓 College Viva & Demonstration Guide

### Quick Demonstration Steps:
1. **Landing Page Experience**: Explore the Dark Luxury landing page with the floating dashboard illustration, feature cards, and 3-step workflow.
2. **Registration & Login**: Register a new user (`Alice`, `alice@example.com`) or log in with the dark luxury modal with password visibility toggle (`👁️`).
3. **Light Luxury Dashboard**: Notice the transition into the light luxury workspace (`#F5F1F7` background, rounded white cards, time-aware greeting).
4. **Add Income**: Add a salary entry (रु. 50,000 on current date). Notice the dashboard balance immediately updates to +रु. 50,000.
5. **Add Expenses**: Add multiple categorized expenses (रु. 3,500 Food, रु. 1,500 Transportation, रु. 4,200 Bills).
6. **Charts in Action**: Navigate to **Dashboard** and **Reports** to showcase Recharts rendering the monthly income vs. expense comparison bar chart and category donut chart in Nepali Rupees.
7. **Filtering, Search & CSV Export**: Open **Transactions**, filter by category "Food", search for a keyword, and export records as a `.csv` file formatted with NPR currency columns.
8. **Security Demonstration**: Log out, register user `Bob` (`bob@example.com`), and verify Bob sees an empty private space with none of Alice's records.

### Common Viva Questions & Answers:

**Q1: Why did you store the JWT in an HttpOnly cookie instead of localStorage?**  
> *Answer*: Storing JWTs in `localStorage` makes them vulnerable to Cross-Site Scripting (XSS) attacks where malicious JavaScript can read the token. Using an `HttpOnly` cookie with `SameSite: strict` ensures the token is managed by the browser and cannot be accessed via JavaScript.

**Q2: How do you ensure one user cannot see another user's financial transactions?**  
> *Answer*: Every transaction document stores a `user` ObjectId referencing the owning user. The authentication middleware verifies the JWT, resolves the user's ID, and all database queries (`find`, `findOneAndUpdate`, `findOneAndDelete`) enforce `{ user: req.user._id }`.

**Q3: How are monthly totals computed for the charts?**  
> *Answer*: When the client requests `/api/transactions/summary` or `/api/transactions/reports`, the server queries the user's transactions and dynamically aggregates totals into monthly time buckets and category maps on the fly before sending the response to Recharts.

**Q4: What is the purpose of the compound index in MongoDB?**  
> *Answer*: We added `transactionSchema.index({ user: 1, date: -1 })`. Because queries frequently filter by `user` and sort by `date` descending, a compound index allows MongoDB to fulfill both operations directly from memory without doing an expensive in-memory sort.

---

## 📄 License
This project is open-source and free to use for educational and academic project purposes.
