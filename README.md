# 🍽️ AnnMitra - Campus Food Sharing Platform

> **Reduce Food Waste, Feed Your Community**

AnnMitra is a modern, full-stack web application that connects surplus food from campus canteens with students and NGOs. Built with Next.js 15, it transforms food waste into community meals while creating positive environmental impact.

![AnnMitra Landing Page](./public/Screenshot.png)

## ✨ Key Features

### 🔐 **Complete Authentication System**
- Secure user authentication powered by Clerk
- Role-based access (Students, Faculty, Staff, NGOs)
- Profile management with campus affiliation

### 🗺️ **Interactive Food Discovery** 
- Real-time map view with food locations
- Location-based filtering and search
- Precise pickup location coordinates

### 📱 **Smart Notifications**
- Real-time push notifications via Firebase FCM
- In-app notification center with backdrop blur
- Mobile-optimized notification dropdowns

### 📊 **Advanced Analytics**
- Public impact statistics
- Surplus analysis for campus partners
- CSV data upload and AI-driven insights
- Interactive charts and visualizations

### 🎯 **Intelligent Food Listing**
- Safety window calculations (auto-expiry)
- Status management (Available/Unavailable)
- Image uploads with automatic optimization
- Dietary tags and allergen information

### 🌐 **Progressive Web App (PWA)**
- Offline support and service workers
- Install prompt for mobile devices
- Native app-like experience

### 🎨 **Professional UI/UX**
- Glass morphism design system
- Dark theme with backdrop blur effects
- Fully responsive across all devices
- Industry-standard visual hierarchy

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS v4 with glass morphism
- **UI Components**: Custom component library
- **Charts**: Chart.js + Recharts for analytics

### Backend & Database
- **Database**: Supabase (PostgreSQL) with Row-Level Security
- **Authentication**: Clerk with role-based access
- **Storage**: Supabase Storage for image uploads
- **Real-time**: Supabase Realtime subscriptions

### Maps & Location
- **Maps**: Leaflet + React-Leaflet
- **Geocoding**: OpenStreetMap Nominatim API
- **Location Services**: Browser Geolocation API

### Notifications & PWA
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Service Worker**: Custom PWA implementation
- **Offline Support**: Next.js offline capabilities

### Development & Deployment
- **Package Manager**: npm
- **Linting**: ESLint with TypeScript rules
- **Deployment**: Vercel-optimized
- **Environment**: Cross-platform (.env configuration)

## � Use Cases

### For Students
- **Discover surplus food** from campus canteens at discounted prices
- **Share extra food** from meal plans or events
- **Connect with peers** through food sharing
- **Track environmental impact** of waste reduction

### For Campus Partners (Canteens)
- **Analyze food waste patterns** with CSV upload
- **Get AI-powered recommendations** for waste reduction
- **Reach students directly** with surplus notifications
- **Track operational efficiency** with analytics

### For NGOs
- **Access surplus food** for community programs
- **Coordinate pickups** with automated notifications
- **Scale impact** through campus partnerships
- **Monitor food rescue metrics**

## �🚀 Quick Start

### Prerequisites

- Node.js 18.17+ or 20.0+
- npm 9+ (or yarn/pnpm)
- Modern web browser with JavaScript enabled
- Accounts: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Firebase](https://firebase.google.com)

### 1. Clone & Install

```bash
git clone https://github.com/samarthyaveer/AnnMitra.git
cd AnnMitra
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local` with your service credentials:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Database & Storage
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Firebase Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BF9xQ8wP...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Go to SQL Editor in your Supabase dashboard
3. Run the database schema:

```sql
-- Copy and execute the contents of src/lib/schema.sql
```

4. Create storage bucket:
   - Go to Storage → Create new bucket
   - Name: `food-images`
   - Make it public

### 4. Firebase Setup

1. Create Firebase project
2. Enable Cloud Messaging
3. Generate Web Push certificates
4. Download service account JSON
5. Extract private key and other credentials

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

### 6. Production Build

```bash
npm run build
npm start
```

## 📁 Project Architecture

```
AnnMitra/
├── 📁 src/
│   ├── 📁 app/                     # Next.js 15 App Router
│   │   ├── 📁 api/                # API Routes & Server Actions
│   │   │   ├── analytics/         # Public & internal analytics
│   │   │   ├── listings/          # Food listing CRUD
│   │   │   ├── notifications/     # Push notification handlers
│   │   │   ├── pickups/           # Pickup management
│   │   │   ├── surplus/           # CSV upload & AI analysis
│   │   │   └── users/             # User management
│   │   ├── 📁 auth/               # Authentication pages
│   │   ├── 📁 browse/             # Food discovery & filtering
│   │   ├── 📁 dashboard/          # User dashboard with analytics
│   │   ├── 📁 listings/           # Food listing management
│   │   ├── 📁 map/                # Interactive map interface
│   │   ├── 📁 notifications/      # Notification center
│   │   ├── 📁 pickups/            # Pickup coordination
│   │   ├── 📁 profile/            # User profile management
│   │   ├── 📁 surplus/            # Partner analytics portal
│   │   ├── layout.tsx             # Root layout with providers
│   │   ├── page.tsx               # Landing page
│   │   └── globals.css            # Global styles with glass morphism
│   ├── 📁 components/             # Reusable UI Components
│   │   ├── Header.tsx             # Navigation with glassmorphism
│   │   ├── LocationPicker.tsx     # Map-based location selection
│   │   ├── MapComponent.tsx       # Leaflet map integration
│   │   ├── NotificationDropdown.tsx # Smart notification UI
│   │   └── analytics/             # Chart components
│   ├── 📁 contexts/               # React Context Providers
│   │   └── NotificationContext.tsx # Global notification state
│   ├── 📁 hooks/                  # Custom React Hooks
│   │   ├── useNotifications.ts    # Firebase FCM integration
│   │   ├── usePWA.ts             # PWA functionality
│   │   └── useRealtime.ts        # Supabase realtime
│   └── 📁 lib/                    # Core Utilities & Configuration
│       ├── schema.sql             # Complete database schema
│       ├── supabase.ts           # Supabase client setup
│       ├── firebase.ts           # Firebase configuration
│       ├── transaction-analyzer.ts # AI analysis engine
│       └── types.ts              # TypeScript definitions
├── 📁 public/                     # Static Assets
│   ├── manifest.json             # PWA manifest
│   ├── firebase-messaging-sw.js  # Service worker
│   ├── screenshot.png            # Landing page preview
│   └── icons/                    # PWA icons
├── .env.example                  # Environment template
├── package.json                  # Dependencies & scripts
├── tailwind.config.js           # Tailwind CSS v4 config
└── tsconfig.json                # TypeScript configuration
```

## 🎯 Core Features Deep Dive

### 📊 Advanced Analytics System
- **Public Impact Dashboard**: Real-time community statistics
- **Partner Portal**: CSV upload for transaction history analysis
- **AI-Powered Insights**: Smart recommendations for waste reduction
- **Interactive Charts**: Visual data representation with Chart.js

### 🔔 Smart Notification System  
- **Real-time Push Notifications**: Firebase FCM integration
- **In-app Notification Center**: Backdrop blur UI with smart positioning
- **Contextual Alerts**: Pickup reminders, new listings, status updates
- **Mobile-Optimized**: Perfect viewport positioning on all devices

### 🗺️ Location Intelligence
- **Interactive Maps**: Leaflet with custom styling
- **Geocoding**: Reverse address lookup
- **Location Picker**: Precise coordinate selection
- **Distance Calculation**: Proximity-based filtering

### 📱 Progressive Web App
- **Offline Support**: Service worker caching
- **Install Prompts**: Native app-like installation
- **Mobile Optimization**: Touch-friendly interfaces
- **Cross-Platform**: Works on all devices and browsers

## � Development

### Available Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint code checking
npm run type-check   # TypeScript type checking
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks (optional)

### Database Migrations

The project includes a database migration system:

```sql
-- Example: migrations/001_update_status_constraint.sql
ALTER TABLE listings 
DROP CONSTRAINT IF EXISTS listings_status_check;

ALTER TABLE listings 
ADD CONSTRAINT listings_status_check 
CHECK (status IN ('available', 'unavailable'));
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork & Clone**
   ```bash
   git fork https://github.com/samarthyaveer/AnnMitra.git
   cd AnnMitra
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow TypeScript best practices
   - Add tests for new features
   - Update documentation

4. **Submit Pull Request**
   ```bash
   git commit -m "Add amazing feature"
   git push origin feature/amazing-feature
   ```

### Contribution Guidelines

- **Code Style**: Follow existing patterns and ESLint rules
- **Commits**: Use conventional commit messages
- **Testing**: Add tests for new functionality
- **Documentation**: Update README and inline comments

## 💡 Use Cases

### For Students
- **Discover surplus food** from campus canteens at discounted prices
- **Share extra food** from meal plans or events
- **Connect with peers** through food sharing
- **Track environmental impact** of waste reduction

### For Campus Partners (Canteens)
- **Analyze food waste patterns** with CSV upload
- **Get AI-powered recommendations** for waste reduction
- **Reach students directly** with surplus notifications
- **Track operational efficiency** with analytics

### For NGOs
- **Access surplus food** for community programs
- **Coordinate pickups** with automated notifications
- **Scale impact** through campus partnerships
- **Monitor food rescue metrics**

## 🆘 Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Environment Variables:**
- Ensure all required variables are set
- Check for typos in variable names
- Verify API keys are active

**Database Connectivity:**
- Confirm Supabase project is active
- Check RLS policies are enabled
- Verify service role key permissions

**Push Notifications:**
- Ensure VAPID keys are correctly configured
- Check Firebase project settings
- Verify service worker registration

### Getting Help

1. 📚 **Check Documentation**: Review this README thoroughly
2. 🔍 **Search Issues**: Look through [GitHub Issues](../../issues)
3. 🆕 **Create Issue**: Report bugs with reproduction steps
4. 💬 **Community**: Join our discussions

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
- Next.js: MIT License
- React: MIT License  
- Tailwind CSS: MIT License
- Leaflet: BSD 2-Clause License
- Chart.js: MIT License

## 🙏 Acknowledgments

- **Next.js Team** for the incredible framework
- **Supabase** for the backend-as-a-service platform  
- **Clerk** for seamless authentication
- **Firebase** for reliable push notifications
- **Leaflet** for powerful mapping capabilities
- **Tailwind CSS** for the utility-first styling approach

---

<div align="center">

**Made with ❤️ for sustainable campus communities**

[🌐 Website](https://annmitra.vercel.app) • [📧 Contact](mailto:contact@annmitra.app) • [🐛 Report Bug](../../issues) • [💡 Request Feature](../../issues)

</div>
