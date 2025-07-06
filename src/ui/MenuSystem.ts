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
    this.elements.menu = document.getElementById('menu')!
    this.elements.gameContainer = document.getElementById('game-container')!
    this.elements.hostGameBtn = document.getElementById('host-game')!
    this.elements.joinGameBtn = document.getElementById('join-game')!
    this.elements.joinForm = document.getElementById('join-form')!
    this.elements.ipInput = document.getElementById('ip-input')! as HTMLInputElement
    this.elements.portInput = document.getElementById('port-input')! as HTMLInputElement
    this.elements.connectBtn = document.getElementById('connect-btn')!
    this.elements.score = document.getElementById('score')!
    this.elements.connectionStatus = document.getElementById('connection-status')!
  }

  private setupEventListeners(): void {
    this.elements.hostGameBtn.addEventListener('click', this.handleHostGame.bind(this))
    this.elements.joinGameBtn.addEventListener('click', this.handleJoinGameClick.bind(this))
    this.elements.connectBtn.addEventListener('click', this.handleConnect.bind(this))
    
    // Handle Enter key in input fields
    this.elements.ipInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleConnect()
      }
    })
    
    this.elements.portInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleConnect()
      }
    })
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
    this.elements.menu.classList.remove('hidden')
    this.elements.gameContainer.classList.add('hidden')
    this.elements.joinForm.classList.add('hidden')
    this.clearMessages()
  }

  public showGame(): void {
    this.currentState = 'game'
    this.elements.menu.classList.add('hidden')
    this.elements.gameContainer.classList.remove('hidden')
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
    this.elements.connectionStatus.textContent = message
    this.elements.connectionStatus.className = `connection-status ${type}`
  }

  public updateScore(player1Score: number, player2Score: number): void {
    this.elements.score.textContent = `Player 1: ${player1Score} | Player 2: ${player2Score}`
  }

  public updateConnectionStatus(status: string): void {
    this.elements.connectionStatus.textContent = status
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