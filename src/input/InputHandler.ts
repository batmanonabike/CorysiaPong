export interface InputState {
  up: boolean
  down: boolean
  space: boolean
  escape: boolean
}

export type InputCallback = (direction: 'up' | 'down' | 'none') => void

export class InputHandler {
  private inputState: InputState = {
    up: false,
    down: false,
    space: false,
    escape: false
  }

  private keyBindings: Map<string, keyof InputState> = new Map([
    ['ArrowUp', 'up'],
    ['KeyW', 'up'],
    ['ArrowDown', 'down'],
    ['KeyS', 'down'],
    ['Space', 'space'],
    ['Escape', 'escape']
  ])

  private inputCallbacks: InputCallback[] = []
  private isEnabled: boolean = true

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
    
    // Prevent default behavior for game keys
    document.addEventListener('keydown', (event) => {
      if (this.keyBindings.has(event.code) && this.isEnabled) {
        event.preventDefault()
      }
    })
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return

    const inputKey = this.keyBindings.get(event.code)
    if (inputKey && !this.inputState[inputKey]) {
      this.inputState[inputKey] = true
      this.notifyInputChange()
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.isEnabled) return

    const inputKey = this.keyBindings.get(event.code)
    if (inputKey && this.inputState[inputKey]) {
      this.inputState[inputKey] = false
      this.notifyInputChange()
    }
  }

  private notifyInputChange(): void {
    const direction = this.getCurrentDirection()
    this.inputCallbacks.forEach(callback => callback(direction))
  }

  private getCurrentDirection(): 'up' | 'down' | 'none' {
    if (this.inputState.up && !this.inputState.down) {
      return 'up'
    } else if (this.inputState.down && !this.inputState.up) {
      return 'down'
    }
    return 'none'
  }

  public addInputCallback(callback: InputCallback): void {
    this.inputCallbacks.push(callback)
  }

  public removeInputCallback(callback: InputCallback): void {
    const index = this.inputCallbacks.indexOf(callback)
    if (index !== -1) {
      this.inputCallbacks.splice(index, 1)
    }
  }

  public getInputState(): InputState {
    return { ...this.inputState }
  }

  public isKeyPressed(key: keyof InputState): boolean {
    return this.inputState[key]
  }

  public enable(): void {
    this.isEnabled = true
  }

  public disable(): void {
    this.isEnabled = false
    // Clear all input states
    this.inputState = {
      up: false,
      down: false,
      space: false,
      escape: false
    }
  }

  public dispose(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    document.removeEventListener('keyup', this.handleKeyUp.bind(this))
    this.inputCallbacks.length = 0
  }
}