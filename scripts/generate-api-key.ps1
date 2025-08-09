# API Key Generator for PunchAI MCP Server (PowerShell)

function Generate-ApiKey {
    param (
        [int]$Length = 32
    )
    
    # Generate a random hexadecimal string
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $apiKey = [System.BitConverter]::ToString($bytes) -replace '-', ''
    return $apiKey.ToLower()
}

function Update-EnvFile {
    param (
        [string[]]$ApiKeys,
        [string]$Action = "add"
    )
    
    $envPath = Join-Path $PSScriptRoot "../.env"
    
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath -Raw
        
        # Extract existing API keys
        $apiKeysMatch = [regex]::Match($envContent, "API_KEYS=([^\r\n]+)")
        
        if ($apiKeysMatch.Success) {
            $existingKeys = $apiKeysMatch.Groups[1].Value.Split(",")
            Write-Host "Found $($existingKeys.Count) existing API key(s) in .env file."
            
            if ($Action -eq "add") {
                # Add new keys to existing ones
                $allKeys = $existingKeys + $ApiKeys
                $newKeyString = $allKeys -join ","
                
                # Update the API_KEYS line in the .env file
                $envContent = $envContent -replace "API_KEYS=([^\r\n]+)", "API_KEYS=$newKeyString"
            } else {
                # Replace existing keys with new ones
                $newKeyString = $ApiKeys -join ","
                
                # Update the API_KEYS line in the .env file
                $envContent = $envContent -replace "API_KEYS=([^\r\n]+)", "API_KEYS=$newKeyString"
            }
            
            # Write the updated content back to the .env file
            Set-Content -Path $envPath -Value $envContent
            Write-Host "Updated API keys in $envPath"
        } else {
            Write-Host "No API_KEYS line found in .env file. Adding it..."
            $newKeyString = $ApiKeys -join ","
            $envContent += "`n# Security`n# Comma-separated list of valid API keys`nAPI_KEYS=$newKeyString`n"
            
            # Write the updated content back to the .env file
            Set-Content -Path $envPath -Value $envContent
            Write-Host "Added API keys to $envPath"
        }
    } else {
        Write-Host "No .env file found. Creating a new one with minimal configuration."
        
        $newKeyString = $ApiKeys -join ","
        
        # Create a minimal .env file
        $minimalEnv = @"
# Server Configuration
PORT=3000
NODE_ENV=production

# Security
# Comma-separated list of valid API keys
API_KEYS=$newKeyString

# For more configuration options, run the full setup script:
# node scripts/setup-env.js
"@
        
        Set-Content -Path $envPath -Value $minimalEnv
        Write-Host "Created new .env file with API keys at $envPath"
    }
}

# Main script
Write-Host "🔑 PunchAI MCP Server - API Key Generator (PowerShell)"
Write-Host "==================================================="

# Generate a key
$key = Generate-ApiKey
Write-Host "`nGenerated API key: $key"

# Ask if user wants to generate more keys
$generateMore = Read-Host "`nGenerate additional keys? (y/N)"

$allKeys = @($key)

if ($generateMore -eq "y" -or $generateMore -eq "Y") {
    $numKeysInput = Read-Host "How many additional keys?"
    $numKeys = 0
    
    if ([int]::TryParse($numKeysInput, [ref]$numKeys)) {
        if ($numKeys -lt 1) { $numKeys = 1 }
    } else {
        $numKeys = 1
    }
    
    Write-Host "`nAdditional API keys:"
    for ($i = 0; $i -lt $numKeys; $i++) {
        $additionalKey = Generate-ApiKey
        Write-Host "$($i + 1). $additionalKey"
        $allKeys += $additionalKey
    }
}

# Ask if user wants to update .env file
$updateEnv = Read-Host "`nUpdate .env file with the new key(s)? (y/N)"

if ($updateEnv -eq "y" -or $updateEnv -eq "Y") {
    $envPath = Join-Path $PSScriptRoot "../.env"
    
    if (Test-Path $envPath) {
        $action = Read-Host "Add to existing keys or replace them? (add/replace)"
        
        if ($action -eq "add" -or $action -eq "replace") {
            Update-EnvFile -ApiKeys $allKeys -Action $action
        } else {
            Write-Host "Invalid option. Defaulting to 'add'."
            Update-EnvFile -ApiKeys $allKeys -Action "add"
        }
    } else {
        Update-EnvFile -ApiKeys $allKeys
    }
}

Write-Host "`n🔐 Remember to keep your API keys secure!"
Write-Host "They should only be shared with authorized clients."