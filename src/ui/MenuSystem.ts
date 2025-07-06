export type MenuState = 'main' | 'host' | 'join' | 'game' | 'settings'

export interface MenuCallbacks {
  onHostGame: () => void
  onJoinGame: (ip: string, port: string) => void
  onBackToMenu: () => void
  onStartGame: () => void
  onPauseGame: () => void
  onResetGame: () => void
}

export class MenuSystem {
  private currentState: MenuState = 'main'
  private callbacks: MenuCallbacks
  private elements: { [key: string]: HTMLElement } = {}

  constructor(callbacks: MenuCallbacks) {
    this.callbacks = callbacks
    this.initializeElements()
    this.setupEventListeners()
  }

  private initializeElements(): void {
    this.elements.menu = document.getElementById('menu') || document.createElement('div')
    this.elements.gameContainer = document.getElementById('game-container') || document.createElement('div')
    this.elements.hostGameBtn = document.getElementById('host-game') || document.createElement('button')
    this.elements.joinGameBtn = document.getElementById('join-game') || document.createElement('button')
    this.elements.joinForm = document.getElementById('join-form') || document.createElement('div')
    this.elements.ipInput = (document.getElementById('ip-input') || document.createElement('input')) as HTMLInputElement
    this.elements.portInput = (document.getElementById('port-input') || document.createElement('input')) as HTMLInputElement
    this.elements.connectBtn = document.getElementById('connect-btn') || document.createElement('button')
    this.elements.score = document.getElementById('score') || document.createElement('div')
    this.elements.connectionStatus = document.getElementById('connection-status') || document.createElement('div')
  }

  private setupEventListeners(): void {
    if (this.elements.hostGameBtn) {
      this.elements.hostGameBtn.addEventListener('click', this.handleHostGame.bind(this))
    }
    if (this.elements.joinGameBtn) {
      this.elements.joinGameBtn.addEventListener('click', this.handleJoinGameClick.bind(this))
    }
    if (this.elements.connectBtn) {
      this.elements.connectBtn.addEventListener('click', this.handleConnect.bind(this))
    }
    
    // Handle Enter key in input fields
    if (this.elements.ipInput) {
      this.elements.ipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleConnect()
        }
      })
    }
    
    if (this.elements.portInput) {
      this.elements.portInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleConnect()
        }
      })
    }
  }

  private handleHostGame(): void {
    this.showLoadingState('Creating game...')
    this.callbacks.onHostGame()
  }

  private handleJoinGameClick(): void {
    const isVisible = !this.elements.joinForm.classList.contains('hidden')
    this.elements.joinForm.classList.toggle('hidden', isVisible)
    
    if (!isVisible) {
      this.elements.ipInput.focus()
    }
  }

  private handleConnect(): void {
    const ip = (this.elements.ipInput as HTMLInputElement).value.trim()
    const port = (this.elements.portInput as HTMLInputElement).value.trim()
    
    if (!ip || !port) {
      this.showError('Please enter both IP and Port')
      return
    }
    
    this.showLoadingState('Connecting...')
    this.callbacks.onJoinGame(ip, port)
  }

  public showMainMenu(): void {
    this.currentState = 'main'
    
    // Use actual DOM elements instead of stored references
    const menu = document.getElementById('menu')
    const gameContainer = document.getElementById('game-container')
    const joinForm = document.getElementById('join-form')
    
    if (menu) menu.classList.remove('hidden')
    if (gameContainer) gameContainer.classList.add('hidden')
    if (joinForm) joinForm.classList.add('hidden')
    this.clearMessages()
  }

  public showGame(): void {
    this.currentState = 'game'
    
    // Use actual DOM elements instead of stored references
    const menu = document.getElementById('menu')
    const gameContainer = document.getElementById('game-container')
    
    if (menu) menu.classList.add('hidden')
    if (gameContainer) gameContainer.classList.remove('hidden')
    
    console.log('MenuSystem.showGame() called - switching to game view')
  }

  public showLoadingState(message: string): void {
    this.setConnectionStatus(message, 'loading')
    this.disableButtons()
  }

  public showError(message: string): void {
    this.setConnectionStatus(message, 'error')
    this.enableButtons()
  }

  public showSuccess(message: string): void {
    this.setConnectionStatus(message, 'success')
  }

  public setConnectionStatus(message: string, type: 'loading' | 'error' | 'success' | 'info' = 'info'): void {
    const statusElement = document.getElementById('connection-status')
    if (statusElement) {
      statusElement.textContent = message
      statusElement.className = `connection-status ${type}`
    }
    console.log(`Status: ${message} (${type})`)
  }

  public updateScore(player1Score: number, player2Score: number): void {
    const scoreElement = document.getElementById('score')
    if (scoreElement) {
      scoreElement.textContent = `Player 1: ${player1Score} | Player 2: ${player2Score}`
    }
  }

  public updateConnectionStatus(status: string): void {
    const statusElement = document.getElementById('connection-status')
    if (statusElement) {
      statusElement.textContent = status
    }
  }

  public showWaitingForPlayers(): void {
    this.setConnectionStatus('Waiting for another player...', 'info')
  }

  public showGameReady(): void {
    this.setConnectionStatus('Game Ready!', 'success')
  }

  public showGameStarted(): void {
    this.setConnectionStatus('Game Started!', 'success')
  }

  public showGameEnded(winner: string): void {
    this.setConnectionStatus(`Game Over! ${winner} wins!`, 'info')
  }

  public showPlayerDisconnected(): void {
    this.setConnectionStatus('Player disconnected', 'error')
  }

  public showReconnecting(): void {
    this.setConnectionStatus('Reconnecting...', 'loading')
  }

  private disableButtons(): void {
    this.elements.hostGameBtn.setAttribute('disabled', 'true')
    this.elements.joinGameBtn.setAttribute('disabled', 'true')
    this.elements.connectBtn.setAttribute('disabled', 'true')
  }

  private enableButtons(): void {
    this.elements.hostGameBtn.removeAttribute('disabled')
    this.elements.joinGameBtn.removeAttribute('disabled')
    this.elements.connectBtn.removeAttribute('disabled')
  }

  private clearMessages(): void {
    this.elements.connectionStatus.textContent = ''
    this.elements.connectionStatus.className = 'connection-status'
  }

  public getCurrentState(): MenuState {
    return this.currentState
  }

  public getRoomInfo(): { ip: string; port: string } {
    return {
      ip: (this.elements.ipInput as HTMLInputElement).value,
      port: (this.elements.portInput as HTMLInputElement).value
    }
  }

  public setRoomInfo(ip: string, port: string): void {
    (this.elements.ipInput as HTMLInputElement).value = ip;
    (this.elements.portInput as HTMLInputElement).value = port
  }

  public dispose(): void {
    // Remove event listeners
    this.elements.hostGameBtn.removeEventListener('click', this.handleHostGame.bind(this))
    this.elements.joinGameBtn.removeEventListener('click', this.handleJoinGameClick.bind(this))
    this.elements.connectBtn.removeEventListener('click', this.handleConnect.bind(this))
  }
}