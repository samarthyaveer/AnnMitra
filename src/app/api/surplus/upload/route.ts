import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import Papa from 'papaparse'
import { v4 as uuidv4 } from 'uuid'

interface CSVRow {
  transaction_date: string
  transaction_time: string
  food_item: string
  quantity: string
  amount: string
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 })
    }

    // Read file content
    const fileContent = await file.text()
    
    // Parse CSV
    const parseResult = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
    })

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors)
      return NextResponse.json({ 
        error: 'Invalid CSV format', 
        details: parseResult.errors.map((e: any) => e.message) 
      }, { status: 400 })
    }

    const csvData = parseResult.data

    // Validate required columns
    const requiredColumns = ['transaction_date', 'transaction_time', 'food_item', 'quantity', 'amount']
    const firstRow = csvData[0]
    if (!firstRow || !requiredColumns.every(col => col in firstRow)) {
      return NextResponse.json({ 
        error: 'Missing required columns. Required: transaction_date, transaction_time, food_item, quantity, amount' 
      }, { status: 400 })
    }

    // Create upload session
    const uploadSessionId = uuidv4()
    const { error: sessionError } = await supabase
      .from('upload_sessions')
      .insert({
        id: uploadSessionId,
        user_id: userId,
        filename: file.name,
        total_records: csvData.length,
        processed_records: 0,
        status: 'processing'
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      console.error('Full error details:', JSON.stringify(sessionError, null, 2))
      return NextResponse.json({ 
        error: 'Failed to create upload session', 
        details: sessionError.message,
        code: sessionError.code 
      }, { status: 500 })
    }

    // Process and validate data
    const validTransactions = []
    const errors = []

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i]
      try {
        // Validate and parse data
        const transaction_date = row.transaction_date?.trim()
        const transaction_time = row.transaction_time?.trim()
        const food_item = row.food_item?.trim()
        const quantity = parseInt(row.quantity?.trim() || '0')
        const amount = parseFloat(row.amount?.trim() || '0')

        // Basic validation
        if (!transaction_date || !transaction_time || !food_item) {
          errors.push(`Row ${i + 1}: Missing required fields`)
          continue
        }

        if (isNaN(quantity) || quantity <= 0) {
          errors.push(`Row ${i + 1}: Invalid quantity`)
          continue
        }

        if (isNaN(amount) || amount <= 0) {
          errors.push(`Row ${i + 1}: Invalid amount`)
          continue
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(transaction_date)) {
          errors.push(`Row ${i + 1}: Invalid date format. Use YYYY-MM-DD`)
          continue
        }

        // Validate time format (HH:MM:SS)
        const timeRegex = /^\d{2}:\d{2}:\d{2}$/
        if (!timeRegex.test(transaction_time)) {
          errors.push(`Row ${i + 1}: Invalid time format. Use HH:MM:SS`)
          continue
        }

        // Create transaction datetime
        const transaction_datetime = `${transaction_date} ${transaction_time}`

        validTransactions.push({
          user_id: userId,
          upload_session_id: uploadSessionId,
          transaction_date,
          transaction_time,
          transaction_datetime,
          food_item,
          quantity,
          amount
        })

      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    if (validTransactions.length === 0) {
      await supabase
        .from('upload_sessions')
        .update({ 
          status: 'failed', 
          error_message: 'No valid transactions found',
          processed_records: 0 
        })
        .eq('id', uploadSessionId)

      return NextResponse.json({ 
        error: 'No valid transactions found', 
        details: errors 
      }, { status: 400 })
    }

    // Insert transactions in batches
    const batchSize = 100
    let processedCount = 0

    for (let i = 0; i < validTransactions.length; i += batchSize) {
      const batch = validTransactions.slice(i, i + batchSize)
      
      const { error: insertError } = await supabase
        .from('transaction_history')
        .insert(batch)

      if (insertError) {
        console.error('Batch insert error:', insertError)
        await supabase
          .from('upload_sessions')
          .update({ 
            status: 'failed', 
            error_message: `Failed to insert transactions: ${insertError.message}`,
            processed_records: processedCount 
          })
          .eq('id', uploadSessionId)

        return NextResponse.json({ 
          error: 'Failed to insert transactions', 
          details: insertError.message 
        }, { status: 500 })
      }

      processedCount += batch.length

      // Update progress
      await supabase
        .from('upload_sessions')
        .update({ processed_records: processedCount })
        .eq('id', uploadSessionId)
    }

    // Mark as completed
    await supabase
      .from('upload_sessions')
      .update({ 
        status: 'completed',
        processed_records: processedCount 
      })
      .eq('id', uploadSessionId)

    return NextResponse.json({
      success: true,
      uploadSessionId,
      totalRecords: csvData.length,
      processedRecords: processedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully processed ${processedCount} transactions`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
