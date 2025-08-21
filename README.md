# AnnMitra

AnnMitra is a food sharing platform that helps reduce food waste by connecting food providers (canteens, restaurants) with community members who can claim and pick up excess food.

## Features

- 🍽️ **Food Listing**: Canteens can list available food items with photos
- 🔍 **Browse & Claim**: Users can browse and claim available food
- 👥 **Role-based Access**: Different dashboards for canteens and regular users
- 📱 **Real-time Updates**: Live updates on food availability
- 🔐 **Secure Authentication**: Powered by Clerk
- ☁️ **Cloud Storage**: Image uploads via Supabase Storage

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Clerk account for authentication
- A Supabase account for database and storage

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd AnnMitra
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser** to [http://localhost:3000](http://localhost:3000)

### Database Setup

1. **Create tables** by running the SQL in `src/lib/schema.sql` in your Supabase SQL Editor
2. **Create storage bucket** by running the SQL in `fix-rls-simple.sql`

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── browse/            # Browse food listings
│   ├── dashboard/         # User dashboard
│   ├── listings/          # Food listing management
│   ├── pickups/           # Pickup management
│   └── profile/           # User profile
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   └── schema.sql        # Database schema
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

**AnnMitra** - *Reducing food waste, one meal at a time.*
