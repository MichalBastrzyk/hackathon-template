#!/usr/bin/env bash

# Hackathon Template Setup Script (Shell/Bash)
# This script automates the setup of the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Print banner
echo ""
echo "=========================================="
echo "  Hackathon Template Setup"
echo "=========================================="
echo ""

# Check if .nvmrc exists
if [ ! -f ".nvmrc" ]; then
    error ".nvmrc file not found! Please run this script from the repository root."
    exit 1
fi

# Read Node.js version from .nvmrc
NODE_VERSION=$(head -n 1 .nvmrc | tr -d '[:space:]')
info "Required Node.js version: $NODE_VERSION"

# Function to check if Node.js is installed and matches version
check_node_version() {
    if command -v node &> /dev/null; then
        CURRENT_VERSION=$(node --version)
        info "Current Node.js version: $CURRENT_VERSION"
        
        # Extract major version
        REQUIRED_MAJOR=$(echo "$NODE_VERSION" | grep -oE '[0-9]+' | head -1)
        CURRENT_MAJOR=$(echo "$CURRENT_VERSION" | grep -oE '[0-9]+' | head -1)
        
        if [ "$REQUIRED_MAJOR" = "$CURRENT_MAJOR" ]; then
            success "Node.js $CURRENT_VERSION is already installed and compatible!"
            return 0
        else
            warn "Node.js $CURRENT_VERSION is installed but doesn't match required version."
            return 1
        fi
    else
        info "Node.js is not installed."
        return 1
    fi
}

# Function to install Node.js using fnm
install_with_fnm() {
    info "Attempting to install Node.js using fnm (Fast Node Manager)..."
    
    if ! command -v fnm &> /dev/null; then
        info "Installing fnm..."
        if command -v curl &> /dev/null; then
            curl -fsSL https://fnm.vercel.app/install | bash
            
            # Source fnm for current session
            export FNM_DIR="$HOME/.local/share/fnm"
            if [ -d "$FNM_DIR" ]; then
                export PATH="$FNM_DIR:$PATH"
                eval "$(fnm env --shell bash)"
            fi
        else
            error "curl is not available. Cannot install fnm."
            return 1
        fi
    fi
    
    if command -v fnm &> /dev/null; then
        info "Installing Node.js $NODE_VERSION with fnm..."
        fnm install "$NODE_VERSION"
        fnm use "$NODE_VERSION"
        
        # Update PATH for current session
        eval "$(fnm env --shell bash)"
        
        success "Node.js installed successfully with fnm!"
        
        warn "To make this Node.js version persistent, add the following to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
        echo ""
        echo "  export FNM_DIR=\"\$HOME/.local/share/fnm\""
        echo "  export PATH=\"\$FNM_DIR:\$PATH\""
        echo "  eval \"\$(fnm env --shell bash)\""
        echo ""
        
        return 0
    else
        error "fnm installation failed."
        return 1
    fi
}

# Function to install Node.js using nvm
install_with_nvm() {
    info "Attempting to install Node.js using nvm (Node Version Manager)..."
    
    if [ ! -d "$HOME/.nvm" ] && ! command -v nvm &> /dev/null; then
        info "Installing nvm..."
        if command -v curl &> /dev/null; then
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
            
            # Source nvm for current session
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        else
            error "curl is not available. Cannot install nvm."
            return 1
        fi
    fi
    
    # Try to load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    if command -v nvm &> /dev/null || [ -s "$NVM_DIR/nvm.sh" ]; then
        info "Installing Node.js $NODE_VERSION with nvm..."
        nvm install "$NODE_VERSION"
        nvm use "$NODE_VERSION"
        
        success "Node.js installed successfully with nvm!"
        
        warn "To make this Node.js version persistent, add the following to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
        echo ""
        echo "  export NVM_DIR=\"\$HOME/.nvm\""
        echo "  [ -s \"\$NVM_DIR/nvm.sh\" ] && \\. \"\$NVM_DIR/nvm.sh\""
        echo ""
        
        return 0
    else
        error "nvm installation failed."
        return 1
    fi
}

# Function to install Node.js directly
install_with_package_manager() {
    info "Attempting to install Node.js using system package manager..."
    
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        info "Detected apt-get (Debian/Ubuntu)"
        if command -v sudo &> /dev/null; then
            warn "This will require sudo privileges..."
            sudo apt-get update
            sudo apt-get install -y curl
            curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
            sudo apt-get install -y nodejs
        else
            error "sudo is not available. Please install Node.js manually."
            return 1
        fi
    elif command -v yum &> /dev/null; then
        # RHEL/CentOS/Fedora
        info "Detected yum (RHEL/CentOS/Fedora)"
        if command -v sudo &> /dev/null; then
            warn "This will require sudo privileges..."
            sudo yum install -y curl
            curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
            sudo yum install -y nodejs
        else
            error "sudo is not available. Please install Node.js manually."
            return 1
        fi
    elif command -v brew &> /dev/null; then
        # macOS with Homebrew
        info "Detected brew (macOS Homebrew)"
        brew install node@24
        brew link --overwrite node@24
    else
        error "No supported package manager found."
        return 1
    fi
    
    if command -v node &> /dev/null; then
        success "Node.js installed successfully!"
        return 0
    else
        error "Node.js installation failed."
        return 1
    fi
}

# Install Node.js if needed
if ! check_node_version; then
    info "Installing Node.js $NODE_VERSION..."
    
    # Try installation methods in order
    if install_with_fnm || install_with_nvm || install_with_package_manager; then
        success "Node.js installation complete!"
    else
        error "Failed to install Node.js automatically."
        echo ""
        error "Please install Node.js $NODE_VERSION manually from: https://nodejs.org/"
        echo ""
        exit 1
    fi
fi

# Verify Node.js is available
if ! command -v node &> /dev/null; then
    error "Node.js is not in PATH. Please restart your terminal or add Node.js to PATH manually."
    exit 1
fi

NODE_FINAL_VERSION=$(node --version)
success "Using Node.js $NODE_FINAL_VERSION"

# Install bun if not present
info "Checking for bun..."
if ! command -v bun &> /dev/null; then
    info "Installing bun..."
    if command -v curl &> /dev/null; then
        curl -fsSL https://bun.sh/install | bash
        
        # Add bun to PATH for current session
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"
        
        if command -v bun &> /dev/null; then
            success "bun installed successfully!"
            
            warn "To make bun persistent, add the following to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
            echo ""
            echo "  export BUN_INSTALL=\"\$HOME/.bun\""
            echo "  export PATH=\"\$BUN_INSTALL/bin:\$PATH\""
            echo ""
        else
            error "bun installation failed. You may need to restart your terminal."
            warn "After restarting, run: bun install"
            exit 1
        fi
    else
        error "curl is not available. Cannot install bun."
        echo ""
        error "Please install bun manually from: https://bun.sh/"
        echo ""
        exit 1
    fi
else
    success "bun is already installed! ($(bun --version))"
fi

# Install dependencies
info "Installing project dependencies..."
if command -v bun &> /dev/null; then
    bun install
    success "Dependencies installed successfully!"
else
    error "bun is not available. Please restart your terminal and run: bun install"
    exit 1
fi

# Print success message
echo ""
echo "=========================================="
success "Setup Complete!"
echo "=========================================="
echo ""
info "To start the development server, run:"
echo ""
echo "  ${GREEN}bun run dev${NC}"
echo ""
echo "  OR with Turbopack (faster):"
echo ""
echo "  ${GREEN}bunx next dev --turbopack${NC}"
echo ""
info "Then open http://localhost:3000 in your browser."
echo ""

# Check if PATH updates are needed
if ! command -v bun &> /dev/null || ! command -v node &> /dev/null; then
    warn "⚠ IMPORTANT: You may need to restart your terminal for PATH changes to take effect."
    echo ""
fi

success "Happy hacking! 🚀"
echo ""
