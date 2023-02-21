import * as React from 'react'
import * as THREE from 'three'
import { LAYERS } from './client'

export default function Lighting(props: { isWinter: boolean }) {
    const allLayers = new THREE.Layers()
    allLayers.enableAll()
    return (
        <>
            <directionalLight
                layers={allLayers}
                color={0xffffff}
                position={[-2000, 1250, 0]}
                intensity={props.isWinter ? 1 : 1.2}
                castShadow
                shadow-mapSize-width={4096}
                shadow-mapSize-height={4096}
                // shadow-radius={3}
                shadow-camera-top={1000}
                shadow-camera-right={1000}
                shadow-camera-bottom={-1000}
                shadow-camera-left={-1000}
                shadow-camera-near={1}
                shadow-camera-far={20000}
                shadow-camera-fov={45}
                //  shadow-bias={-0.0005}
            ></directionalLight>
            <ambientLight
                layers={allLayers}
                color={props.isWinter ? 0xaaedff : 0xffadad}
                intensity={props.isWinter ? 0.3 : 0.3}
            ></ambientLight>
        </>
    )
}
