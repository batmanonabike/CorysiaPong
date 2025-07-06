import { Vector3 } from '@babylonjs/core'

export interface PlayerInput {
  playerId: string
  direction: 'up' | 'down' | 'none'
  timestamp: number
}

export interface GameStateMessage {
  ball: {
    position: Vector3
    velocity: Vector3
  }
  paddles: {
    left: Vector3
    right: Vector3
  }
  scores: {
    player1: number
    player2: number
  }
  gameStatus: 'waiting' | 'playing' | 'paused' | 'ended'
  timestamp: number
}

export interface PlayerJoinedMessage {
  playerId: string
  playerNumber: 1 | 2
  isHost: boolean
}

export interface PlayerLeftMessage {
  playerId: string
  playerNumber: 1 | 2
}

export interface GameStartMessage {
  timestamp: number
}

export interface ScoreUpdateMessage {
  player1Score: number
  player2Score: number
  timestamp: number
}

export interface ConnectionStatusMessage {
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error'
  message?: string
}