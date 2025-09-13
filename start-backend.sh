#!/bin/bash

echo "🚀 Starting Rophim Backend..."

# Navigate to backend directory
cd /mnt/d/rophim/nicephim-backend/demo

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Installing Java 17..."
    sudo apt update
    sudo apt install -y openjdk-17-jdk
fi

# Check if Maven wrapper exists
if [ -f "./mvnw" ]; then
    echo "📦 Using Maven wrapper..."
    chmod +x ./mvnw
    ./mvnw spring-boot:run
else
    echo "❌ Maven wrapper not found. Please check the backend directory."
    exit 1
fi