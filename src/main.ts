import './style.css'
import { Game } from './Game'

console.log('CorysiaPong initializing...')

let game: Game | null = null

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up game...')
  
  try {
    game = new Game()
    console.log('Game initialized successfully')
  } catch (error) {
    console.error('Failed to initialize game:', error)
  }
})

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (game) {
    game.dispose()
  }
})