# Starts the Next.js frontend natively
Set-Location "$PSScriptRoot\frontend"
$env:NEXT_PUBLIC_API_URL = "http://localhost:8001"
npm run dev
