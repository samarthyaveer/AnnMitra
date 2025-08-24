// Types for AnnMitra

export interface User {
  id: string
  clerk_id: string
  name: string
  role: 'canteen' | 'student' | 'ngo' | 'admin'
  email: string
  phone?: string
  organization_name?: string
  campus_location?: string
  campus_location_lat?: number
  campus_location_lng?: number
  fcm_token?: string // For push notifications
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  owner_id: string
  title: string
  description?: string
  food_type?: string
  quantity: number
  quantity_unit: string
  safety_window_hours: number
  available_from: string
  available_until?: string
  pickup_location_lat?: number
  pickup_location_lng?: number
  address?: string
  image_url?: string
  status: 'available' | 'claimed' | 'picked_up' | 'unavailable' | 'cancelled'
  created_at: string
  updated_at: string
  owner?: User // populated via join
}

export interface Pickup {
  id: string
  listing_id: string
  claimer_id: string
  status: 'pending' | 'confirmed' | 'collected' | 'cancelled'
  claimed_at: string
  confirmed_at?: string
  collected_at?: string
  pickup_code?: string
  notes?: string
  listing?: Listing // populated via join
  claimer?: User // populated via join
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'listing_claimed' | 'pickup_confirmed' | 'pickup_ready' | 'pickup_completed' | 'listing_unavailable'
  data?: Record<string, string>
  read: boolean
  created_at: string
}

export interface MetricsFoodSaved {
  id: string
  listing_id: string
  pickup_id: string
  weight_saved_kg: number
  people_served_est: number
  carbon_kg_saved: number
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface ListingsResponse {
  listings: Listing[]
}

export interface UserResponse {
  user: User | null
}
