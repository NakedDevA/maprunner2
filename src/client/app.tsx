import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as React from 'react'
import Lighting from './lighting'
import Level from './level'
import { Vector3 } from 'three'
import LevelMenu from './levelMenu'
import * as THREE from 'three'
import { MyCamera } from './myCamera'
import { FocusHandler } from './focusHandler'

const defaultCameraOffset = new Vector3(0, 800, 900)

export default function App() {
    const [selectedLevelId, setSelectedLevelId] = useState('level_us_01_01')
    const [showMenu, setShowMenu] = useState(true)
    const [focus, setFocus] = useState({ objName: 'terrainMesh', offset: defaultCameraOffset })
    const cameraRef = useRef<THREE.PerspectiveCamera>(null!)

    const pickLevel = (levelId: string) => {
        setSelectedLevelId(levelId)
        //setShowMenu(false)
        setFocus({ objName: 'terrainMesh', offset: defaultCameraOffset }) //qqtas this needs to happen only once loading is complete, otherwise we fail to find the object to focus on
    }

    return (
        <>
            {showMenu && <LevelMenu pickLevel={pickLevel} />}
            <Canvas shadows gl={{ logarithmicDepthBuffer: true }}>
                <color attach="background" args={['#444444']} />
                <MyCamera
                    makeDefault
                    fov={75}
                    aspect={window.innerWidth / window.innerHeight}
                    near={0.1}
                    far={3000}
                    getObjectsByProperty={undefined}
                />
                <Lighting isWinter={false} />
                <group scale-z={-1}>
                    <Level levelFileName={selectedLevelId} />
                </group>
                <FocusHandler objName={focus.objName} offset={focus.offset} />
            </Canvas>
        </>
    )
}
