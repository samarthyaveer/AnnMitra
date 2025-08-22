// Simple test script to verify the fix
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testUserCreation() {
  console.log('Testing user creation after migration...\n')

  const testUserId = 'test_clerk_id_' + Date.now()
  const testUserData = {
    clerk_id: testUserId,
    name: 'Test Student',
    role: 'student',
    email: 'test@example.com',
    phone: '1234567890',
    campus_location: 'Test Campus',
    campus_location_lat: 40.7128,
    campus_location_lng: -74.0060,
    notifications_enabled: true
  }

  console.log('Creating user with data:', testUserData)

  const { data: newUser, error: createError } = await supabaseAdmin
    .from('users')
    .insert(testUserData)
    .select()
    .single()

  if (createError) {
    console.error('❌ User creation still failing:', createError)
  } else {
    console.log('✅ User creation successful!')
    console.log('User created:', newUser)
    
    // Clean up test user
    await supabaseAdmin.from('users').delete().eq('id', newUser.id)
    console.log('✅ Test user cleaned up')
  }
}

testUserCreation()
