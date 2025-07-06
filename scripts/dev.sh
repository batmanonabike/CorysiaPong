#!/bin/bash

# CorysiaPong Development Script
# Provides comprehensive development feedback and assessment tools

set -e

echo "🎮 CorysiaPong Development Tools"
echo "================================"

# Function to run with error handling
run_check() {
    local check_name="$1"
    local command="$2"
    
    echo ""
    echo "🔍 Running $check_name..."
    echo "------------------------"
    
    if eval "$command"; then
        echo "✅ $check_name passed"
        return 0
    else
        echo "❌ $check_name failed"
        return 1
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Initialize counters
total_checks=0
passed_checks=0

# TypeScript compilation check
if command_exists tsc; then
    total_checks=$((total_checks + 1))
    if run_check "TypeScript Compilation" "npx tsc --noEmit"; then
        passed_checks=$((passed_checks + 1))
    fi
else
    echo "⚠️  TypeScript compiler not found, skipping compilation check"
fi

# ESLint check
if command_exists eslint; then
    total_checks=$((total_checks + 1))
    if run_check "ESLint Code Quality" "npm run lint"; then
        passed_checks=$((passed_checks + 1))
    fi
else
    echo "⚠️  ESLint not found, skipping linting check"
fi

# Unit tests
if command_exists jest; then
    total_checks=$((total_checks + 1))
    if run_check "Unit Tests" "npm test"; then
        passed_checks=$((passed_checks + 1))
    fi
else
    echo "⚠️  Jest not found, skipping unit tests"
fi

# Build check
total_checks=$((total_checks + 1))
if run_check "Build Process" "npm run build"; then
    passed_checks=$((passed_checks + 1))
fi

# File structure validation
echo ""
echo "🔍 Running File Structure Validation..."
echo "--------------------------------------"

required_files=(
    "src/main.ts"
    "src/Game.ts"
    "src/game/Scene.ts"
    "src/game/Paddle.ts"
    "src/game/Ball.ts"
    "src/game/GameLogic.ts"
    "src/network/Client.ts"
    "src/network/Room.ts"
    "src/network/MessageTypes.ts"
    "src/input/InputHandler.ts"
    "src/ui/MenuSystem.ts"
    "index.html"
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "execution_plan.md"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files=$((missing_files + 1))
    fi
done

total_checks=$((total_checks + 1))
if [[ $missing_files -eq 0 ]]; then
    echo "✅ File Structure Validation passed"
    passed_checks=$((passed_checks + 1))
else
    echo "❌ File Structure Validation failed ($missing_files missing files)"
fi

# Test coverage check (if available)
if [[ -f "coverage/lcov-report/index.html" ]]; then
    echo ""
    echo "📊 Test coverage report available at: coverage/lcov-report/index.html"
fi

# Summary
echo ""
echo "📋 Development Assessment Summary"
echo "================================="
echo "Checks passed: $passed_checks/$total_checks"

if [[ $passed_checks -eq $total_checks ]]; then
    echo "🎉 All checks passed! Your CorysiaPong project is ready."
    exit 0
else
    echo "⚠️  Some checks failed. Please address the issues above."
    exit 1
fi