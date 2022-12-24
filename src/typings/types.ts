type LandmarkCoords = {
    name: string
    entries: {
        x: number
        y: number
        z: number
    }[]
}
type ModelCoords = {
    type: string
    landmark: string
    models: {
        x: number
        y: number
        z: number
    }[]
}
type ZoneCoords = {
    name: string
    x: number
    y: number
    z: number
    angleA: number
    angleB: number
    sizeX: number
    sizeZ: number
}
type TruckCoords = {
    name: string
    x: number
    y: number
    z: number
    task: string
}
export type LevelJson = {
    landmarks: LandmarkCoords[]
    models: ModelCoords[]
    zones: ZoneCoords[]
    trucks: TruckCoords[]
    heightMap: number[][]
}
