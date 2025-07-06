import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, Color3, MeshBuilder, StandardMaterial, Mesh } from '@babylonjs/core'

export class GameScene {
  private engine: Engine
  private scene: Scene
  private camera: ArcRotateCamera
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.engine = new Engine(canvas, true)
    this.scene = new Scene(this.engine)
    this.setupScene()
    this.setupCamera()
    this.setupLighting()
    this.createGameArena()
  }

  private setupScene(): void {
    this.scene.clearColor = new Color3(0.1, 0.1, 0.2)
  }

  private setupCamera(): void {
    this.camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      20,
      Vector3.Zero(),
      this.scene
    )
    this.camera.setTarget(Vector3.Zero())
    this.camera.attachControls(this.canvas, true)
  }

  private setupLighting(): void {
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene)
    light.intensity = 0.8
  }

  private createGameArena(): void {
    const arenaWidth = 16
    const arenaHeight = 10
    const wallThickness = 0.5

    // Create arena floor
    const floor = MeshBuilder.CreateBox('floor', {
      width: arenaWidth,
      height: 0.1,
      depth: arenaHeight
    }, this.scene)
    floor.position.y = -0.5

    const floorMaterial = new StandardMaterial('floorMaterial', this.scene)
    floorMaterial.diffuseColor = new Color3(0.2, 0.2, 0.3)
    floor.material = floorMaterial

    // Create top and bottom walls
    const topWall = MeshBuilder.CreateBox('topWall', {
      width: arenaWidth,
      height: 1,
      depth: wallThickness
    }, this.scene)
    topWall.position.z = arenaHeight / 2

    const bottomWall = MeshBuilder.CreateBox('bottomWall', {
      width: arenaWidth,
      height: 1,
      depth: wallThickness
    }, this.scene)
    bottomWall.position.z = -arenaHeight / 2

    // Wall material
    const wallMaterial = new StandardMaterial('wallMaterial', this.scene)
    wallMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8)
    topWall.material = wallMaterial
    bottomWall.material = wallMaterial

    // Create center line
    const centerLine = MeshBuilder.CreateBox('centerLine', {
      width: 0.1,
      height: 0.2,
      depth: arenaHeight
    }, this.scene)
    centerLine.position.x = 0

    const centerLineMaterial = new StandardMaterial('centerLineMaterial', this.scene)
    centerLineMaterial.diffuseColor = new Color3(1, 1, 1)
    centerLine.material = centerLineMaterial
  }

  public startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })
  }

  public resize(): void {
    this.engine.resize()
  }

  public dispose(): void {
    this.scene.dispose()
    this.engine.dispose()
  }

  public getScene(): Scene {
    return this.scene
  }

  public getEngine(): Engine {
    return this.engine
  }
}