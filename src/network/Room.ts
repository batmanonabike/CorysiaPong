import { Schema, type, MapSchema } from '@colyseus/schema'
import { Vector3 } from '@babylonjs/core'

export class PlayerState extends Schema {
  @type('string') id: string = ''
  @type('number') playerNumber: number = 0
  @type('number') paddlePosition: number = 0
  @type('boolean') isHost: boolean = false
  @type('string') inputDirection: string = 'none'
  @type('number') lastInputTime: number = 0
}

export class BallState extends Schema {
  @type('number') x: number = 0
  @type('number') y: number = 0
  @type('number') z: number = 0
  @type('number') velocityX: number = 0
  @type('number') velocityY: number = 0
  @type('number') velocityZ: number = 0
}

export class GameRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
  @type(BallState) ball = new BallState()
  @type('number') player1Score: number = 0
  @type('number') player2Score: number = 0
  @type('string') gameStatus: string = 'waiting'
  @type('number') lastUpdate: number = 0
  @type('boolean') isHost: boolean = false
  @type('string') hostId: string = ''
}

export interface RoomOptions {
  maxPlayers: number
  gameMode: 'classic' | 'timed'
  maxScore: number
}

export class PongRoom {
  private state: GameRoomState
  private options: RoomOptions
  private gameLoopInterval: NodeJS.Timeout | null = null
  private readonly TICK_RATE = 60 // 60 FPS

  constructor(options: Partial<RoomOptions> = {}) {
    this.options = {
      maxPlayers: 2,
      gameMode: 'classic',
      maxScore: 5,
      ...options
    }
    this.state = new GameRoomState()
    this.initializeGame()
  }

  private initializeGame(): void {
    // Initialize ball state
    this.state.ball.x = 0
    this.state.ball.y = 0
    this.state.ball.z = 0
    this.state.ball.velocityX = 6
    this.state.ball.velocityY = 0
    this.state.ball.velocityZ = 0

    // Reset scores
    this.state.player1Score = 0
    this.state.player2Score = 0
    this.state.gameStatus = 'waiting'
    this.state.lastUpdate = Date.now()
  }

  public addPlayer(playerId: string): { success: boolean; playerNumber?: number; error?: string } {
    if (this.state.players.size >= this.options.maxPlayers) {
      return { success: false, error: 'Room is full' }
    }

    const playerNumber = this.state.players.size === 0 ? 1 : 2
    const isHost = playerNumber === 1

    const player = new PlayerState()
    player.id = playerId
    player.playerNumber = playerNumber
    player.paddlePosition = 0
    player.isHost = isHost
    player.inputDirection = 'none'
    player.lastInputTime = Date.now()

    this.state.players.set(playerId, player)

    if (isHost) {
      this.state.isHost = true
      this.state.hostId = playerId
    }

    // Start game if we have 2 players
    if (this.state.players.size === 2) {
      this.startGame()
    }

    return { success: true, playerNumber }
  }

  public removePlayer(playerId: string): void {
    const player = this.state.players.get(playerId)
    if (player) {
      this.state.players.delete(playerId)
      
      // If host left, make the other player host
      if (player.isHost && this.state.players.size > 0) {
        const remainingPlayer = Array.from(this.state.players.values())[0]
        remainingPlayer.isHost = true
        this.state.hostId = remainingPlayer.id
      }

      // Pause game if a player leaves
      if (this.state.gameStatus === 'playing') {
        this.pauseGame()
      }
    }
  }

  public handlePlayerInput(playerId: string, direction: 'up' | 'down' | 'none'): void {
    const player = this.state.players.get(playerId)
    if (player) {
      player.inputDirection = direction
      player.lastInputTime = Date.now()
    }
  }

  public updatePaddlePosition(playerId: string, position: number): void {
    const player = this.state.players.get(playerId)
    if (player) {
      player.paddlePosition = Math.max(-4, Math.min(4, position))
    }
  }

  public updateBallState(position: Vector3, velocity: Vector3): void {
    this.state.ball.x = position.x
    this.state.ball.y = position.y
    this.state.ball.z = position.z
    this.state.ball.velocityX = velocity.x
    this.state.ball.velocityY = velocity.y
    this.state.ball.velocityZ = velocity.z
    this.state.lastUpdate = Date.now()
  }

  public updateScore(player1Score: number, player2Score: number): void {
    this.state.player1Score = player1Score
    this.state.player2Score = player2Score
    
    // Check for game end
    if (player1Score >= this.options.maxScore || player2Score >= this.options.maxScore) {
      this.endGame()
    }
  }

  public startGame(): void {
    if (this.state.players.size === 2) {
      this.state.gameStatus = 'playing'
      this.startGameLoop()
    }
  }

  public pauseGame(): void {
    this.state.gameStatus = 'paused'
    this.stopGameLoop()
  }

  public endGame(): void {
    this.state.gameStatus = 'ended'
    this.stopGameLoop()
  }

  public resetGame(): void {
    this.stopGameLoop()
    this.initializeGame()
  }

  private startGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval)
    }

    this.gameLoopInterval = setInterval(() => {
      this.updateGame()
    }, 1000 / this.TICK_RATE)
  }

  private stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval)
      this.gameLoopInterval = null
    }
  }

  private updateGame(): void {
    const now = Date.now()
    const deltaTime = (now - this.state.lastUpdate) / 1000

    // Update paddle positions based on input
    for (const player of this.state.players.values()) {
      if (player.inputDirection === 'up') {
        player.paddlePosition = Math.min(4, player.paddlePosition + 8 * deltaTime)
      } else if (player.inputDirection === 'down') {
        player.paddlePosition = Math.max(-4, player.paddlePosition - 8 * deltaTime)
      }
    }

    this.state.lastUpdate = now
  }

  public getState(): GameRoomState {
    return this.state
  }

  public getPlayerCount(): number {
    return this.state.players.size
  }

  public isRoomFull(): boolean {
    return this.state.players.size >= this.options.maxPlayers
  }

  public getHostId(): string {
    return this.state.hostId
  }

  public dispose(): void {
    this.stopGameLoop()
    this.state.players.clear()
  }
}