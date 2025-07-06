import './style.css'

console.log('CorysiaPong initializing...')

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up game...')
  
  // Get menu elements
  const hostGameBtn = document.getElementById('host-game') as HTMLButtonElement
  const joinGameBtn = document.getElementById('join-game') as HTMLButtonElement
  const joinForm = document.getElementById('join-form') as HTMLDivElement
  const connectBtn = document.getElementById('connect-btn') as HTMLButtonElement
  const ipInput = document.getElementById('ip-input') as HTMLInputElement
  const portInput = document.getElementById('port-input') as HTMLInputElement
  
  // Menu event handlers
  hostGameBtn?.addEventListener('click', () => {
    console.log('Host game clicked')
    // TODO: Implement host game logic
  })
  
  joinGameBtn?.addEventListener('click', () => {
    console.log('Join game clicked')
    joinForm?.classList.toggle('hidden')
  })
  
  connectBtn?.addEventListener('click', () => {
    const ip = ipInput?.value || 'localhost'
    const port = portInput?.value || '2567'
    console.log(`Connecting to ${ip}:${port}`)
    // TODO: Implement connection logic
  })
})