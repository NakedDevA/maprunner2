import { PerspectiveCamera } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as React from 'react'
import { useRef } from 'react'
import * as THREE from 'three'
import { LAYERS } from '../client'

export const MyCamera = (props: any) => {
    const ref = useRef<THREE.PerspectiveCamera>(null!)
    const set = useThree((state) => state.set)
    React.useEffect(() => {
        void set({ camera: ref.current })
    }, [])

    
    const allLayers = new THREE.Layers()
    allLayers.enableAll()
    
    return (
        <PerspectiveCamera
            ref={ref}
            {...props}
            layers={allLayers}
        />
    )
}
