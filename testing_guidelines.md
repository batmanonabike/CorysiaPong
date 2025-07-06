# CorysiaPong Testing Guidelines

This document provides comprehensive testing instructions for CorysiaPong, covering everything from initial setup to advanced multiplayer scenarios.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup Testing](#initial-setup-testing)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [Gameplay Testing](#gameplay-testing)
6. [Network Testing](#network-testing)
7. [Performance Testing](#performance-testing)
8. [Browser Compatibility](#browser-compatibility)
9. [Troubleshooting](#troubleshooting)
10. [Test Checklists](#test-checklists)

## Prerequisites

### System Requirements
- Node.js 18+ (currently tested on v18.20.6)
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Network connectivity for multiplayer testing
- At least 2GB available RAM
- Graphics support for WebGL

### Environment Setup
```bash
# Clone and setup
git clone <repository-url>
cd CorysiaPong
npm install

# Verify installation
npm run dev
```

## Initial Setup Testing

### 1. Dependency Installation Test
```bash
# Test if all dependencies install correctly
npm install --verbose

# Expected: No fatal errors, all packages installed
# Note: Compatibility warnings for Node.js version are expected but non-blocking
```

### 2. Build System Test
```bash
# Test TypeScript compilation
npx tsc --noEmit
# Expected: No compilation errors

# Test development build
npm run dev
# Expected: Server starts on http://localhost:3000

# Test production build
npm run build
# Expected: dist/ folder created with compiled assets
```

### 3. Development Tools Test
```bash
# Run comprehensive development check
./scripts/dev.sh
# Expected: All checks pass with green checkmarks
```

## Unit Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
# Expected: >80% coverage across all modules

# Run specific test suites
npm test -- tests/game/         # Game logic tests
npm test -- tests/input/        # Input handling tests
npm test -- tests/network/      # Network layer tests

# Run tests in watch mode during development
npm test -- --watch
```

### Test Coverage Expectations
| Module | Expected Coverage | Critical Components |
|--------|-------------------|-------------------|
| Game Logic | >90% | Ball physics, collision detection, scoring |
| Input Handler | >85% | Key mapping, state management |
| Network Layer | >80% | Room management, state sync |
| UI System | >75% | Menu navigation, connection handling |

### Interpreting Test Results
```bash
# Good test output example:
✅ Ball physics calculations
✅ Paddle collision detection
✅ Input event handling
✅ Network state synchronization

# Problematic output:
❌ Ball.test.ts - Collision detection failing
❌ Network timeout in Room.test.ts
```

## Integration Testing

### 1. Component Integration
```bash
# Test that all modules work together
npm run dev
# Open browser, check console for errors
```

#### Expected Browser Console Output:
```
CorysiaPong initializing...
DOM loaded, setting up game...
Game initialized successfully
```

#### Red Flags in Console:
- TypeScript compilation errors
- Missing dependency errors
- BabylonJS initialization failures
- Network connection timeouts

### 2. Scene Integration Test
1. Start development server: `npm run dev`
2. Open `http://localhost:3000`
3. Verify:
   - [ ] Menu displays correctly
   - [ ] No JavaScript errors in console
   - [ ] All buttons are clickable
   - [ ] Input fields accept text

### 3. Game Logic Integration
1. Click "Host Game"
2. Open second browser tab
3. Click "Join Game" → Connect
4. Verify:
   - [ ] Game scene loads (3D arena visible)
   - [ ] Both paddles visible (red left, blue right)
   - [ ] Ball appears at center
   - [ ] Score display shows "Player 1: 0 | Player 2: 0"

## Gameplay Testing

### Single Player Testing (Development)
```bash
# Start game in development mode
npm run dev
```

1. **Host Game Flow**:
   - [ ] Click "Host Game"
   - [ ] Status shows "Waiting for another player..."
   - [ ] Game UI appears but game hasn't started

2. **Join Game Flow**:
   - [ ] Click "Join Game"
   - [ ] IP/Port form appears
   - [ ] Default values: localhost:2567
   - [ ] Click "Connect"
   - [ ] Connection status updates

### Two Player Testing

#### Setup Method 1: Same Computer
1. **Browser Tab 1**:
   ```
   http://localhost:3000
   Click "Host Game"
   ```

2. **Browser Tab 2**:
   ```
   http://localhost:3000
   Click "Join Game"
   IP: localhost, Port: 2567
   Click "Connect"
   ```

#### Setup Method 2: Different Computers (Same Network)
1. **Host Computer**:
   ```bash
   # Find your IP address
   ip route get 1 | awk '{print $7}'  # Linux/WSL
   ipconfig                           # Windows
   
   # Start game
   npm run dev
   # Click "Host Game"
   ```

2. **Client Computer**:
   ```
   # Open browser to http://<HOST_IP>:3000
   # Click "Join Game"
   # Enter host's IP address and port 2567
   # Click "Connect"
   ```

### Gameplay Mechanics Testing

#### Controls Test
| Action | Player 1 Keys | Player 2 Keys | Expected Result |
|--------|---------------|---------------|-----------------|
| Move Up | ↑ or W | ↑ or W | Left/Right paddle moves up |
| Move Down | ↓ or S | ↓ or S | Left/Right paddle moves down |
| No Input | - | - | Paddle stops moving |

#### Physics Test Scenarios
1. **Ball Wall Bouncing**:
   - [ ] Ball bounces off top wall
   - [ ] Ball bounces off bottom wall
   - [ ] Ball maintains horizontal speed
   - [ ] Vertical velocity reverses correctly

2. **Paddle Collision**:
   - [ ] Ball bounces off paddle center → straight reflection
   - [ ] Ball hits paddle edge → angled reflection
   - [ ] Ball speed increases slightly after paddle hit
   - [ ] Collision only occurs when ball moving toward paddle

3. **Scoring**:
   - [ ] Ball exits left side → Player 2 scores
   - [ ] Ball exits right side → Player 1 scores
   - [ ] Score updates in UI immediately
   - [ ] Ball resets to center after score
   - [ ] Game ends at 5 points

#### Game State Testing
```
Initial State:
- Ball at center (0, 0, 0)
- Both paddles at center position
- Score: 0-0
- Status: "Game Ready!" or "Game Started!"

During Play:
- Ball position updates smoothly
- Paddle positions reflect input
- Score increments correctly
- Network sync maintains consistency

End State:
- Game stops when score reaches 5
- Winner announcement displays
- Option to restart available
```

## Network Testing

### Connection Testing

#### Successful Connection Flow
1. Host creates room → Status: "Waiting for another player..."
2. Client connects → Status: "Connected!"
3. Both players ready → Status: "Game Ready!"
4. Game automatically starts → Status: "Game Started!"

#### Connection Failure Scenarios
| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid IP address | Error: "Failed to connect to room" |
| Wrong port | Connection timeout |
| Host not running | Error: "Connection refused" |
| Network unavailable | Error: "Network error" |

#### Network Synchronization Test
1. **Host Authority Test**:
   - Host controls ball physics
   - Client receives ball position updates
   - Both players' paddle positions sync

2. **Latency Test**:
   - Input lag should be <50ms on local network
   - Ball position updates 60 times per second
   - No rubber-banding or jitter

3. **Disconnection Handling**:
   - [ ] Player leaves → Other player sees "Player disconnected"
   - [ ] Network drops → Reconnection attempt
   - [ ] Game pauses appropriately

### Network Debugging
```bash
# Enable Colyseus debugging
DEBUG=colyseus:* npm run dev

# Monitor network traffic in browser dev tools
# Network tab → Filter: WS (WebSocket)
```

## Performance Testing

### Frame Rate Testing
```javascript
// Add to browser console during gameplay
let frameCount = 0;
let lastTime = performance.now();

function checkFPS() {
    frameCount++;
    const currentTime = performance.now();
    if (currentTime - lastTime >= 1000) {
        console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastTime = currentTime;
    }
    requestAnimationFrame(checkFPS);
}
checkFPS();

// Expected: Consistent 60 FPS
// Acceptable: 30+ FPS on lower-end hardware
```

### Memory Usage Testing
```javascript
// Monitor memory usage
function checkMemory() {
    if (performance.memory) {
        console.log(`Used: ${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB`);
        console.log(`Total: ${Math.round(performance.memory.totalJSHeapSize / 1048576)}MB`);
    }
}

// Run every 10 seconds during gameplay
setInterval(checkMemory, 10000);

// Expected: Stable memory usage (no leaks)
// Alert if usage increases consistently
```

### Network Performance
- **Bandwidth**: <1 Mbps per player
- **Latency**: <100ms for responsive gameplay
- **Packet Loss**: <1% acceptable

## Browser Compatibility

### Supported Browsers
| Browser | Version | WebGL | WebSocket | BabylonJS | Status |
|---------|---------|-------|-----------|-----------|--------|
| Chrome | 90+ | ✅ | ✅ | ✅ | Fully Supported |
| Firefox | 88+ | ✅ | ✅ | ✅ | Fully Supported |
| Safari | 14+ | ✅ | ✅ | ✅ | Supported |
| Edge | 90+ | ✅ | ✅ | ✅ | Supported |

### Browser-Specific Testing
1. **Chrome/Edge**:
   - Expected: Best performance
   - Test WebGL support: Type `chrome://gpu/` in address bar

2. **Firefox**:
   - Expected: Good performance
   - May show different WebGL vendor

3. **Safari**:
   - Expected: Functional but potentially slower
   - Test WebGL: Developer menu → WebGL

### Mobile Testing (Optional)
- iOS Safari: Limited support (performance may vary)
- Android Chrome: Basic functionality
- Touch controls: Not implemented (keyboard required)

## Troubleshooting

### Common Issues and Solutions

#### 1. Dependencies Won't Install
```bash
# Solution 1: Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solution 2: Use different registry
npm install --registry https://registry.npmjs.org/

# Solution 3: Install core packages individually
npm install vite typescript
npm install @babylonjs/core @babylonjs/loaders
npm install colyseus.js @colyseus/schema
```

#### 2. TypeScript Compilation Errors
```bash
# Check for missing types
npm install --save-dev @types/node

# Verify tsconfig.json is correct
npx tsc --showConfig

# Common fix: Update TypeScript
npm install typescript@latest --save-dev
```

#### 3. BabylonJS Scene Not Loading
- Check browser console for WebGL errors
- Verify graphics drivers are updated
- Test on different browser
- Check if hardware acceleration is enabled

#### 4. Network Connection Issues
```bash
# Check if port is available
netstat -an | grep 2567

# Test basic connectivity
curl -I http://localhost:3000

# Firewall issues (Windows)
# Allow Node.js through Windows Firewall
```

#### 5. Game Performance Issues
- Close other browser tabs
- Check system resources (Task Manager)
- Reduce browser zoom level
- Update graphics drivers

### Debug Mode
```javascript
// Add to browser console for verbose logging
localStorage.setItem('debug', 'colyseus:*');
// Refresh page to see network debug info
```

## Test Checklists

### 🔥 Smoke Test (5 minutes)
Basic functionality verification:
- [ ] `npm install` succeeds
- [ ] `npm run dev` starts server
- [ ] Browser loads game without errors
- [ ] Can click "Host Game"
- [ ] Can click "Join Game"
- [ ] Input fields accept text

### 🧪 Core Functionality Test (15 minutes)
- [ ] Two players can connect
- [ ] Game starts automatically
- [ ] Paddles respond to keyboard input
- [ ] Ball moves and bounces correctly
- [ ] Scoring works
- [ ] Game ends at 5 points

### 🌐 Network Test (10 minutes)
- [ ] Host/join on same computer works
- [ ] Host/join on different computers works
- [ ] Connection errors display properly
- [ ] Disconnection is handled gracefully
- [ ] Game state stays synchronized

### 🔧 Development Test (20 minutes)
- [ ] All unit tests pass: `npm test`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Development script passes: `./scripts/dev.sh`

### 🚀 Production Readiness Test (30 minutes)
- [ ] Build optimized bundle: `npm run build`
- [ ] Test built version: `npm run preview`
- [ ] Check bundle size (should be <10MB)
- [ ] Test on multiple browsers
- [ ] Test network scenarios (local/remote)
- [ ] Performance meets targets (60 FPS)
- [ ] Memory usage is stable
- [ ] No console errors in production build

### 🎮 User Experience Test (15 minutes)
- [ ] Menu navigation is intuitive
- [ ] Connection process is clear
- [ ] Error messages are helpful
- [ ] Game controls are responsive
- [ ] Visual feedback is immediate
- [ ] Game end state is clear

## Automated Testing

### Continuous Integration Setup
```yaml
# .github/workflows/test.yml (if using GitHub Actions)
name: Test CorysiaPong
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run lint
      - run: npm run build
```

### Pre-commit Hooks
```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test && npm run lint"
```

## Performance Benchmarks

### Target Metrics
- **Startup Time**: <3 seconds to game menu
- **Connection Time**: <2 seconds to join game
- **Frame Rate**: 60 FPS (minimum 30 FPS)
- **Memory Usage**: <100MB steady state
- **Network Latency**: <50ms local, <150ms internet
- **Bundle Size**: <5MB compressed

### Measurement Tools
```javascript
// Performance timing
console.time('Game Initialization');
// ... game init code ...
console.timeEnd('Game Initialization');

// Memory monitoring
console.log(performance.memory);

// Network timing
console.time('Connection');
// ... connection code ...
console.timeEnd('Connection');
```

## Test Data and Scenarios

### Edge Cases to Test
1. **Rapid Input**: Spam arrow keys rapidly
2. **Simultaneous Input**: Both players press keys at same time
3. **Network Interruption**: Disconnect/reconnect during game
4. **Browser Refresh**: Refresh during active game
5. **Tab Switching**: Switch away from game tab
6. **Window Resize**: Resize browser window during play
7. **Multiple Games**: Try to join multiple rooms
8. **Invalid Data**: Enter non-numeric ports, invalid IPs

### Test Configurations
| Configuration | Host OS | Client OS | Network | Expected Result |
|---------------|---------|-----------|---------|-----------------|
| Local Same Tab | Windows | Windows | Localhost | Perfect sync |
| Local Multi-Tab | Windows | Windows | Localhost | Good sync |
| LAN | Windows | Mac | WiFi | Good sync |
| Internet | Linux | Windows | Internet | Playable sync |

Remember: Testing is iterative. Run these tests after any significant changes to ensure stability and performance.