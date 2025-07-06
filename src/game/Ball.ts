import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, Mesh } from '@babylonjs/core'

export class Ball {
  private mesh: Mesh
  private scene: Scene
  private velocity: Vector3
  private speed: number = 6
  private bounds: { 
    minX: number; 
    maxX: number; 
    minZ: number; 
    maxZ: number 
  }

  constructor(scene: Scene) {
    this.scene = scene
    this.bounds = { 
      minX: -7.5, 
      maxX: 7.5, 
      minZ: -4.5, 
      maxZ: 4.5 
    }
    this.velocity = new Vector3(this.speed, 0, 0)
    this.createBall()
  }

  private createBall(): void {
    this.mesh = MeshBuilder.CreateSphere('ball', {
      diameter: 0.3
    }, this.scene)

    this.mesh.position = Vector3.Zero()

    const material = new StandardMaterial('ballMaterial', this.scene)
    material.diffuseColor = new Color3(1, 1, 0)
    material.emissiveColor = new Color3(0.2, 0.2, 0)
    this.mesh.material = material
  }

  public update(deltaTime: number): void {
    // Update position
    this.mesh.position.addInPlace(this.velocity.scale(deltaTime))

    // Check wall collisions (top and bottom)
    if (this.mesh.position.z >= this.bounds.maxZ || this.mesh.position.z <= this.bounds.minZ) {
      this.velocity.z = -this.velocity.z
      this.mesh.position.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, this.mesh.position.z))
    }
  }

  public checkPaddleCollision(paddlePosition: Vector3, paddleIsLeft: boolean): boolean {
    const ballPos = this.mesh.position
    const paddleX = paddlePosition.x
    const paddleZ = paddlePosition.z
    
    // Check if ball is at paddle's X position
    const ballRadius = 0.15
    const paddleWidth = 0.2
    const paddleHeight = 2
    
    if (paddleIsLeft) {
      // Left paddle collision
      if (ballPos.x - ballRadius <= paddleX + paddleWidth / 2 && 
          ballPos.x >= paddleX && 
          this.velocity.x < 0) {
        // Check if ball is within paddle height
        if (ballPos.z >= paddleZ - paddleHeight / 2 && 
            ballPos.z <= paddleZ + paddleHeight / 2) {
          return true
        }
      }
    } else {
      // Right paddle collision
      if (ballPos.x + ballRadius >= paddleX - paddleWidth / 2 && 
          ballPos.x <= paddleX && 
          this.velocity.x > 0) {
        // Check if ball is within paddle height
        if (ballPos.z >= paddleZ - paddleHeight / 2 && 
            ballPos.z <= paddleZ + paddleHeight / 2) {
          return true
        }
      }
    }
    
    return false
  }

  public handlePaddleCollision(paddlePosition: Vector3): void {
    // Reverse X velocity
    this.velocity.x = -this.velocity.x
    
    // Add some angle based on where ball hits paddle
    const paddleCenter = paddlePosition.z
    const ballCenter = this.mesh.position.z
    const hitOffset = ballCenter - paddleCenter
    
    // Add vertical component based on hit position
    this.velocity.z = hitOffset * 2
    
    // Normalize and maintain speed
    const currentSpeed = this.velocity.length()
    this.velocity.normalize()
    this.velocity.scaleInPlace(Math.max(currentSpeed, this.speed))
  }

  public isOutOfBounds(): { isOut: boolean; side: 'left' | 'right' | null } {
    if (this.mesh.position.x < this.bounds.minX) {
      return { isOut: true, side: 'left' }
    }
    if (this.mesh.position.x > this.bounds.maxX) {
      return { isOut: true, side: 'right' }
    }
    return { isOut: false, side: null }
  }

  public reset(): void {
    this.mesh.position = Vector3.Zero()
    // Random direction
    const direction = Math.random() > 0.5 ? 1 : -1
    this.velocity = new Vector3(this.speed * direction, 0, 0)
  }

  public setPosition(position: Vector3): void {
    this.mesh.position = position.clone()
  }

  public setVelocity(velocity: Vector3): void {
    this.velocity = velocity.clone()
  }

  public getPosition(): Vector3 {
    return this.mesh.position.clone()
  }

  public getVelocity(): Vector3 {
    return this.velocity.clone()
  }

  public getMesh(): Mesh {
    return this.mesh
  }

  public dispose(): void {
    this.mesh.dispose()
  }
}