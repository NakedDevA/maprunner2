import * as React from 'react'
import { MapControls } from '@react-three/drei'

function MyControls(props: any) {
    return (
        <MapControls
            enableDamping={false}
            minDistance={10}
            maxDistance={2000}
            maxPolarAngle={Math.PI / 2}
            zoomSpeed={2}
            {...props}
        />
    )
}

export default MyControls
