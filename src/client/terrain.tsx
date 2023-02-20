import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

type TerrainProps = {
    levelTexture: THREE.Texture
    tintTexture: THREE.Texture
    mudTexture: THREE.Texture
    snowTexture?: THREE.Texture
}

export default function Terrain({
    levelTexture,
    tintTexture,
    mudTexture,
    snowTexture,
}: TerrainProps) {
    const mapSize = { mapHeight: 186, mapX: 2016, mapZ: 2016, pointsX: 589, pointsZ: 589 } //qqtas blackriver debug

    const geometry = new THREE.PlaneGeometry(
        mapSize.mapX,
        mapSize.mapZ,
        mapSize.pointsX - 1,
        mapSize.pointsZ - 1
    )
    geometry.name = 'terraingeom'

    geometry.rotateX(-Math.PI / 2) // flat plane

    /*const vertices = geometry.attributes.position
for (let i = 0; i < vertices.count; i++) {
    const MAGIC_SCALING_FACTOR = mapSize.mapHeight / 256
    vertices.setY(i, heightMapList[i] * MAGIC_SCALING_FACTOR)
}*/

    return (
        <mesh receiveShadow castShadow name="terrainMesh" geometry={geometry}>
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
