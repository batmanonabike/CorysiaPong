import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, Mesh } from '@babylonjs/core'

export class Paddle {
  private mesh: Mesh
  private scene: Scene
  private speed: number = 8
  private bounds: { min: number; max: number }

  constructor(scene: Scene, position: Vector3, isLeft: boolean = true) {
    this.scene = scene
    this.bounds = { min: -4, max: 4 }
    this.createPaddle(position, isLeft)
  }

  private createPaddle(position: Vector3, isLeft: boolean): void {
    this.mesh = MeshBuilder.CreateBox('paddle', {
      width: 0.2,
      height: 1,
      depth: 2
    }, this.scene)

    this.mesh.position = position

    const material = new StandardMaterial('paddleMaterial', this.scene)
    material.diffuseColor = isLeft ? new Color3(1, 0.2, 0.2) : new Color3(0.2, 0.2, 1)
    this.mesh.material = material
  }

  public moveUp(deltaTime: number): void {
    const newZ = this.mesh.position.z + this.speed * deltaTime
    this.mesh.position.z = Math.min(newZ, this.bounds.max)
  }

  public moveDown(deltaTime: number): void {
    const newZ = this.mesh.position.z - this.speed * deltaTime
    this.mesh.position.z = Math.max(newZ, this.bounds.min)
  }

  public setPosition(z: number): void {
    this.mesh.position.z = Math.max(this.bounds.min, Math.min(this.bounds.max, z))
  }

  public getPosition(): Vector3 {
    return this.mesh.position.clone()
  }

  public getMesh(): Mesh {
    return this.mesh
  }

  public getBounds(): { min: number; max: number } {
    return this.bounds
  }

  public dispose(): void {
    this.mesh.dispose()
  }
}