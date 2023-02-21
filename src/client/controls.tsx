import * as React from 'react'
import { MapControls as DREIMapControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Box3, Vector3 } from 'three'
import { useRef } from 'react'
import { MapControls } from 'three-stdlib/controls/OrbitControls'

function MyControls(props: { objName?: string; offset?: THREE.Vector3 }) {
    const { scene, camera, controls } = useThree()
    const ref = useRef<MapControls>(null!)
    const set = useThree((state) => state.set)

    const moveCameraToObject = (objName: string, offset: THREE.Vector3) => {
        const object = scene.getObjectByName(objName)
        if (!object) return

        //centre controls around our obj
        const __box = new Box3().setFromObject(object)
        const center = __box.getCenter(new Vector3())

        if (controls instanceof MapControls) {
            console.log(`centering at ${center.x} ${center.y} ${center.z}`)
            controls.target = center
            console.log(
                `center now: at ${controls.target.x} ${controls.target.y} ${controls.target.z}`
            )
        }

        // focus camera to obj
        console.log(
            `camera looking at at ${object.position.x}, ${object.position.y}, ${object.position.z}`
        )
        //qqcamera.lookAt(object.position)
        debugger
        camera.lookAt(new Vector3(800,100,100))

        console.log(
            `camera looking at at ${object.position.x}, ${object.position.y}, ${object.position.z}`
        )
        // position camera offset from object. NB the SCENE is z-flipped but camera is not
        camera.position.set(
            object.position.x + offset.x,
            object.position.y + offset.y,
            -object.position.z + offset.z // There's the z-flip
        )
    }

    React.useEffect(() => {
        void set({ controls: ref.current })
    }, [])

    React.useEffect(() => {
        console.log('controlsLoad')
        console.log(controls)
        if (props.objName && props.offset) {
            moveCameraToObject(props.objName, props.offset)
        }
    }, [props])

    return (
        <DREIMapControls
            ref={ref}
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
