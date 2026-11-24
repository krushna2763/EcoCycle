# ♻️ EcoCycle — Turn Waste into Value

**EcoCycle** is a full-stack digital marketplace connecting waste generators (**Sellers**) with responsible recycling facilities and bulk material purchasers (**Buyers**), supervised by platform administrators (**Admins**). Our mission: *Clean Earth, Better Tomorrow.* 🌱

---

## 🌟 Overview

EcoCycle bridges the gap between individuals or businesses generating plastic waste and responsible recyclers who process scrap into reusable commodities. By providing verified listings, real-time messaging, pickup scheduling, moderation workflows, and transparent sustainability tracking, EcoCycle makes plastic recycling seamless, secure, and impactful.

---

## 🚀 Features by Role

### 1. 📦 Seller Module
- **Registration & Role-Based Login** — Onboarding for individual sellers and commercial businesses.
- **Listing Management** — Create, edit, and delete plastic waste listings with photos, plastic polymer grades (PET, HDPE, LDPE, PP, PVC, PS, Mixed), location, condition, and pricing.
- **Moderation Feedback & Resubmission** — View admin remarks on rejected listings, edit required details, and resubmit for approval.
- **Request Management** — Accept or reject purchase offers from buyers; acceptance automatically reserves listing quantity.
- **Pickup Scheduling & Collections** — Set pickup dates and locations; mark collections as completed to track recycled kilograms.
- **Real-Time Communication** — Chat directly with interested buyers via Socket.IO WebSocket messaging.
- **Notifications & Settings** — Instant status change alerts, unread counts, and privacy preferences.

### 2. 🏭 Buyer / Recycler Module
- **Browse Marketplace** — Search and filter approved plastic listings by material type, location, price, and availability.
- **Listing Details & Direct Requests** — Inspect high-resolution photos, seller profile details, and send custom quantity/offer requests.
- **Request Tracking** — Dedicated tabs for Pending, Accepted, Completed, and Declined purchase requests.
- **Collection Coordination** — Receive pickup schedules and mark completed collections.
- **Real-Time Messaging** — Real-time negotiation and coordination with sellers.

### 3. 🛡️ Admin Moderation Module
- **Platform Analytics Dashboard** — Real-time metrics for total users (sellers vs buyers), active vs pending listings, total purchase requests, completed collections, and total kilograms recycled.
- **Moderation Queue** — Review submitted listings before they appear on the public marketplace.
- **Listing Approval & Rejection** — One-click approval to publish live, or structured rejection with mandatory feedback remarks (min 10 characters) sent to the seller.
- **User Management** — View all registered sellers, buyers, and administrators with role filtering and account verification indicators.

### 4. 🌐 Public Experience
- **Informational Pages** — Home, About Us, How It Works, Plastic Categories, Environmental Impact, and Contact Us.
- **Responsive Layout** — Tailored design for mobile, tablet, and desktop viewports.

---

## 🛠️ Technology Stack

### Frontend (`client/`)
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | Core user interface library |
| **Vite** | 8.2 | Build tool, HMR, and development server |
| **Tailwind CSS** | 4.3 | Utility-first responsive styling and brand theming |
| **TanStack Router** | 1.170 | Type-safe client-side routing with lazy code splitting |
| **TanStack React Query** | 5.101 | Asynchronous server state caching and synchronization |
| **Lucide React** | 1.31 | Clean, modern iconography |
| **Socket.IO Client** | 4.8 | Real-time WebSocket connection for chat and notifications |

### Backend (`server/`)
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | >= 18 | JavaScript runtime environment |
| **Express** | 4.21 | REST API framework |
| **MongoDB & Mongoose** | 8.6 | Document database & Object Data Modeling (ODM) |
| **JSON Web Tokens (JWT)** | 9.0 | Stateless authentication with versioned token revocation |
| **bcryptjs** | 2.4 | Cryptographic salt generation and password hashing |
| **Socket.IO** | 4.8 | Real-time bi-directional event communication |
| **Helmet** | 8.3 | Security HTTP headers |
| **express-rate-limit** | 8.6 | API abuse protection (300 req/15 min; 20 req/15 min for auth) |
| **express-validator** | 7.3 | Strict request body and query parameter validation |
| **Multer** | 2.4 | Multipart image file uploads |

---

## 🗄️ Database Information

EcoCycle uses **MongoDB** (compatible with MongoDB Atlas or local standalone instances).

### Data Collections:
1. **`sellers`** — User accounts across all roles (`seller`, `buyer`, `admin`), profile data, verification state, and `tokenVersion`.
2. **`listings`** — Scrap plastic listings, quantities, unit prices, location, photos, `status` (`pending`, `approved`, `rejected`), `rejectionRemarks`, and review metadata.
3. **`requests`** — Buyer purchase requests, held quantities, pickup schedules, and transition history.
4. **`messages`** — Chat logs exchanged between buyers and sellers.
5. **`notifications`** — In-app alerts for listing reviews, incoming requests, and pickups.
6. **`settings`** — User notification channels and privacy visibility settings.

---

## 📁 Project Directory Structure

```
EcoCycle/
├── client/                          # React 19 Frontend
│   ├── public/                      # Static assets and icons
│   ├── src/
│   │   ├── assets/                  # Brand graphics and illustrations
│   │   ├── components/
│   │   │   ├── admin-dashboard/     # AdminSidebar, AdminTopNavbar
│   │   │   ├── buyer-dashboard/     # BuyerSidebar, BuyerTopNavbar
│   │   │   ├── common/              # ProtectedRoute, PageLoading, Logo, FormField
│   │   │   ├── sections/            # Landing page and informational sections
│   │   │   └── seller-dashboard/    # DashboardStats, Listings, Requests, Sidebar
│   │   ├── context/                 # AuthContext (role state, login/logout)
│   │   ├── hooks/                   # useApi, useLiveUpdates, useNotificationFeed
│   │   ├── lib/                     # listings, format, requests utilities
│   │   ├── pages/
│   │   │   ├── About/               # About Us page
│   │   │   ├── Admin/               # AdminDashboard, PendingListings, ReviewListing, AdminUsers
│   │   │   ├── Auth/                # Login, Signup, Seller/Buyer Registration
│   │   │   ├── Buyer/               # BuyerDashboard, BrowseListings, Details, Requests
│   │   │   ├── Categories/          # Plastic Categories explorer
│   │   │   ├── Contact/             # Contact Us page
│   │   │   ├── Home/                # Main Landing page
│   │   │   ├── HowItWorks/          # Step-by-step workflow guide
│   │   │   ├── Impact/              # Environmental metrics page
│   │   │   └── Seller/              # SellerDashboard, MyListings, AddListing, Collections
│   │   ├── routes/                  # TanStack Router layouts and definitions
│   │   ├── services/                # api.js (HTTP client), socket.js (WebSocket client)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── server/                          # Express Backend
    ├── config/                      # db.js (Mongoose connect), jwtSecret.js
    ├── controllers/                 # admin, auth, buyer, message, seller, settings, uploads
    ├── middleware/                  # auth.js (protect, requireRole), validate.js, errorHandler.js
    ├── models/                      # Seller, Listing, Request, Message, Notification, Settings
    ├── routes/                      # admin, auth, buyer, messages, notifications, seller, settings
    ├── tests/                       # Automated node:test regression suite
    ├── utils/                       # listingVisibility, notifications, requestStatus, realtime
    ├── createAdmin.js               # CLI script for provisioning admin accounts
    ├── index.js                     # Server entry point with Socket.IO
    ├── package.json
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or a MongoDB Atlas cloud cluster)

### 1. Installation

Clone the repository and install dependencies for both `server` and `client`:

```bash
# Clone the repository
git clone https://github.com/krushna2763/EcoCycle.git
cd EcoCycle

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Create `.env` inside the `server/` directory:

```bash
cd server
cp .env.example .env
```

Configure your variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ecocycle
JWT_SECRET=your_long_random_jwt_secret_key_minimum_32_characters
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
REQUIRE_LISTING_APPROVAL=true
```

Create `.env` inside the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Create Admin Account

Run the automated provisioning script to seed an administrator account:

```bash
cd server
npm run create-admin
```

Default credentials:
- **Email:** `admin@ecocycle.com`
- **Password:** `Admin@123456`
*(You can customize these via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`).*

### 4. Running the Development Servers

Start the backend:
```bash
cd server
npm run dev
# Backend listening on http://127.0.0.1:5000
```

In a separate terminal, start the frontend:
```bash
cd client
npm run dev
# Frontend ready on http://localhost:5173
```

---

## 🔑 Authentication & User Roles

Authentication uses **Bearer JWT tokens** stored in client `localStorage` and sent in the `Authorization` header.

| Role | Access Permissions | Landing URL |
|---|---|---|
| **Seller** | Add/edit listings, accept/reject buyer requests, schedule pickups, mark collections | `/seller/dashboard` |
| **Buyer** | Browse approved marketplace listings, submit purchase requests, complete pickups | `/buyer/dashboard` |
| **Admin** | Moderation queue, approve/reject listings with remarks, platform statistics, user directory | `/admin/dashboard` |

Public registration endpoints only allow creating `seller` or `buyer` accounts. Admin accounts cannot be self-registered through the UI and must be created via the `npm run create-admin` script.

---

## 📡 API Endpoint Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new seller or buyer
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Fetch current user profile
- `PUT /api/auth/me` — Update personal or business profile
- `POST /api/auth/verify-password` — Validate current password
- `POST /api/auth/update-password` — Change password and cycle JWT version

### Admin Moderation (`/api/admin`) *(Requires role: 'admin')*
- `GET /api/admin/dashboard/stats` — Platform summary statistics
- `GET /api/admin/listings` — List pending listings awaiting review
- `GET /api/admin/listings/:id` — Inspect listing details, seller profile, and request counts
- `PUT /api/admin/listings/:id/approve` — Approve listing for buyer marketplace
- `PUT /api/admin/listings/:id/reject` — Reject listing with required remarks (min 10 chars)
- `GET /api/admin/users` — Paginated user directory with role filtering

### Seller Operations (`/api/seller`) *(Requires role: 'seller')*
- `GET /api/seller/dashboard/stats` — Seller listings & recycling statistics
- `GET /api/seller/listings` — List seller's own listings with status counts
- `POST /api/seller/listings` — Create a new listing (starts in `pending` status)
- `GET /api/seller/listings/:id` — Get single listing
- `PUT /api/seller/listings/:id` — Edit/resubmit listing (resets to `pending`, clears rejection remarks)
- `DELETE /api/seller/listings/:id` — Delete unreserved listing
- `GET /api/seller/requests` — View incoming purchase requests
- `PUT /api/seller/requests/:id/accept` — Accept buyer request (reserves quantity)
- `PUT /api/seller/requests/:id/reject` — Decline buyer request
- `PUT /api/seller/requests/:id/schedule` — Schedule pickup date/time
- `PUT /api/seller/requests/:id/status` — Advance collection status (`in_progress`, `completed`, `cancelled`)

### Buyer Operations (`/api/buyer`) *(Requires role: 'buyer')*
- `GET /api/buyer/dashboard/stats` — Buyer request and acquisition metrics
- `GET /api/buyer/listings` — Marketplace listings (approved + available quantity)
- `GET /api/buyer/listings/:id` — Single listing detail view
- `POST /api/buyer/requests` — Submit purchase request
- `GET /api/buyer/requests` — View sent requests
- `PUT /api/buyer/requests/:id/cancel` — Withdraw pending request
- `PUT /api/buyer/requests/:id/complete` — Confirm pickup completed

### Real-Time & Utilities
- `/api/messages` — Conversation threads and cursor-paginated chat messages
- `/api/notifications` — In-app alerts, unread counts, and mark-as-read endpoints
- `/api/uploads` — Multipart photo uploading with automatic thumbnail generation
- `/api/health` — API health check probe

---

## 🧪 Testing

The backend includes a comprehensive automated test suite powered by `node:test`:

```bash
cd server
npm test
```

Tests cover:
- Admin authentication and role guards
- Listing moderation approval and rejection validation
- Seller resubmission workflow and status resets
- Buyer marketplace visibility rules (`REQUIRE_LISTING_APPROVAL`)
- Reserved quantity calculations and race-condition prevention
- Password management, bcrypt hashing, and token versioning

---

## 📸 Screenshots

Screenshots of the application interfaces are stored in `client/screenshots/`.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/MyFeature`)
3. Commit your changes (`git commit -m 'Add MyFeature'`)
4. Push to your branch (`git push origin feature/MyFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

> *Clean Earth, Better Tomorrow* 🌱♻️
