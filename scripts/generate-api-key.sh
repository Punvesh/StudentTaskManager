#!/bin/bash

# API Key Generator for PunchAI MCP Server (Linux/macOS)

# Function to generate a secure random API key
generate_api_key() {
    if command -v openssl &> /dev/null; then
        # Use OpenSSL if available (more secure)
        openssl rand -hex 32
    else
        # Fallback to /dev/urandom
        cat /dev/urandom | tr -dc 'a-f0-9' | head -c 64
    fi
}

# Function to update .env file
update_env_file() {
    local api_keys=($@)
    local action="$1"
    local env_path="../.env"
    
    # Remove the action from the array
    api_keys=("${api_keys[@]:1}")
    
    if [ -f "$env_path" ]; then
        # Extract existing API keys
        if grep -q "API_KEYS=" "$env_path"; then
            existing_keys=$(grep "API_KEYS=" "$env_path" | sed 's/API_KEYS=//')
            echo "Found existing API key(s) in .env file."
            
            if [ "$action" == "add" ]; then
                # Add new keys to existing ones
                if [ -n "$existing_keys" ]; then
                    all_keys="$existing_keys,${api_keys[*]}"
                else
                    all_keys="${api_keys[*]}"
                fi
                
                # Update the API_KEYS line in the .env file
                sed -i.bak "s/API_KEYS=.*/API_KEYS=$all_keys/" "$env_path" && rm "${env_path}.bak"
            else
                # Replace existing keys with new ones
                new_key_string=$(IFS=,; echo "${api_keys[*]}")
                
                # Update the API_KEYS line in the .env file
                sed -i.bak "s/API_KEYS=.*/API_KEYS=$new_key_string/" "$env_path" && rm "${env_path}.bak"
            fi
            
            echo "Updated API keys in $env_path"
        else
            echo "No API_KEYS line found in .env file. Adding it..."
            new_key_string=$(IFS=,; echo "${api_keys[*]}")
            echo "" >> "$env_path"
            echo "# Security" >> "$env_path"
            echo "# Comma-separated list of valid API keys" >> "$env_path"
            echo "API_KEYS=$new_key_string" >> "$env_path"
            
            echo "Added API keys to $env_path"
        fi
    else
        echo "No .env file found. Creating a new one with minimal configuration."
        
        new_key_string=$(IFS=,; echo "${api_keys[*]}")
        
        # Create a minimal .env file
        cat > "$env_path" << EOL
# Server Configuration
PORT=3000
NODE_ENV=production

# Security
# Comma-separated list of valid API keys
API_KEYS=$new_key_string

# For more configuration options, run the full setup script:
# node scripts/setup-env.js
EOL
        
        echo "Created new .env file with API keys at $env_path"
    fi
}

# Main script
echo "🔑 PunchAI MCP Server - API Key Generator (Bash)"
echo "==================================================="

# Generate a key
key=$(generate_api_key)
echo -e "\nGenerated API key: $key"

# Ask if user wants to generate more keys
read -p "\nGenerate additional keys? (y/N): " generate_more

all_keys=("$key")

if [[ "$generate_more" =~ ^[Yy]$ ]]; then
    read -p "How many additional keys? " num_keys
    
    # Default to 1 if input is not a number or less than 1
    if ! [[ "$num_keys" =~ ^[0-9]+$ ]] || [ "$num_keys" -lt 1 ]; then
        num_keys=1
    fi
    
    echo -e "\nAdditional API keys:"
    for ((i=0; i<num_keys; i++)); do
        additional_key=$(generate_api_key)
        echo "$((i+1)). $additional_key"
        all_keys+=("$additional_key")
    done
fi

# Ask if user wants to update .env file
read -p "\nUpdate .env file with the new key(s)? (y/N): " update_env

if [[ "$update_env" =~ ^[Yy]$ ]]; then
    env_path="../.env"
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    env_path="$script_dir/$env_path"
    
    if [ -f "$env_path" ]; then
        read -p "Add to existing keys or replace them? (add/replace): " action
        
        if [ "$action" == "add" ] || [ "$action" == "replace" ]; then
            update_env_file "$action" "${all_keys[@]}"
        else
            echo "Invalid option. Defaulting to 'add'."
            update_env_file "add" "${all_keys[@]}"
        fi
    else
        update_env_file "replace" "${all_keys[@]}"
    fi
fi

echo -e "\n🔐 Remember to keep your API keys secure!"
echo "They should only be shared with authorized clients."

# Make the script executable
chmod +x "$0"