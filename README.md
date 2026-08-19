# ♻️ EcoCycle — Turn Waste into Value

**EcoCycle** is a web platform that connects waste generators (sellers) with responsible recyclers (buyers). Our mission: *Clean Earth, Better Tomorrow.*

---

## 🌟 Overview

EcoCycle bridges the gap between people who have waste materials and recyclers who need them. Whether you're a household looking to dispose of plastic, paper, or e-waste — or a recycler seeking raw materials — EcoCycle makes the connection seamless, secure, and impactful.

---

## 🚀 Features

- **Home** — Landing page with hero section, category browsing, and how-it-works overview
- **About Us** — Our story, mission & vision, core values, and environmental impact
- **How It Works** — Step-by-step guide for sellers and buyers
- **Categories** — Browse waste categories (plastic, paper, metal, e-waste, organic, glass, etc.)
- **Impact** — Environmental stats and sustainability metrics
- **Contact** — Get in touch with the EcoCycle team
- **Auth** — User Login & Signup for sellers and buyers
- **Responsive Design** — Fully responsive across mobile, tablet, and desktop

---

## 🛠️ Tech Stack

### Frontend (`client/`)

| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **TanStack Router** | Type-safe client-side routing |
| **TanStack React Query** | Server state management |
| **Lucide React** | Icon library |
| **Poppins** | Google Font (typography) |

### Backend (`server/`)

> Server-side is currently under development.

---

## 📁 Project Structure

```
EcoCycle/
├── client/                  # React frontend
│   ├── public/              # Static assets (favicon, icons)
│   ├── src/
│   │   ├── assets/          # Images (hero, about, process illustrations)
│   │   ├── components/
│   │   │   ├── cards/       # Reusable card components
│   │   │   ├── common/      # Shared UI (Logo, SocialIcons, ImageWithFallback)
│   │   │   └── sections/    # Page sections (Navbar, Hero, Footer, etc.)
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/
│   │   │   ├── About/
│   │   │   ├── Auth/        # Login.jsx, Signup.jsx
│   │   │   ├── Categories/
│   │   │   ├── Contact/
│   │   │   ├── Home/
│   │   │   ├── HowItWorks/
│   │   │   └── Impact/
│   │   ├── routes/          # TanStack Router setup
│   │   ├── services/        # API service layer
│   │   ├── App.jsx
│   │   ├── index.css        # Tailwind config + brand theme
│   │   └── main.jsx
│   ├── scripts/             # Dev utility scripts
│   ├── screenshots/         # App screenshots for documentation
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── server/                  # Backend (coming soon)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/krushna2763/EcoCycle.git
cd EcoCycle

# Install client dependencies
cd client
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🌍 Environmental Impact

EcoCycle is built with sustainability in mind. By connecting waste generators directly with recyclers, we reduce:

- 🗑️ **Landfill waste** — Materials get recycled instead of discarded
- 🌫️ **Carbon emissions** — Fewer transportation miles through local matching
- 💧 **Resource waste** — Raw materials are reused, reducing extraction
- 🌳 **Deforestation** — Paper recycling saves trees

---

## 📸 Screenshots

Screenshots of the application can be found in `client/screenshots/`.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Krushna** — [GitHub](https://github.com/krushna2763)

---

> *Clean Earth, Better Tomorrow* 🌱♻️
