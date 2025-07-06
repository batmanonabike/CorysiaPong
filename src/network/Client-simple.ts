// Simplified Client for demo without Colyseus
export class NetworkClient {
  private isConnected: boolean = false
  private playerNumber: number = 0
  private isHost: boolean = false

  // Mock implementation for demo
  public async createRoom(): Promise<{ success: boolean; error?: string }> {
    this.isHost = true
    this.playerNumber = 1
    this.isConnected = true
    return { success: true }
  }

  public async joinByIP(ip: string, port: string): Promise<{ success: boolean; error?: string }> {
    this.isHost = false
    this.playerNumber = 2
    this.isConnected = true
    return { success: true }
  }

  public sendPlayerInput(direction: 'up' | 'down' | 'none'): void {
    console.log('Player input:', direction)
  }

  public sendPaddlePosition(position: number): void {
    console.log('Paddle position:', position)
  }

  public sendBallState(position: any, velocity: any): void {
    console.log('Ball state:', position, velocity)
  }

  public sendScoreUpdate(player1Score: number, player2Score: number): void {
    console.log('Score update:', player1Score, player2Score)
  }

  public startGame(): void {
    console.log('Start game')
  }

  public pauseGame(): void {
    console.log('Pause game')
  }

  public resetGame(): void {
    console.log('Reset game')
  }

  public leaveRoom(): void {
    this.isConnected = false
  }

  public onStateChangeListener(callback: (state: any) => void): void {
    // Mock implementation
  }

  public onPlayerJoinedListener(callback: (player: any) => void): void {
    // Mock implementation
  }

  public onPlayerLeftListener(callback: (playerId: string) => void): void {
    // Mock implementation
  }

  public onConnectionStatusChangeListener(callback: (status: any) => void): void {
    // Mock implementation
  }

  public onGameStartListener(callback: () => void): void {
    // Mock implementation
  }

  public onScoreUpdateListener(callback: (player1: number, player2: number) => void): void {
    // Mock implementation
  }

  public getPlayerId(): string {
    return 'demo-player'
  }

  public getPlayerNumber(): number {
    return this.playerNumber
  }

  public getIsHost(): boolean {
    return this.isHost
  }

  public getConnectionStatus(): string {
    return this.isConnected ? 'connected' : 'disconnected'
  }

  public getRoomId(): string {
    return 'demo-room'
  }

  public isConnected(): boolean {
    return this.isConnected
  }

  public getPlayerCount(): number {
    return 2
  }

  public dispose(): void {
    this.isConnected = false
  }
}