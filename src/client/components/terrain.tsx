import * as React from 'react'
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry'
import { LevelJson } from '../../typings/types'
import { LAYERS } from '../client'

type TerrainProps = {
    levelTexture: THREE.Texture
    tintTexture: THREE.Texture
    mudTexture: THREE.Texture
    snowTexture?: THREE.Texture
    levelJson: LevelJson
}

export default function Terrain({
    levelTexture,
    tintTexture,
    mudTexture,
    snowTexture,
    levelJson,
}: TerrainProps) {
    const geomRef = React.useRef<PlaneGeometry>(null!)
    const mapSize = levelJson.mapSize

    /* Work with the heightmap in a useeffect so we can clean up afterwards.
     * Potential pitfall with the rotation being set in useeffect, but provided the planeGeometry
     *  has a unique key this should be run exactly once per level
     * */
    React.useEffect(() => {
        geomRef.current.rotateX(-Math.PI / 2) // flat plane

        const vertices = geomRef.current.attributes.position
        for (let i = 0; i < vertices.count; i++) {
            const MAGIC_SCALING_FACTOR = mapSize.mapHeight / 256
            vertices.setY(i, levelJson.heightMapList[i] * MAGIC_SCALING_FACTOR)
        }
        return () => {
            geomRef.current?.dispose()
        }
    }, [levelJson])

    return (
        <mesh receiveShadow castShadow name="terrainMesh" layers={LAYERS.Terrain}>
            <planeGeometry
                key={levelJson.zones[0].name}
                args={[mapSize.mapX, mapSize.mapZ, mapSize.pointsX - 1, mapSize.pointsZ - 1]}
                ref={geomRef}
                name={'terraingeom'}
            />
            <meshPhongMaterial
                name={'terrainMaterial'}
                map={levelTexture}
                specularMap={tintTexture}
                shininess={50}
                displacementMap={snowTexture}
                displacementScale={5}
                emissiveMap={mudTexture}
                emissive={0xb30000}
                emissiveIntensity={0}
            ></meshPhongMaterial>
        </mesh>
    )
}
