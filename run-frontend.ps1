# Starts the Next.js frontend natively
Set-Location "$PSScriptRoot\frontend"
$env:NEXT_PUBLIC_API_URL = "http://localhost:8000"
npm run dev
