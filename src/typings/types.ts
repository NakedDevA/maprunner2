export type LandmarkCoords = {
    name: string
    entries: {
        x: number
        y: number
        z: number
    }[]
}

export type ModelCoords = {
    type: string
    landmark: string
    models: {
        x: number
        y: number
        z: number
    }[]
}

export type ZoneCoords = {
    name: string
    x: number
    y: number
    z: number
    angleA: number
    angleB: number
    sizeX: number
    sizeZ: number
}

export type TruckCoords = {
    name: string
    x: number
    y: number
    z: number
    rotation: {
        a1: number
        a2: number
        a3: number
        b1: number
        b2: number
        b3: number
        c1: number
        c2: number
        c3: number
    }
    task: string
}

export type MapSize = {
    mapHeight: number
    mapX: number
    mapZ: number
    pointsX: number
    pointsZ: number
}

export type LevelJson = {
    landmarks: LandmarkCoords[]
    models: ModelCoords[]
    zones: ZoneCoords[]
    trucks: TruckCoords[]
    mapSize: MapSize
    heightMapList: number[]
}
