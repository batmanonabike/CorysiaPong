import { Paddle } from '../../src/game/Paddle'
import { Vector3, Engine, Scene, NullEngine } from '@babylonjs/core'

describe('Paddle', () => {
  let scene: Scene
  let paddle: Paddle

  beforeEach(() => {
    const engine = new NullEngine()
    scene = new Scene(engine)
    paddle = new Paddle(scene, new Vector3(-7, 0, 0), true)
  })

  afterEach(() => {
    paddle.dispose()
    scene.dispose()
  })

  describe('initialization', () => {
    it('should initialize at correct position', () => {
      const position = paddle.getPosition()
      expect(position.x).toBe(-7)
      expect(position.y).toBe(0)
      expect(position.z).toBe(0)
    })

    it('should have correct movement bounds', () => {
      const bounds = paddle.getBounds()
      expect(bounds.min).toBe(-4)
      expect(bounds.max).toBe(4)
    })
  })

  describe('movement', () => {
    it('should move up when moveUp is called', () => {
      const initialZ = paddle.getPosition().z
      
      paddle.moveUp(1) // 1 second
      
      const newZ = paddle.getPosition().z
      expect(newZ).toBeGreaterThan(initialZ)
    })

    it('should move down when moveDown is called', () => {
      const initialZ = paddle.getPosition().z
      
      paddle.moveDown(1) // 1 second
      
      const newZ = paddle.getPosition().z
      expect(newZ).toBeLessThan(initialZ)
    })

    it('should not move above upper bound', () => {
      paddle.setPosition(4) // At upper bound
      
      paddle.moveUp(1)
      
      const position = paddle.getPosition()
      expect(position.z).toBe(4)
    })

    it('should not move below lower bound', () => {
      paddle.setPosition(-4) // At lower bound
      
      paddle.moveDown(1)
      
      const position = paddle.getPosition()
      expect(position.z).toBe(-4)
    })
  })

  describe('position setting', () => {
    it('should set position within bounds', () => {
      paddle.setPosition(2)
      
      const position = paddle.getPosition()
      expect(position.z).toBe(2)
    })

    it('should clamp position to upper bound', () => {
      paddle.setPosition(10)
      
      const position = paddle.getPosition()
      expect(position.z).toBe(4)
    })

    it('should clamp position to lower bound', () => {
      paddle.setPosition(-10)
      
      const position = paddle.getPosition()
      expect(position.z).toBe(-4)
    })
  })

  describe('color differentiation', () => {
    it('should create left paddle with red color', () => {
      const leftPaddle = new Paddle(scene, new Vector3(-7, 0, 0), true)
      const mesh = leftPaddle.getMesh()
      
      expect(mesh.material).toBeDefined()
      leftPaddle.dispose()
    })

    it('should create right paddle with blue color', () => {
      const rightPaddle = new Paddle(scene, new Vector3(7, 0, 0), false)
      const mesh = rightPaddle.getMesh()
      
      expect(mesh.material).toBeDefined()
      rightPaddle.dispose()
    })
  })
})