# Starts the FastAPI backend natively (embedded Qdrant, no Docker needed)
Set-Location "$PSScriptRoot\backend"
$env:QDRANT_MODE = "local"
if (-not $env:GEMINI_API_KEY) {
    if (Test-Path "$PSScriptRoot\.env") {
        Get-Content "$PSScriptRoot\.env" | ForEach-Object {
            if ($_ -match "^\s*([^#=]+)=(.*)$") { Set-Item "env:$($matches[1].Trim())" $matches[2].Trim() }
        }
    }
}
& ".\venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
