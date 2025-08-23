# PowerShell script to execute analytics SQL setup
# Make sure you have your DATABASE_URL environment variable set

$sqlFile = "analytics-setup.sql"
$databaseUrl = $env:DATABASE_URL

if (-not $databaseUrl) {
    Write-Host "Error: DATABASE_URL environment variable is not set" -ForegroundColor Red
    Write-Host "Please set it with: `$env:DATABASE_URL = 'your-supabase-connection-string'" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: $sqlFile not found" -ForegroundColor Red
    exit 1
}

try {
    Write-Host "Executing analytics setup SQL..." -ForegroundColor Green
    
    # Read the SQL file content
    $sqlContent = Get-Content $sqlFile -Raw
    
    # You can use psql command if available, or use Supabase dashboard
    Write-Host "SQL content ready. Please execute the following in your Supabase dashboard:" -ForegroundColor Yellow
    Write-Host "Go to: https://supabase.com/dashboard -> Your Project -> SQL Editor" -ForegroundColor Cyan
    Write-Host "And paste the content from analytics-setup.sql" -ForegroundColor Cyan
    
    Write-Host "`n✅ Analytics setup files created successfully!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Execute the SQL in your Supabase dashboard" -ForegroundColor White
    Write-Host "2. Test the application with npm run dev" -ForegroundColor White
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
