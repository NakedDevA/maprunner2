export type LandmarkCoords = {
    name: string

    entries: {
        x: number
        y: number
        z: number
        s: number
        q: number[]
    }[]
}

export type Coords = {
    x: number
    y: number
    z: number
}

export type ModelCoords = {
    t: string //type
    lmk: string //landmark
    c: { //corners
        a: Coords
        b: Coords
    }
    i: ModelInstance[] //instances
}

export type ModelInstance = Coords & { r: RotationMatrix }

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

type RotationMatrix = {
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

export type TruckCoords = {
    name: string
    x: number
    y: number
    z: number
    rotation: RotationMatrix
    task: string
    fuel: number
    damage: number
    visualDamage: number
    isLocked: boolean
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
