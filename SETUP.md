# 🚀 Quick Setup Guide for AnnMitra

Follow these steps to get AnnMitra running on your local machine.

## 📋 Prerequisites

Before you start, make sure you have:
- [Node.js 18+](https://nodejs.org/) installed
- [Git](https://git-scm.com/) installed
- Accounts on:
  - [Clerk](https://clerk.com) (for authentication)
  - [Supabase](https://supabase.com) (for database)
  - [Firebase](https://firebase.google.com) (for push notifications)

## 🔧 Setup Steps

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd annmitra
npm install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env.local

# Check what variables you need to set
npm run check-env
```

### 3. Fill in Environment Variables

Edit `.env.local` with your actual service credentials:

#### Clerk (Authentication)
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your keys to `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

#### Supabase (Database)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy your keys to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### Firebase (Push Notifications)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Cloud Messaging
4. Generate Web Push certificates
5. Download service account JSON
6. Copy credentials to `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_PRIVATE_KEY`

### 4. Database Setup

1. In Supabase Dashboard, go to SQL Editor
2. Copy and run the contents of `src/lib/schema.sql`
3. Go to Storage and create a bucket named `food-images`
4. Set the bucket to public

### 5. Verify Setup

```bash
# Check if all environment variables are set
npm run check-env

# If everything is OK, start the development server
npm run dev
```

### 6. Open Your Browser

Visit [http://localhost:3000](http://localhost:3000) to see AnnMitra in action!

## 🎯 Troubleshooting

### Environment Variables Not Set
Run `npm run check-env` to see which variables are missing.

### Database Connection Issues
- Check your Supabase URL and keys
- Make sure you've run the database schema
- Verify RLS policies are enabled

### Authentication Issues
- Check your Clerk keys
- Verify your domain is added to Clerk's allowed origins

### Push Notifications Not Working
- Check Firebase configuration
- Verify VAPID key is correct
- Make sure service worker is registered

## 📚 Need More Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the configuration guides for each service
- Create an issue if you encounter problems

---

Happy coding! 🎉
