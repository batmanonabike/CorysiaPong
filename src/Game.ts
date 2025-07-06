import { Vector3 } from '@babylonjs/core'
import { GameScene } from './game/Scene'
import { GameLogic } from './game/GameLogic'
import { InputHandler } from './input/InputHandler'
import { MenuSystem } from './ui/MenuSystem'
import { NetworkClient } from './network/Client'
import { GameRoomState, PlayerState } from './network/Room'

export class Game {
  private canvas: HTMLCanvasElement
  private gameScene: GameScene | null = null
  private gameLogic: GameLogic | null = null
  private inputHandler: InputHandler
  private menuSystem: MenuSystem
  private networkClient: NetworkClient
  private isHost: boolean = false
  private playerNumber: number = 0
  private lastUpdateTime: number = 0
  private gameLoop: number = 0

  constructor() {
    this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
    this.inputHandler = new InputHandler()
    this.networkClient = new NetworkClient()
    
    this.menuSystem = new MenuSystem({
      onHostGame: this.handleHostGame.bind(this),
      onJoinGame: this.handleJoinGame.bind(this),
      onBackToMenu: this.handleBackToMenu.bind(this),
      onStartGame: this.handleStartGame.bind(this),
      onPauseGame: this.handlePauseGame.bind(this),
      onResetGame: this.handleResetGame.bind(this)
    })

    this.setupNetworkCallbacks()
    this.setupInputCallbacks()
    this.setupWindowEvents()
  }

  private setupNetworkCallbacks(): void {
    this.networkClient.onStateChangeListener((state: GameRoomState) => {
      this.handleNetworkStateChange(state)
    })

    this.networkClient.onPlayerJoinedListener((player: PlayerState) => {
      console.log(`Player ${player.playerNumber} joined`)
      if (this.networkClient.getPlayerCount() === 2) {
        this.menuSystem.showGameReady()
      }
    })

    this.networkClient.onPlayerLeftListener((playerId: string) => {
      console.log(`Player ${playerId} left`)
      this.menuSystem.showPlayerDisconnected()
    })

    this.networkClient.onConnectionStatusChangeListener((status) => {
      switch (status.status) {
        case 'connected':
          this.menuSystem.showSuccess('Connected!')
          break
        case 'disconnected':
          this.menuSystem.showError('Disconnected')
          break
        case 'connecting':
          this.menuSystem.showLoadingState('Connecting...')
          break
        case 'error':
          this.menuSystem.showError(status.message || 'Connection error')
          break
      }
    })

    this.networkClient.onGameStartListener(() => {
      this.startGame()
    })

    this.networkClient.onScoreUpdateListener((player1, player2) => {
      this.menuSystem.updateScore(player1, player2)
    })
  }

  private setupInputCallbacks(): void {
    this.inputHandler.addInputCallback((direction) => {
      if (this.gameLogic && this.networkClient.isConnected()) {
        this.networkClient.sendPlayerInput(direction)
        this.handleLocalInput(direction)
      }
    })
  }

  private setupWindowEvents(): void {
    window.addEventListener('resize', () => {
      this.gameScene?.resize()
    })

    window.addEventListener('beforeunload', () => {
      this.dispose()
    })
  }

  private async handleHostGame(): Promise<void> {
    try {
      const result = await this.networkClient.createRoom()
      if (result.success) {
        this.isHost = true
        this.playerNumber = 1
        this.menuSystem.showWaitingForPlayers()
        this.initializeGame()
      } else {
        this.menuSystem.showError(result.error || 'Failed to create room')
      }
    } catch (error) {
      this.menuSystem.showError('Failed to create room')
    }
  }

  private async handleJoinGame(ip: string, port: string): Promise<void> {
    try {
      const result = await this.networkClient.joinByIP(ip, port)
      if (result.success) {
        this.isHost = false
        this.playerNumber = 2
        this.menuSystem.showSuccess('Connected to game!')
        this.initializeGame()
      } else {
        this.menuSystem.showError(result.error || 'Failed to join room')
      }
    } catch (error) {
      this.menuSystem.showError('Failed to connect to room')
    }
  }

  private handleBackToMenu(): void {
    this.stopGame()
    this.networkClient.leaveRoom()
    this.menuSystem.showMainMenu()
  }

  private handleStartGame(): void {
    if (this.isHost) {
      this.networkClient.startGame()
    }
  }

  private handlePauseGame(): void {
    if (this.isHost) {
      this.networkClient.pauseGame()
    }
  }

  private handleResetGame(): void {
    if (this.isHost) {
      this.networkClient.resetGame()
      this.gameLogic?.resetGame()
    }
  }

  private initializeGame(): void {
    if (!this.gameScene) {
      this.gameScene = new GameScene(this.canvas)
      this.gameLogic = new GameLogic(this.gameScene.getScene())
    }
    this.menuSystem.showGame()
  }

  private startGame(): void {
    if (this.gameLogic) {
      this.gameLogic.startGame()
      this.menuSystem.showGameStarted()
      this.startGameLoop()
    }
  }

  private stopGame(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop)
      this.gameLoop = 0
    }
    this.gameLogic?.pauseGame()
  }

  private startGameLoop(): void {
    if (this.gameScene) {
      this.gameScene.startRenderLoop()
    }
    this.lastUpdateTime = performance.now()
    this.gameLoop = requestAnimationFrame(this.update.bind(this))
  }

  private update(currentTime: number): void {
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000
    this.lastUpdateTime = currentTime

    if (this.gameLogic) {
      this.gameLogic.update(deltaTime)
      
      // Host sends game state to other players
      if (this.isHost) {
        this.sendGameState()
      }
    }

    this.gameLoop = requestAnimationFrame(this.update.bind(this))
  }

  private handleNetworkStateChange(state: GameRoomState): void {
    if (!this.gameLogic) return

    // Update local game state from network
    if (!this.isHost) {
      // Non-host clients receive authoritative state from host
      const ballPos = new Vector3(state.ball.x, state.ball.y, state.ball.z)
      const ballVel = new Vector3(state.ball.velocityX, state.ball.velocityY, state.ball.velocityZ)
      this.gameLogic.setBallState(ballPos, ballVel)
    }

    // Update paddle positions
    const players = Array.from(state.players.values())
    players.forEach(player => {
      if (player.playerNumber === 1) {
        this.gameLogic!.setLeftPaddlePosition(player.paddlePosition)
      } else if (player.playerNumber === 2) {
        this.gameLogic!.setRightPaddlePosition(player.paddlePosition)
      }
    })

    // Update scores
    this.menuSystem.updateScore(state.player1Score, state.player2Score)

    // Handle game status changes
    if (state.gameStatus === 'ended') {
      const winner = state.player1Score > state.player2Score ? 'Player 1' : 'Player 2'
      this.menuSystem.showGameEnded(winner)
      this.stopGame()
    }
  }

  private handleLocalInput(direction: 'up' | 'down' | 'none'): void {
    if (!this.gameLogic) return

    const deltaTime = 1/60 // Assume 60 FPS for input response

    if (this.playerNumber === 1) {
      if (direction === 'up') {
        this.gameLogic.moveLeftPaddle('up', deltaTime)
      } else if (direction === 'down') {
        this.gameLogic.moveLeftPaddle('down', deltaTime)
      }
      
      // Send paddle position to network
      const paddlePos = this.gameLogic.getLeftPaddle().getPosition()
      this.networkClient.sendPaddlePosition(paddlePos.z)
      
    } else if (this.playerNumber === 2) {
      if (direction === 'up') {
        this.gameLogic.moveRightPaddle('up', deltaTime)
      } else if (direction === 'down') {
        this.gameLogic.moveRightPaddle('down', deltaTime)
      }
      
      // Send paddle position to network
      const paddlePos = this.gameLogic.getRightPaddle().getPosition()
      this.networkClient.sendPaddlePosition(paddlePos.z)
    }
  }

  private sendGameState(): void {
    if (!this.gameLogic || !this.isHost) return

    const gameState = this.gameLogic.getGameState()
    
    // Send ball state
    this.networkClient.sendBallState(gameState.ball.position, gameState.ball.velocity)
    
    // Send score updates
    this.networkClient.sendScoreUpdate(gameState.player1Score, gameState.player2Score)
  }

  public dispose(): void {
    this.stopGame()
    this.networkClient.dispose()
    this.gameScene?.dispose()
    this.gameLogic?.dispose()
    this.inputHandler.dispose()
    this.menuSystem.dispose()
  }
}