import * as THREE from 'three'
import * as React from 'react'
import { LevelJson, MapSize, ZoneCoords } from '../../typings/types'
import { LAYERS } from '../client'
import { BoxGeometry } from 'three'

interface IProps {
    levelJson: LevelJson
}

const zoneMaterial = new THREE.MeshBasicMaterial({
    color: 0xd007de,
    opacity: 0.7,
    transparent: true,
})

const Zone = (props: { zone: ZoneCoords; mapSize: MapSize; heightMapList: number[] }) => {
    const { zone, mapSize, heightMapList } = props

    const matrix = new THREE.Matrix4()
    const geomRef = React.useRef<BoxGeometry>(null!)

    // prettier-ignore
    matrix.set(
      zone.angleA, 0, -zone.angleB, 0,
      0, 1, 0, 0,
      zone.angleB, 0, zone.angleA, 0,
      0, 0, 0, 1
    )

    const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix)

    React.useLayoutEffect(() => {
        geomRef.current.applyQuaternion(quaternion)
    }, [zone])

    const approxHeight = approxTerrainHeightAtPoint(zone.x, zone.z, mapSize, heightMapList)

    return (
        <mesh
            material={zoneMaterial}
            position={[zone.x, approxHeight, zone.z]}
            name={zone.name}
            userData={{ displayName: zone.name, type: 'zones' }}
            layers={LAYERS.Zones}
        >
            <boxGeometry
                key={zone.name}
                args={[zone.sizeX, 20, zone.sizeZ]}
                ref={geomRef}
                name={'terraingeom'}
            />
        </mesh>
    )
}

const Zones = (props: IProps) => {
    const { zones, mapSize, heightMapList } = props.levelJson
    const zoneComponents = zones.map((zone, index) => (
        <Zone key={index} zone={zone} heightMapList={heightMapList} mapSize={mapSize} />
    ))
    return <>{zoneComponents}</>
}

export default Zones

function approxTerrainHeightAtPoint(
    objectX: number,
    objectZ: number,
    mapSize: MapSize,
    heightMapList: number[]
) {
    // Coords are around the centre of the map by default, centre them about 0 instead
    const absoluteObjectX = objectX + mapSize.mapX / 2
    const absoluteObjectZ = objectZ + mapSize.mapZ / 2

    // If the heightMap is a 2d array, find the approximate column and row out object coordinates would be in
    const approxColumn = Math.floor((mapSize.pointsX * absoluteObjectX) / mapSize.mapX)
    const approxRow = Math.floor((mapSize.pointsZ * absoluteObjectZ) / mapSize.mapZ)

    // Get the value at this location in the 2d array
    const approxIndexInArray = approxColumn + approxRow * mapSize.pointsX
    const approxHeight = (heightMapList[approxIndexInArray] * mapSize.mapHeight) / 256
    return approxHeight
}
