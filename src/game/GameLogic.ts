import { Scene, Vector3 } from '@babylonjs/core'
import { Paddle } from './Paddle'
import { Ball } from './Ball'

export interface GameState {
  player1Score: number
  player2Score: number
  ball: {
    position: Vector3
    velocity: Vector3
  }
  paddles: {
    left: Vector3
    right: Vector3
  }
  gameStatus: 'waiting' | 'playing' | 'paused' | 'ended'
}

export class GameLogic {
  private scene: Scene
  private leftPaddle: Paddle
  private rightPaddle: Paddle
  private ball: Ball
  private gameState: GameState
  private maxScore: number = 5

  constructor(scene: Scene) {
    this.scene = scene
    this.initializeGame()
  }

  private initializeGame(): void {
    // Create paddles
    this.leftPaddle = new Paddle(this.scene, new Vector3(-7, 0, 0), true)
    this.rightPaddle = new Paddle(this.scene, new Vector3(7, 0, 0), false)
    
    // Create ball
    this.ball = new Ball(this.scene)
    
    // Initialize game state
    this.gameState = {
      player1Score: 0,
      player2Score: 0,
      ball: {
        position: this.ball.getPosition(),
        velocity: this.ball.getVelocity()
      },
      paddles: {
        left: this.leftPaddle.getPosition(),
        right: this.rightPaddle.getPosition()
      },
      gameStatus: 'waiting'
    }
  }

  public update(deltaTime: number): void {
    if (this.gameState.gameStatus !== 'playing') return

    // Update ball
    this.ball.update(deltaTime)

    // Check paddle collisions
    if (this.ball.checkPaddleCollision(this.leftPaddle.getPosition(), true)) {
      this.ball.handlePaddleCollision(this.leftPaddle.getPosition())
    }
    
    if (this.ball.checkPaddleCollision(this.rightPaddle.getPosition(), false)) {
      this.ball.handlePaddleCollision(this.rightPaddle.getPosition())
    }

    // Check if ball is out of bounds
    const outOfBounds = this.ball.isOutOfBounds()
    if (outOfBounds.isOut) {
      this.handleScore(outOfBounds.side!)
    }

    // Update game state
    this.updateGameState()
  }

  private handleScore(side: 'left' | 'right'): void {
    if (side === 'left') {
      this.gameState.player2Score++
    } else {
      this.gameState.player1Score++
    }

    // Check for game end
    if (this.gameState.player1Score >= this.maxScore || 
        this.gameState.player2Score >= this.maxScore) {
      this.gameState.gameStatus = 'ended'
    } else {
      // Reset ball
      this.ball.reset()
    }
  }

  private updateGameState(): void {
    this.gameState.ball.position = this.ball.getPosition()
    this.gameState.ball.velocity = this.ball.getVelocity()
    this.gameState.paddles.left = this.leftPaddle.getPosition()
    this.gameState.paddles.right = this.rightPaddle.getPosition()
  }

  public moveLeftPaddle(direction: 'up' | 'down', deltaTime: number): void {
    if (direction === 'up') {
      this.leftPaddle.moveUp(deltaTime)
    } else {
      this.leftPaddle.moveDown(deltaTime)
    }
  }

  public moveRightPaddle(direction: 'up' | 'down', deltaTime: number): void {
    if (direction === 'up') {
      this.rightPaddle.moveUp(deltaTime)
    } else {
      this.rightPaddle.moveDown(deltaTime)
    }
  }

  public setLeftPaddlePosition(z: number): void {
    this.leftPaddle.setPosition(z)
  }

  public setRightPaddlePosition(z: number): void {
    this.rightPaddle.setPosition(z)
  }

  public setBallState(position: Vector3, velocity: Vector3): void {
    this.ball.setPosition(position)
    this.ball.setVelocity(velocity)
  }

  public startGame(): void {
    this.gameState.gameStatus = 'playing'
  }

  public pauseGame(): void {
    this.gameState.gameStatus = 'paused'
  }

  public resetGame(): void {
    this.gameState.player1Score = 0
    this.gameState.player2Score = 0
    this.gameState.gameStatus = 'waiting'
    this.ball.reset()
    this.leftPaddle.setPosition(0)
    this.rightPaddle.setPosition(0)
  }

  public getGameState(): GameState {
    return { ...this.gameState }
  }

  public getLeftPaddle(): Paddle {
    return this.leftPaddle
  }

  public getRightPaddle(): Paddle {
    return this.rightPaddle
  }

  public getBall(): Ball {
    return this.ball
  }

  public dispose(): void {
    this.leftPaddle.dispose()
    this.rightPaddle.dispose()
    this.ball.dispose()
  }
}