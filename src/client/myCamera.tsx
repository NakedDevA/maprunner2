import { PerspectiveCamera } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as React from 'react'
import { useRef } from 'react'

export const MyCamera = (props: any) => {
    const ref = useRef<THREE.PerspectiveCamera>(null!)
    const set = useThree((state) => state.set)
    React.useEffect(() => {
        void set({ camera: ref.current })
    }, [])
    return <PerspectiveCamera ref={ref} {...props} />
}
