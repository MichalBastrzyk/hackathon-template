# Hackathon Template Setup Script (PowerShell)
# This script automates the setup of the development environment

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Print banner
Write-Host ""
Write-Host "=========================================="
Write-Host "  Hackathon Template Setup"
Write-Host "=========================================="
Write-Host ""

# Check if .nvmrc exists
if (-not (Test-Path ".nvmrc")) {
    Write-Error ".nvmrc file not found! Please run this script from the repository root."
    exit 1
}

# Read Node.js version from .nvmrc
$NodeVersion = (Get-Content ".nvmrc" -First 1).Trim()
Write-Info "Required Node.js version: $NodeVersion"

# Function to check if Node.js is installed and matches version
function Test-NodeVersion {
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $CurrentVersion = node --version
        Write-Info "Current Node.js version: $CurrentVersion"
        
        # Extract major version
        $RequiredMajor = $NodeVersion -replace '[^0-9].*$', ''
        $CurrentMajor = $CurrentVersion -replace '[^0-9].*$', ''
        
        if ($RequiredMajor -eq $CurrentMajor) {
            Write-Success "Node.js $CurrentVersion is already installed and compatible!"
            return $true
        } else {
            Write-Warning "Node.js $CurrentVersion is installed but doesn't match required version."
            return $false
        }
    } else {
        Write-Info "Node.js is not installed."
        return $false
    }
}

# Function to add directory to PATH for current session
function Add-ToPath {
    param([string]$Directory)
    
    if ($env:Path -notlike "*$Directory*") {
        $env:Path = "$Directory;$env:Path"
        Write-Info "Added $Directory to PATH for current session"
    }
}

# Function to install Node.js using fnm
function Install-WithFnm {
    Write-Info "Attempting to install Node.js using fnm (Fast Node Manager)..."
    
    $FnmInstallDir = "$env:LOCALAPPDATA\fnm"
    
    if (-not (Get-Command fnm -ErrorAction SilentlyContinue)) {
        Write-Info "Installing fnm..."
        
        try {
            # Install fnm using winget if available
            if (Get-Command winget -ErrorAction SilentlyContinue) {
                Write-Info "Installing fnm via winget..."
                winget install Schniz.fnm --silent
                
                # Add fnm to PATH for current session
                Add-ToPath $FnmInstallDir
                
                # Refresh environment variables
                $env:FNM_DIR = $FnmInstallDir
            } else {
                # Install using PowerShell script
                Write-Info "Installing fnm via installer script..."
                $InstallScript = Invoke-WebRequest -Uri "https://fnm.vercel.app/install" -UseBasicParsing
                Invoke-Expression $InstallScript.Content
                
                # Add fnm to PATH for current session
                Add-ToPath $FnmInstallDir
                $env:FNM_DIR = $FnmInstallDir
            }
        } catch {
            Write-Error "fnm installation failed: $_"
            return $false
        }
    }
    
    if (Get-Command fnm -ErrorAction SilentlyContinue) {
        try {
            Write-Info "Installing Node.js $NodeVersion with fnm..."
            fnm install $NodeVersion
            fnm use $NodeVersion
            
            # Update PATH for current session
            try {
                $FnmEnvOutput = fnm env --shell powershell 2>$null
                if ($FnmEnvOutput) {
                    $FnmEnvOutput | Out-String | Invoke-Expression
                    
                    # Try to extract and add node directory to PATH
                    $NodeDir = & fnm current 2>$null
                    if ($NodeDir) {
                        $NodeBinPath = Join-Path $env:FNM_DIR "node-versions" $NodeDir "installation" "bin"
                        if (Test-Path $NodeBinPath) {
                            Add-ToPath $NodeBinPath
                        }
                    }
                }
            } catch {
                Write-Warning "Could not configure fnm environment automatically. You may need to restart your terminal."
            }
            
            Write-Success "Node.js installed successfully with fnm!"
            
            Write-Warning "⚠ IMPORTANT: To make this Node.js version persistent across sessions:"
            Write-Host ""
            Write-Host "  1. Press Win+X and select 'System'"
            Write-Host "  2. Click 'Advanced system settings'"
            Write-Host "  3. Click 'Environment Variables'"
            Write-Host "  4. Add to User PATH: $FnmInstallDir"
            Write-Host "  5. OR add the following to your PowerShell profile:"
            Write-Host ""
            Write-Host "     fnm env --shell powershell | Out-String | Invoke-Expression" -ForegroundColor Cyan
            Write-Host ""
            Write-Warning "  Without this, you'll need to run this setup script every time you open a new terminal."
            Write-Host ""
            
            return $true
        } catch {
            Write-Error "Failed to install Node.js with fnm: $_"
            return $false
        }
    } else {
        Write-Error "fnm is not available after installation."
        return $false
    }
}

# Function to install Node.js using official installer
function Install-WithInstaller {
    Write-Info "Attempting to install Node.js using official installer..."
    
    # Determine architecture
    $Arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    
    # Extract version number without 'v' prefix
    $VersionNumber = $NodeVersion -replace '^v', ''
    
    $InstallerUrl = "https://nodejs.org/dist/$NodeVersion/node-$NodeVersion-$Arch.msi"
    $InstallerPath = "$env:TEMP\node-installer.msi"
    
    try {
        Write-Info "Downloading Node.js installer from $InstallerUrl..."
        Invoke-WebRequest -Uri $InstallerUrl -OutFile $InstallerPath -UseBasicParsing
        
        Write-Info "Running Node.js installer..."
        Write-Warning "You may be prompted for administrator privileges..."
        
        Start-Process msiexec.exe -ArgumentList "/i `"$InstallerPath`" /qn /norestart" -Wait -Verb RunAs
        
        # Clean up
        Remove-Item $InstallerPath -Force -ErrorAction SilentlyContinue
        
        # Add Node.js to PATH for current session
        $NodePath = "${env:ProgramFiles}\nodejs"
        Add-ToPath $NodePath
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        
        if (Get-Command node -ErrorAction SilentlyContinue) {
            Write-Success "Node.js installed successfully!"
            Write-Info "Node.js has been added to your system PATH permanently."
            return $true
        } else {
            Write-Error "Node.js installation completed but node is not in PATH."
            Write-Warning "You may need to restart your terminal."
            return $false
        }
    } catch {
        Write-Error "Failed to install Node.js: $_"
        return $false
    }
}

# Function to install Node.js using Chocolatey
function Install-WithChocolatey {
    Write-Info "Attempting to install Node.js using Chocolatey..."
    
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Info "Chocolatey is not installed. Skipping this method."
        return $false
    }
    
    try {
        Write-Info "Installing Node.js with Chocolatey..."
        Write-Warning "You may be prompted for administrator privileges..."
        
        # Use exact version number without 'v' prefix
        $VersionNumber = $NodeVersion -replace '^v', ''
        choco install nodejs --version=$VersionNumber -y
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        
        if (Get-Command node -ErrorAction SilentlyContinue) {
            Write-Success "Node.js installed successfully with Chocolatey!"
            return $true
        } else {
            Write-Error "Node.js installation completed but node is not in PATH."
            return $false
        }
    } catch {
        Write-Error "Failed to install Node.js with Chocolatey: $_"
        return $false
    }
}

# Install Node.js if needed
if (-not (Test-NodeVersion)) {
    Write-Info "Installing Node.js $NodeVersion..."
    
    # Try installation methods in order
    $installed = $false
    
    if (Install-WithFnm) {
        $installed = $true
    } elseif (Install-WithInstaller) {
        $installed = $true
    } elseif (Install-WithChocolatey) {
        $installed = $true
    }
    
    if (-not $installed) {
        Write-Error "Failed to install Node.js automatically."
        Write-Host ""
        Write-Error "Please install Node.js $NodeVersion manually from: https://nodejs.org/"
        Write-Host ""
        Write-Info "Download the Windows installer (.msi) and run it."
        Write-Host ""
        exit 1
    }
    
    Write-Success "Node.js installation complete!"
}

# Verify Node.js is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not in PATH. Please restart your terminal or add Node.js to PATH manually."
    Write-Host ""
    Write-Warning "To add Node.js to PATH manually:"
    Write-Host "  1. Press Win+X and select 'System'"
    Write-Host "  2. Click 'Advanced system settings'"
    Write-Host "  3. Click 'Environment Variables'"
    Write-Host "  4. Add Node.js installation directory to PATH"
    Write-Host ""
    exit 1
}

$NodeFinalVersion = node --version
Write-Success "Using Node.js $NodeFinalVersion"

# Install bun if not present
Write-Info "Checking for bun..."
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Info "Installing bun..."
    
    try {
        # Note: Using official bun installation script from https://bun.sh/
        # This is the recommended installation method per bun documentation
        powershell -c "irm bun.sh/install.ps1 | iex"
        
        # Add bun to PATH for current session
        $BunInstallDir = "$env:USERPROFILE\.bun\bin"
        Add-ToPath $BunInstallDir
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        
        if (Get-Command bun -ErrorAction SilentlyContinue) {
            Write-Success "bun installed successfully!"
            
            Write-Warning "⚠ IMPORTANT: To make bun persistent across sessions:"
            Write-Host ""
            Write-Host "  1. Press Win+X and select 'System'"
            Write-Host "  2. Click 'Advanced system settings'"
            Write-Host "  3. Click 'Environment Variables'"
            Write-Host "  4. Add to User PATH: $BunInstallDir"
            Write-Host ""
            Write-Warning "  Without this, you'll need to run this setup script every time you open a new terminal."
            Write-Host ""
        } else {
            Write-Error "bun installation completed but bun is not in PATH."
            Write-Warning "You may need to restart your terminal and then run: bun install"
            exit 1
        }
    } catch {
        Write-Error "bun installation failed: $_"
        Write-Host ""
        Write-Error "Please install bun manually from: https://bun.sh/"
        Write-Host ""
        exit 1
    }
} else {
    $BunVersion = bun --version
    Write-Success "bun is already installed! ($BunVersion)"
}

# Install dependencies
Write-Info "Installing project dependencies..."
if (Get-Command bun -ErrorAction SilentlyContinue) {
    try {
        bun install
        Write-Success "Dependencies installed successfully!"
    } catch {
        Write-Error "Failed to install dependencies: $_"
        exit 1
    }
} else {
    Write-Error "bun is not available. Please restart your terminal and run: bun install"
    exit 1
}

# Setup environment variables
Write-Host ""
Write-Info "Setting up environment variables..."
Write-Host ""

if (Test-Path ".env") {
    Write-Warning "A .env file already exists."
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -notmatch '^[Yy]') {
        Write-Info "Skipping environment setup."
    } else {
        Remove-Item ".env" -Force
    }
}

if (-not (Test-Path ".env")) {
    Write-Info "Please provide the following environment variables:"
    Write-Host ""
    
    # DATABASE_URL
    Write-Host "Database URL (e.g., libsql://your-database.turso.io)" -ForegroundColor Cyan
    $DATABASE_URL = Read-Host "DATABASE_URL"
    
    # DATABASE_AUTH_TOKEN
    Write-Host ""
    Write-Host "Database authentication token" -ForegroundColor Cyan
    $DATABASE_AUTH_TOKEN = Read-Host "DATABASE_AUTH_TOKEN"
    
    # Create .env file
    $envContent = @"
DATABASE_URL=$DATABASE_URL
DATABASE_AUTH_TOKEN=$DATABASE_AUTH_TOKEN
"@
    
    Set-Content -Path ".env" -Value $envContent
    
    Write-Success ".env file created successfully!"
}

# Print success message
Write-Host ""
Write-Host "=========================================="
Write-Success "Setup Complete!"
Write-Host "=========================================="
Write-Host ""
Write-Info "To start the development server, run:"
Write-Host ""
Write-Host "  bun run dev" -ForegroundColor Green
Write-Host ""
Write-Host "  OR with Turbopack (faster):"
Write-Host ""
Write-Host "  bunx next dev --turbopack" -ForegroundColor Green
Write-Host ""
Write-Info "Then open http://localhost:3000 in your browser."
Write-Host ""

# Check if PATH updates are needed
if (-not (Get-Command bun -ErrorAction SilentlyContinue) -or -not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Warning "⚠ IMPORTANT: You may need to restart your terminal for PATH changes to take effect."
    Write-Host ""
}

Write-Success "Happy hacking! 🚀"
Write-Host ""
