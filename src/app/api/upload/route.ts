import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. CHECK AUTHENTICATION
    const { userId } = await auth()
    
    if (!userId) {
      console.error('Upload attempt without authentication')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Upload request from user:', userId)

    // 2. EXTRACT FILE FROM FORM DATA
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('No file provided in upload request')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // 3. VALIDATE FILE TYPE
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type)
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
      }, { status: 400 })
    }

    // 4. VALIDATE FILE SIZE (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size)
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // 5. CREATE UNIQUE FILENAME
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileName = `${userId}-${timestamp}-${randomString}.${fileExt}`
    const filePath = `listings/${fileName}`

    console.log('Generated file path:', filePath)

    // 6. CONVERT FILE TO BUFFER
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    console.log('File buffer size:', fileBuffer.length)

    // 7. UPLOAD TO SUPABASE STORAGE (using admin client)
    console.log('Attempting upload to food-images bucket...')
    
    const { data, error } = await supabaseAdmin.storage
      .from('food-images')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600'
      })

    if (error) {
      console.error('Supabase storage upload error:', {
        error: error,
        message: error.message
      })
      
      return NextResponse.json({ 
        error: `Upload failed: ${error.message}`
      }, { status: 500 })
    }

    console.log('Upload successful:', data)

    // 8. GET PUBLIC URL
    const { data: urlData } = supabaseAdmin.storage
      .from('food-images')
      .getPublicUrl(filePath)

    console.log('Generated public URL:', urlData.publicUrl)

    // 9. RETURN SUCCESS RESPONSE
    const response = { 
      imageUrl: urlData.publicUrl,
      path: filePath,
      fileName: fileName
    }

    console.log('Upload completed successfully:', response)

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Unexpected upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during upload',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
