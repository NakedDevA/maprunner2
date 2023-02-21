import { useThree } from '@react-three/fiber'
import * as React from 'react'
import { useState } from 'react'
import { Box3, Vector3 } from 'three'
import MyControls from './controls'

export const FocusHandler = (props: { children?: any; objName: string; offset: THREE.Vector3 }) => {
    const { scene, camera, controls } = useThree()
    const { objName, offset } = props
    const [focus, setFocus] = useState(new Vector3(0, 0, 0))

    React.useEffect(() => {
        const object = scene.getObjectByName(objName)
        if (!object) return

        //centre controls around our obj
        const __box = new Box3().setFromObject(object)
        const center = __box.getCenter(new Vector3())
        
        //Set prop so the child camera is updated with new base position
        // NB camera has its own internal non-reactive state, so it can change this again during panning without re-render
        setFocus(center)

        // position camera offset from object. NB the SCENE is z-flipped but camera is not
        camera.position.set(
            object.position.x + offset.x,
            object.position.y + offset.y,
            -object.position.z + offset.z // There's the z-flip
        )

    }, [props])

    return (
        <>
            <MyControls target={focus} />
        </>
    )
}
