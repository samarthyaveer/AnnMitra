// Debug script to test user creation issue
// Run with: node debug-user-creation.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.log('SUPABASE_URL exists:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_KEY exists:', !!supabaseServiceKey)
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function debugUserCreation() {
  console.log('=== Debugging User Creation Issue ===\n')

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...')
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Database connection failed:', testError)
      return
    }
    console.log('✅ Database connection successful')

    // 2. Check users table schema
    console.log('\n2. Checking users table schema...')
    // Skip RPC call and go directly to testing columns

    // 3. Check if required columns exist by describing the table
    console.log('\n3. Testing users table structure...')
    const { data: columns, error: columnsError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')

    if (columns) {
      console.log('✅ Users table columns:')
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`)
      })
    }

    // 4. Test a sample user creation
    console.log('\n4. Testing sample user creation...')
    const testUserId = 'test_clerk_id_' + Date.now()
    const testUserData = {
      clerk_id: testUserId,
      name: 'Test Student',
      role: 'student',
      email: 'test@example.com',
      phone: '1234567890',
      organization_name: null,
      campus_location: 'Test Campus',
      campus_location_lat: 40.7128,
      campus_location_lng: -74.0060,
      fcm_token: null,
      notifications_enabled: true
    }

    console.log('Attempting to create user with data:', testUserData)

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert(testUserData)
      .select()
      .single()

    if (createError) {
      console.error('❌ User creation failed:', createError)
      console.log('Error details:')
      console.log('  Code:', createError.code)
      console.log('  Message:', createError.message)
      console.log('  Details:', createError.details)
      console.log('  Hint:', createError.hint)
    } else {
      console.log('✅ User creation successful:', newUser)
      
      // Clean up test user
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', newUser.id)
      console.log('✅ Test user cleaned up')
    }

    // 5. Check for any RLS policies that might be blocking
    console.log('\n5. Checking RLS policies...')
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users')

    if (policies && policies.length > 0) {
      console.log('✅ RLS policies found:')
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.cmd} (${policy.roles})`)
      })
    } else {
      console.log('⚠️ No RLS policies found or error:', policiesError)
    }

  } catch (error) {
    console.error('❌ Debug script error:', error)
  }
}

debugUserCreation()
