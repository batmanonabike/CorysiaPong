import { InputHandler } from '../../src/input/InputHandler'

describe('InputHandler', () => {
  let inputHandler: InputHandler
  let mockCallback: jest.Mock

  beforeEach(() => {
    inputHandler = new InputHandler()
    mockCallback = jest.fn()
    inputHandler.addInputCallback(mockCallback)
  })

  afterEach(() => {
    inputHandler.dispose()
  })

  describe('initialization', () => {
    it('should initialize with all keys released', () => {
      const inputState = inputHandler.getInputState()
      
      expect(inputState.up).toBe(false)
      expect(inputState.down).toBe(false)
      expect(inputState.space).toBe(false)
      expect(inputState.escape).toBe(false)
    })

    it('should be enabled by default', () => {
      expect(inputHandler.isKeyPressed('up')).toBe(false)
      expect(inputHandler.isKeyPressed('down')).toBe(false)
    })
  })

  describe('key press detection', () => {
    it('should detect arrow up key press', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' })
      document.dispatchEvent(event)
      
      expect(inputHandler.isKeyPressed('up')).toBe(true)
      expect(mockCallback).toHaveBeenCalledWith('up')
    })

    it('should detect W key press', () => {
      const event = new KeyboardEvent('keydown', { code: 'KeyW' })
      document.dispatchEvent(event)
      
      expect(inputHandler.isKeyPressed('up')).toBe(true)
      expect(mockCallback).toHaveBeenCalledWith('up')
    })

    it('should detect arrow down key press', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowDown' })
      document.dispatchEvent(event)
      
      expect(inputHandler.isKeyPressed('down')).toBe(true)
      expect(mockCallback).toHaveBeenCalledWith('down')
    })

    it('should detect S key press', () => {
      const event = new KeyboardEvent('keydown', { code: 'KeyS' })
      document.dispatchEvent(event)
      
      expect(inputHandler.isKeyPressed('down')).toBe(true)
      expect(mockCallback).toHaveBeenCalledWith('down')
    })

    it('should detect space key press', () => {
      const event = new KeyboardEvent('keydown', { code: 'Space' })
      document.dispatchEvent(event)
      
      expect(inputHandler.isKeyPressed('space')).toBe(true)
    })

    it('should detect escape key press', () => {
      const event = new KeyboardEvent('keydown', { code: 'Escape' })
      document.dispatchEvent(event)
      
      expect(inputHandler.isKeyPressed('escape')).toBe(true)
    })
  })

  describe('key release detection', () => {
    it('should detect key release', () => {
      const keyDownEvent = new KeyboardEvent('keydown', { code: 'ArrowUp' })
      const keyUpEvent = new KeyboardEvent('keyup', { code: 'ArrowUp' })
      
      document.dispatchEvent(keyDownEvent)
      expect(inputHandler.isKeyPressed('up')).toBe(true)
      
      document.dispatchEvent(keyUpEvent)
      expect(inputHandler.isKeyPressed('up')).toBe(false)
      expect(mockCallback).toHaveBeenCalledWith('none')
    })
  })

  describe('direction calculation', () => {
    it('should return "up" when only up key is pressed', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' })
      document.dispatchEvent(event)
      
      expect(mockCallback).toHaveBeenCalledWith('up')
    })

    it('should return "down" when only down key is pressed', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowDown' })
      document.dispatchEvent(event)
      
      expect(mockCallback).toHaveBeenCalledWith('down')
    })

    it('should return "none" when both up and down keys are pressed', () => {
      const upEvent = new KeyboardEvent('keydown', { code: 'ArrowUp' })
      const downEvent = new KeyboardEvent('keydown', { code: 'ArrowDown' })
      
      document.dispatchEvent(upEvent)
      document.dispatchEvent(downEvent)
      
      expect(mockCallback).toHaveBeenCalledWith('none')
    })

    it('should return "none" when no keys are pressed', () => {
      expect(mockCallback).toHaveBeenCalledWith('none')
    })
  })

  describe('enable/disable functionality', () => {
    it('should not respond to input when disabled', () => {
      inputHandler.disable()
      
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' })
      document.dispatchEvent(event)
      
      expect(inputHandler.isKeyPressed('up')).toBe(false)
    })

    it('should respond to input when re-enabled', () => {
      inputHandler.disable()
      inputHandler.enable()
      
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' })
      document.dispatchEvent(event)
      
      expect(inputHandler.isKeyPressed('up')).toBe(true)
    })

    it('should clear input state when disabled', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' })
      document.dispatchEvent(event)
      expect(inputHandler.isKeyPressed('up')).toBe(true)
      
      inputHandler.disable()
      expect(inputHandler.isKeyPressed('up')).toBe(false)
    })
  })

  describe('callback management', () => {
    it('should add multiple callbacks', () => {
      const secondCallback = jest.fn()
      inputHandler.addInputCallback(secondCallback)
      
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' })
      document.dispatchEvent(event)
      
      expect(mockCallback).toHaveBeenCalled()
      expect(secondCallback).toHaveBeenCalled()
    })

    it('should remove callbacks', () => {
      inputHandler.removeInputCallback(mockCallback)
      
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' })
      document.dispatchEvent(event)
      
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })
})