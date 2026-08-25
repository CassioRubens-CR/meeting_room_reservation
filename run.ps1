[CmdletBinding()]
param(
  [switch]$Install
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root 'backend'
$frontendPath = Join-Path $root 'frontend'

function Assert-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Comando '$name' não encontrado. Instale o Node.js 20+ e o npm 10+."
  }
}

Assert-Command 'node'
Assert-Command 'npm'

if ($Install) {
  Write-Host 'Instalando dependências do backend...'
  Push-Location $backendPath
  npm install
  Pop-Location

  Write-Host 'Instalando dependências do frontend...'
  Push-Location $frontendPath
  npm install
  Pop-Location
}

if (-not (Test-Path (Join-Path $backendPath 'node_modules'))) {
  throw "Dependências do backend não encontradas. Execute .\run.ps1 -Install."
}

if (-not (Test-Path (Join-Path $frontendPath 'node_modules'))) {
  throw "Dependências do frontend não encontradas. Execute .\run.ps1 -Install."
}

if (-not (Test-Path (Join-Path $backendPath '.env'))) {
  Write-Warning 'backend/.env não encontrado. Crie esse arquivo antes de iniciar a API.'
}

$backend = Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$backendPath'; npm run start:dev"
) -PassThru

$frontend = Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$frontendPath'; npm run dev"
) -PassThru

Write-Host ''
Write-Host 'Aplicação iniciada:' -ForegroundColor Green
Write-Host '  Backend:  http://localhost:3001'
Write-Host '  Frontend: http://localhost:5173'
Write-Host ''
Write-Host 'Feche este terminal para encerrar os dois processos.'

try {
  while (-not $backend.HasExited -and -not $frontend.HasExited) {
    Start-Sleep -Seconds 1
  }
}
finally {
  foreach ($process in @($backend, $frontend)) {
    if ($process -and -not $process.HasExited) {
      Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
  }
}
