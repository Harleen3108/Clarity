# Starts the FastAPI backend (Qdrant Cloud + Groq via .env)
Set-Location "$PSScriptRoot\backend"

# Load all vars from .env at project root (pydantic-settings also does this,
# but loading here ensures env vars are set before uvicorn spawns worker processes)
if (Test-Path "$PSScriptRoot\.env") {
    Get-Content "$PSScriptRoot\.env" | ForEach-Object {
        if ($_ -match "^\s*([^#=\s][^=]*)=(.*)$") {
            $name = $matches[1].Trim()
            $val  = $matches[2].Trim()
            Set-Item "env:$name" $val
        }
    }
}

& ".\venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8001
