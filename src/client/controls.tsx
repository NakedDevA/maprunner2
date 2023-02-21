import * as React from 'react'
import { MapControls as DREIMapControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { MapControls } from 'three-stdlib/controls/OrbitControls'

function MyControls(props:{target:THREE.Vector3}) {
    const ref = useRef<MapControls>(null!)
    const set = useThree((state) => state.set)

    React.useEffect(() => {
        void set({ controls: ref.current })
    }, [])

    return (
        <DREIMapControls
            ref={ref}
            enableDamping={false}
            minDistance={10}
            maxDistance={2000}
            maxPolarAngle={Math.PI / 2}
            zoomSpeed={2}
            target={props.target}
        />
    )
}

export default MyControls
