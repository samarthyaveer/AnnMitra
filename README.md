# 🍽️ AnnMitra - Campus Food Sharing Platform

AnnMitra is a modern, full-stack web application for sharing food within campus communities. Built with Next.js 15, it enables students and faculty to share surplus food, reducing waste while building community connections.

## ✨ Features

- 🔐 **Secure Authentication** - Powered by Clerk
- 🗺️ **Interactive Maps** - Location-based food sharing with Leaflet
- � **Real-time Notifications** - Firebase Cloud Messaging for instant updates
- 🎯 **Location Picker** - Precise food pickup locations
- � **Role-based Dashboards** - Different views for students, faculty, and staff
- � **Row-level Security** - Secure data access with Supabase RLS
- � **Mobile Responsive** - Works perfectly on all devices
- 🚀 **Production Ready** - Optimized for deployment

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Maps**: Leaflet + React-Leaflet
- **Push Notifications**: Firebase Cloud Messaging
- **Real-time**: Supabase Realtime

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Accounts on: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Firebase](https://firebase.google.com)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd annmitra
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```bash
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Firebase Configuration (for push notifications)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_firebase_vapid_key_here

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id_here
FIREBASE_CLIENT_EMAIL=your_firebase_client_email_here
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id_here
FIREBASE_PRIVATE_KEY="your_firebase_private_key_here"
```

### 4. Set Up Database

Run the database schema in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `src/lib/schema.sql`

### 5. Configure Storage

1. In Supabase Dashboard, go to Storage
2. Create a new bucket named `food-images`
3. Set the bucket to public

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 app router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── browse/            # Browse food listings
│   ├── dashboard/         # User dashboard
│   ├── listings/          # Food listings management
│   ├── map/               # Interactive map view
│   ├── pickups/           # Pickup management
│   └── profile/           # User profile
├── components/            # Reusable React components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
└── lib/                   # Utility functions and configs
```

## 🔧 Configuration Guide

### Clerk Authentication Setup

1. Create a [Clerk](https://clerk.com) account
2. Create a new application
3. Copy your publishable and secret keys
4. Configure sign-in/sign-up redirects

### Supabase Database Setup

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL schema from `src/lib/schema.sql`
3. Enable Row Level Security (RLS)
4. Create storage bucket for images

### Firebase Push Notifications Setup

1. Create a [Firebase](https://firebase.google.com) project
2. Enable Cloud Messaging
3. Generate Web Push certificates (VAPID)
4. Download service account JSON
5. Extract credentials to environment variables

## 🚀 Deployment

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Railway**: Project Settings → Variables

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [GitHub Issues](../../issues) for existing solutions
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🎯 Features in Development

- [ ] Advanced filtering and search
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

Made with ❤️ for campus communities worldwide.
