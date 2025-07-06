import { Ball } from '../../src/game/Ball'
import { Vector3, Engine, Scene, NullEngine } from '@babylonjs/core'

describe('Ball', () => {
  let scene: Scene
  let ball: Ball

  beforeEach(() => {
    const engine = new NullEngine()
    scene = new Scene(engine)
    ball = new Ball(scene)
  })

  afterEach(() => {
    ball.dispose()
    scene.dispose()
  })

  describe('initialization', () => {
    it('should initialize with correct position', () => {
      const position = ball.getPosition()
      expect(position.x).toBe(0)
      expect(position.y).toBe(0)
      expect(position.z).toBe(0)
    })

    it('should initialize with correct velocity', () => {
      const velocity = ball.getVelocity()
      expect(Math.abs(velocity.x)).toBe(6)
      expect(velocity.y).toBe(0)
      expect(velocity.z).toBe(0)
    })
  })

  describe('movement', () => {
    it('should update position based on velocity', () => {
      const initialPosition = ball.getPosition()
      const velocity = ball.getVelocity()
      
      ball.update(1) // 1 second
      
      const newPosition = ball.getPosition()
      expect(newPosition.x).toBeCloseTo(initialPosition.x + velocity.x)
      expect(newPosition.y).toBeCloseTo(initialPosition.y + velocity.y)
      expect(newPosition.z).toBeCloseTo(initialPosition.z + velocity.z)
    })

    it('should bounce off top wall', () => {
      ball.setVelocity(new Vector3(0, 0, 10))
      ball.setPosition(new Vector3(0, 0, 4))
      
      const initialVelocityZ = ball.getVelocity().z
      ball.update(1)
      
      const newVelocityZ = ball.getVelocity().z
      expect(newVelocityZ).toBe(-initialVelocityZ)
    })

    it('should bounce off bottom wall', () => {
      ball.setVelocity(new Vector3(0, 0, -10))
      ball.setPosition(new Vector3(0, 0, -4))
      
      const initialVelocityZ = ball.getVelocity().z
      ball.update(1)
      
      const newVelocityZ = ball.getVelocity().z
      expect(newVelocityZ).toBe(-initialVelocityZ)
    })
  })

  describe('paddle collision', () => {
    it('should detect left paddle collision', () => {
      ball.setPosition(new Vector3(-6.5, 0, 0))
      ball.setVelocity(new Vector3(-6, 0, 0))
      
      const paddlePosition = new Vector3(-7, 0, 0)
      const collision = ball.checkPaddleCollision(paddlePosition, true)
      
      expect(collision).toBe(true)
    })

    it('should detect right paddle collision', () => {
      ball.setPosition(new Vector3(6.5, 0, 0))
      ball.setVelocity(new Vector3(6, 0, 0))
      
      const paddlePosition = new Vector3(7, 0, 0)
      const collision = ball.checkPaddleCollision(paddlePosition, false)
      
      expect(collision).toBe(true)
    })

    it('should not detect collision when ball is moving away from paddle', () => {
      ball.setPosition(new Vector3(-6.5, 0, 0))
      ball.setVelocity(new Vector3(6, 0, 0)) // Moving away from left paddle
      
      const paddlePosition = new Vector3(-7, 0, 0)
      const collision = ball.checkPaddleCollision(paddlePosition, true)
      
      expect(collision).toBe(false)
    })

    it('should reverse velocity on paddle collision', () => {
      ball.setVelocity(new Vector3(-6, 0, 0))
      const paddlePosition = new Vector3(-7, 0, 0)
      
      ball.handlePaddleCollision(paddlePosition)
      
      const newVelocity = ball.getVelocity()
      expect(newVelocity.x).toBeGreaterThan(0)
    })
  })

  describe('out of bounds detection', () => {
    it('should detect left side out of bounds', () => {
      ball.setPosition(new Vector3(-8, 0, 0))
      
      const result = ball.isOutOfBounds()
      
      expect(result.isOut).toBe(true)
      expect(result.side).toBe('left')
    })

    it('should detect right side out of bounds', () => {
      ball.setPosition(new Vector3(8, 0, 0))
      
      const result = ball.isOutOfBounds()
      
      expect(result.isOut).toBe(true)
      expect(result.side).toBe('right')
    })

    it('should not detect out of bounds when in play area', () => {
      ball.setPosition(new Vector3(0, 0, 0))
      
      const result = ball.isOutOfBounds()
      
      expect(result.isOut).toBe(false)
      expect(result.side).toBe(null)
    })
  })

  describe('reset', () => {
    it('should reset to center position', () => {
      ball.setPosition(new Vector3(5, 0, 3))
      
      ball.reset()
      
      const position = ball.getPosition()
      expect(position.x).toBe(0)
      expect(position.y).toBe(0)
      expect(position.z).toBe(0)
    })

    it('should reset velocity to initial speed', () => {
      ball.setVelocity(new Vector3(10, 5, 3))
      
      ball.reset()
      
      const velocity = ball.getVelocity()
      expect(Math.abs(velocity.x)).toBe(6)
      expect(velocity.y).toBe(0)
      expect(velocity.z).toBe(0)
    })
  })
})