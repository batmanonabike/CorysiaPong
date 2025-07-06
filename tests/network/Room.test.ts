import { PongRoom, PlayerState } from '../../src/network/Room'

describe('PongRoom', () => {
  let room: PongRoom

  beforeEach(() => {
    room = new PongRoom({ maxPlayers: 2, maxScore: 5 })
  })

  afterEach(() => {
    room.dispose()
  })

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const state = room.getState()
      
      expect(state.player1Score).toBe(0)
      expect(state.player2Score).toBe(0)
      expect(state.gameStatus).toBe('waiting')
      expect(state.players.size).toBe(0)
    })

    it('should initialize ball at center with velocity', () => {
      const state = room.getState()
      
      expect(state.ball.x).toBe(0)
      expect(state.ball.y).toBe(0)
      expect(state.ball.z).toBe(0)
      expect(Math.abs(state.ball.velocityX)).toBe(6)
    })
  })

  describe('player management', () => {
    it('should add first player as host', () => {
      const result = room.addPlayer('player1')
      
      expect(result.success).toBe(true)
      expect(result.playerNumber).toBe(1)
      expect(room.getPlayerCount()).toBe(1)
      expect(room.getHostId()).toBe('player1')
    })

    it('should add second player as non-host', () => {
      room.addPlayer('player1')
      const result = room.addPlayer('player2')
      
      expect(result.success).toBe(true)
      expect(result.playerNumber).toBe(2)
      expect(room.getPlayerCount()).toBe(2)
    })

    it('should reject third player when room is full', () => {
      room.addPlayer('player1')
      room.addPlayer('player2')
      const result = room.addPlayer('player3')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Room is full')
    })

    it('should remove player correctly', () => {
      room.addPlayer('player1')
      room.addPlayer('player2')
      
      room.removePlayer('player1')
      
      expect(room.getPlayerCount()).toBe(1)
    })

    it('should promote remaining player to host when host leaves', () => {
      room.addPlayer('player1') // Host
      room.addPlayer('player2')
      
      room.removePlayer('player1')
      
      const state = room.getState()
      const remainingPlayer = Array.from(state.players.values())[0]
      expect(remainingPlayer.isHost).toBe(true)
      expect(room.getHostId()).toBe('player2')
    })
  })

  describe('game state management', () => {
    beforeEach(() => {
      room.addPlayer('player1')
      room.addPlayer('player2')
    })

    it('should start game when 2 players join', () => {
      const state = room.getState()
      expect(state.gameStatus).toBe('playing')
    })

    it('should handle player input correctly', () => {
      room.handlePlayerInput('player1', 'up')
      
      const state = room.getState()
      const player1 = state.players.get('player1')
      expect(player1?.inputDirection).toBe('up')
    })

    it('should update paddle positions', () => {
      room.updatePaddlePosition('player1', 2.5)
      
      const state = room.getState()
      const player1 = state.players.get('player1')
      expect(player1?.paddlePosition).toBe(2.5)
    })

    it('should clamp paddle positions to bounds', () => {
      room.updatePaddlePosition('player1', 10) // Beyond bounds
      
      const state = room.getState()
      const player1 = state.players.get('player1')
      expect(player1?.paddlePosition).toBe(4) // Clamped to max
    })

    it('should update scores', () => {
      room.updateScore(3, 2)
      
      const state = room.getState()
      expect(state.player1Score).toBe(3)
      expect(state.player2Score).toBe(2)
    })

    it('should end game when max score is reached', () => {
      room.updateScore(5, 2) // Player 1 wins
      
      const state = room.getState()
      expect(state.gameStatus).toBe('ended')
    })
  })

  describe('game control', () => {
    beforeEach(() => {
      room.addPlayer('player1')
      room.addPlayer('player2')
    })

    it('should pause game', () => {
      room.pauseGame()
      
      const state = room.getState()
      expect(state.gameStatus).toBe('paused')
    })

    it('should reset game', () => {
      room.updateScore(3, 2)
      room.resetGame()
      
      const state = room.getState()
      expect(state.player1Score).toBe(0)
      expect(state.player2Score).toBe(0)
      expect(state.gameStatus).toBe('waiting')
    })
  })

  describe('room status', () => {
    it('should report room as not full initially', () => {
      expect(room.isRoomFull()).toBe(false)
    })

    it('should report room as full when max players reached', () => {
      room.addPlayer('player1')
      room.addPlayer('player2')
      
      expect(room.isRoomFull()).toBe(true)
    })

    it('should report correct player count', () => {
      expect(room.getPlayerCount()).toBe(0)
      
      room.addPlayer('player1')
      expect(room.getPlayerCount()).toBe(1)
      
      room.addPlayer('player2')
      expect(room.getPlayerCount()).toBe(2)
    })
  })
})