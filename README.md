# CorysiaPong

A networked two-player pong game built with BabylonJS, TypeScript, Vite, and Colyseus.

## Features

- **Real-time Multiplayer**: Host or join games without dedicated servers
- **3D Graphics**: Powered by BabylonJS for smooth 3D rendering
- **Network Architecture**: Colyseus-based peer-to-peer communication
- **Responsive Controls**: Arrow keys and WASD support
- **Game State Sync**: Authoritative host with client prediction

## Quick Start

### Prerequisites

- Node.js 18+ (Note: Currently running on Node.js 18.20.6, may show compatibility warnings)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd CorysiaPong

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Tools

Run comprehensive checks and assessments:

```bash
# Run all development checks
./scripts/dev.sh

# Individual commands
npm run lint        # ESLint code quality check
npm run test        # Unit tests
npm run build       # Production build
npm run typecheck   # TypeScript compilation check
```

## How to Play

### Hosting a Game
1. Click "Host Game" in the main menu
2. Wait for another player to join
3. Game starts automatically when both players are connected

### Joining a Game
1. Click "Join Game" in the main menu
2. Enter the host's IP address and port (default: localhost:2567)
3. Click "Connect"

### Controls
- **Player 1 (Left Paddle)**: Arrow Up/Down or W/S keys
- **Player 2 (Right Paddle)**: Arrow Up/Down or W/S keys

### Gameplay
- First player to reach 5 points wins
- Ball bounces off top and bottom walls
- Ball speed increases slightly after paddle hits
- Hit position on paddle affects ball angle

## Architecture

### Technology Stack
- **Frontend**: BabylonJS (3D rendering), TypeScript, Vite
- **Networking**: Colyseus (room management, state sync)
- **Testing**: Jest with jsdom environment
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

### Project Structure
```
src/
├── game/           # Core game mechanics
│   ├── Scene.ts    # BabylonJS scene setup
│   ├── Paddle.ts   # Paddle entity and physics
│   ├── Ball.ts     # Ball entity and collision
│   └── GameLogic.ts # Game state management
├── network/        # Networking layer
│   ├── Client.ts   # Network client
│   ├── Room.ts     # Room state management
│   └── MessageTypes.ts # Network message definitions
├── ui/             # User interface
│   └── MenuSystem.ts # Menu and UI management
├── input/          # Input handling
│   └── InputHandler.ts # Keyboard input
├── Game.ts         # Main game application
└── main.ts         # Application entry point
```

### Network Architecture
- **Host Authority**: Host player maintains authoritative game state
- **Client Prediction**: Non-host clients predict movement for responsiveness
- **State Synchronization**: Real-time sync of ball, paddles, and scores
- **Peer-to-Peer**: Direct connection between players via Colyseus rooms

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

### Testing

The project includes comprehensive unit tests covering:

- **Game Logic**: Ball physics, paddle movement, collision detection
- **Input Handling**: Keyboard event processing and state management
- **Network Layer**: Room management, player connections, state sync
- **UI Components**: Menu system and user interactions

Run tests with coverage:
```bash
npm run test:coverage
```

### Code Quality

- **ESLint**: Enforces code style and catches potential issues
- **TypeScript**: Strict type checking for reliability
- **Jest**: Unit testing with high coverage requirements
- **Development Script**: Automated quality assessment

### Performance Considerations

- **60 FPS Target**: Optimized game loop and rendering
- **Network Efficiency**: Message batching and state diffing
- **Memory Management**: Proper disposal of resources
- **Browser Compatibility**: Tested on Chrome, Firefox, Safari

## Troubleshooting

### Common Issues

1. **Node.js Version Warning**
   - The project runs on Node.js 18.20.6 but Vite recommends 20.19.0+
   - Functionality is not affected, only compatibility warnings

2. **Network Connection Issues**
   - Ensure firewall allows connections on port 2567
   - Check IP address is correct for joining games
   - Host and client must be on same network for local play

3. **Build Issues**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript compilation with `npm run typecheck`

### Development Debugging

Enable verbose logging by setting environment variables:
```bash
DEBUG=colyseus:* npm run dev  # Network debugging
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run development checks: `./scripts/dev.sh`
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Roadmap

- [ ] Add AI opponents for single-player mode
- [ ] Implement tournament bracket system
- [ ] Add visual effects and particle systems
- [ ] Create mobile touch controls
- [ ] Add sound effects and music
- [ ] Implement replay system
- [ ] Add customizable game rules
- [ ] Create spectator mode