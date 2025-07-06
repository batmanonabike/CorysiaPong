import { Client, Room } from 'colyseus.js'
import { Vector3 } from '@babylonjs/core'
import { GameRoomState, PlayerState } from './Room'
import { PlayerInput, GameStateMessage, ConnectionStatusMessage } from './MessageTypes'

export class NetworkClient {
  private client: Client
  private room: Room<GameRoomState> | null = null
  private playerId: string = ''
  private playerNumber: number = 0
  private isHost: boolean = false
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected'
  
  // Event callbacks
  private onStateChange: ((state: GameRoomState) => void) | null = null
  private onPlayerJoined: ((player: PlayerState) => void) | null = null
  private onPlayerLeft: ((playerId: string) => void) | null = null
  private onConnectionStatusChange: ((status: ConnectionStatusMessage) => void) | null = null
  private onGameStart: (() => void) | null = null
  private onScoreUpdate: ((player1: number, player2: number) => void) | null = null

  constructor(serverUrl: string = 'ws://localhost:2567') {
    this.client = new Client(serverUrl)
  }

  public async createRoom(): Promise<{ success: boolean; error?: string }> {
    try {
      this.connectionStatus = 'connecting'
      this.notifyConnectionStatus('connecting')

      this.room = await this.client.create('pong_room')
      this.playerId = this.room.sessionId
      this.isHost = true
      this.playerNumber = 1

      this.setupRoomHandlers()
      this.connectionStatus = 'connected'
      this.notifyConnectionStatus('connected')

      return { success: true }
    } catch (error) {
      this.connectionStatus = 'error'
      this.notifyConnectionStatus('error', error instanceof Error ? error.message : 'Unknown error')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  public async joinRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.connectionStatus = 'connecting'
      this.notifyConnectionStatus('connecting')

      this.room = await this.client.joinById(roomId)
      this.playerId = this.room.sessionId
      this.isHost = false

      this.setupRoomHandlers()
      this.connectionStatus = 'connected'
      this.notifyConnectionStatus('connected')

      return { success: true }
    } catch (error) {
      this.connectionStatus = 'error'
      this.notifyConnectionStatus('error', error instanceof Error ? error.message : 'Unknown error')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  public async joinByIP(ip: string, port: string): Promise<{ success: boolean; error?: string }> {
    try {
      const serverUrl = `ws://${ip}:${port}`
      this.client = new Client(serverUrl)
      
      this.connectionStatus = 'connecting'
      this.notifyConnectionStatus('connecting')

      this.room = await this.client.join('pong_room')
      this.playerId = this.room.sessionId
      this.isHost = false

      this.setupRoomHandlers()
      this.connectionStatus = 'connected'
      this.notifyConnectionStatus('connected')

      return { success: true }
    } catch (error) {
      this.connectionStatus = 'error'
      this.notifyConnectionStatus('error', error instanceof Error ? error.message : 'Unknown error')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private setupRoomHandlers(): void {
    if (!this.room) return

    // Handle state changes
    this.room.onStateChange((state: GameRoomState) => {
      this.onStateChange?.(state)
    })

    // Handle player joined
    this.room.state.players.onAdd((player: PlayerState, playerId: string) => {
      if (playerId === this.playerId) {
        this.playerNumber = player.playerNumber
        this.isHost = player.isHost
      }
      this.onPlayerJoined?.(player)
    })

    // Handle player left
    this.room.state.players.onRemove((player: PlayerState, playerId: string) => {
      this.onPlayerLeft?.(playerId)
    })

    // Handle room messages
    this.room.onMessage('game_start', () => {
      this.onGameStart?.()
    })

    this.room.onMessage('score_update', (message: { player1: number; player2: number }) => {
      this.onScoreUpdate?.(message.player1, message.player2)
    })

    // Handle connection errors
    this.room.onError((code: number, message?: string) => {
      this.connectionStatus = 'error'
      this.notifyConnectionStatus('error', `Error ${code}: ${message}`)
    })

    // Handle room leave
    this.room.onLeave((code: number) => {
      this.connectionStatus = 'disconnected'
      this.notifyConnectionStatus('disconnected', `Left room with code: ${code}`)
    })
  }

  public sendPlayerInput(direction: 'up' | 'down' | 'none'): void {
    if (!this.room) return

    const input: PlayerInput = {
      playerId: this.playerId,
      direction,
      timestamp: Date.now()
    }

    this.room.send('player_input', input)
  }

  public sendPaddlePosition(position: number): void {
    if (!this.room) return

    this.room.send('paddle_position', {
      playerId: this.playerId,
      position,
      timestamp: Date.now()
    })
  }

  public sendBallState(position: Vector3, velocity: Vector3): void {
    if (!this.room || !this.isHost) return

    this.room.send('ball_state', {
      position: { x: position.x, y: position.y, z: position.z },
      velocity: { x: velocity.x, y: velocity.y, z: velocity.z },
      timestamp: Date.now()
    })
  }

  public sendScoreUpdate(player1Score: number, player2Score: number): void {
    if (!this.room || !this.isHost) return

    this.room.send('score_update', {
      player1Score,
      player2Score,
      timestamp: Date.now()
    })
  }

  public startGame(): void {
    if (!this.room || !this.isHost) return
    this.room.send('start_game')
  }

  public pauseGame(): void {
    if (!this.room || !this.isHost) return
    this.room.send('pause_game')
  }

  public resetGame(): void {
    if (!this.room || !this.isHost) return
    this.room.send('reset_game')
  }

  public leaveRoom(): void {
    if (this.room) {
      this.room.leave()
      this.room = null
      this.connectionStatus = 'disconnected'
      this.notifyConnectionStatus('disconnected')
    }
  }

  private notifyConnectionStatus(status: 'connected' | 'disconnected' | 'connecting' | 'error', message?: string): void {
    this.onConnectionStatusChange?.({ status, message })
  }

  // Event listener setters
  public onStateChangeListener(callback: (state: GameRoomState) => void): void {
    this.onStateChange = callback
  }

  public onPlayerJoinedListener(callback: (player: PlayerState) => void): void {
    this.onPlayerJoined = callback
  }

  public onPlayerLeftListener(callback: (playerId: string) => void): void {
    this.onPlayerLeft = callback
  }

  public onConnectionStatusChangeListener(callback: (status: ConnectionStatusMessage) => void): void {
    this.onConnectionStatusChange = callback
  }

  public onGameStartListener(callback: () => void): void {
    this.onGameStart = callback
  }

  public onScoreUpdateListener(callback: (player1: number, player2: number) => void): void {
    this.onScoreUpdate = callback
  }

  // Getters
  public getPlayerId(): string {
    return this.playerId
  }

  public getPlayerNumber(): number {
    return this.playerNumber
  }

  public getIsHost(): boolean {
    return this.isHost
  }

  public getConnectionStatus(): string {
    return this.connectionStatus
  }

  public getRoomId(): string {
    return this.room?.id || ''
  }

  public isConnected(): boolean {
    return this.connectionStatus === 'connected' && this.room !== null
  }

  public dispose(): void {
    this.leaveRoom()
    this.client = null as any
  }
}