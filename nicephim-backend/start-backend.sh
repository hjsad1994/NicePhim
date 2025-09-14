#!/bin/bash

echo "🚀 Starting Rophim Backend..."
echo "================================"

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed!"
    echo "Please install Java 17 first:"
    echo "sudo apt update"
    echo "sudo apt install -y openjdk-17-jdk"
    echo ""
    echo "Or if you're on Windows, make sure Java is installed and JAVA_HOME is set."
    exit 1
fi

# Check Java version
echo "✅ Java version:"
java -version

# Navigate to demo directory
cd demo

# Check if Maven wrapper exists
if [ ! -f "./mvnw" ]; then
    echo "❌ Maven wrapper not found!"
    exit 1
fi

echo "✅ Maven wrapper found"
echo ""

# Make mvnw executable
chmod +x ./mvnw

echo "🔧 Starting Spring Boot application..."
echo "Backend will be available at: http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the application
./mvnw spring-boot:run