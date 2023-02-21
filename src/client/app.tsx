import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as React from 'react'
import Lighting from './lighting'
import MyControls from './controls'
import Level from './level'
import { Vector3 } from 'three'
import { PerspectiveCamera } from '@react-three/drei'
import LevelMenu from './levelMenu'
function Box(props: any) {
    // This reference gives us direct access to the THREE.Mesh object
    const ref = useRef<THREE.Object3D>()
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
    // Subscribe this component to the render-loop, //rotate the mesh every frame
    //qqtas this is equiv to animate in the render loop - needed for many things
    //useFrame((state, delta) => ({}))
    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <mesh
            {...props}
            ref={ref}
            scale={clicked ? 1.5 : 1}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    )
}

const defaultCameraOffset = new Vector3(0, 800, 900)

export default function App() {
    const [selectedLevelId, setSelectedLevelId] = useState('level_us_01_01')
    const [showMenu, setShowMenu] = useState(true)

    const pickLevel = (levelId: string) => {
        setSelectedLevelId(levelId)
        setShowMenu(false)
    }
    return (
        <>
            {showMenu && <LevelMenu pickLevel={pickLevel} />}
            <Canvas>
                <color attach="background" args={['#444444']} />
                <PerspectiveCamera
                    makeDefault
                    fov={75}
                    aspect={window.innerWidth / window.innerHeight}
                    near={0.1}
                    far={3000}
                    getObjectsByProperty={undefined}
                />
                <group scale-z={-1}>
                    <Lighting isWinter={true} />
                    <Box position={[-1.2, 0, 0]} />
                    <Box position={[1.2, 0, 0]} />
                    <Level levelFileName={selectedLevelId} />
                </group>
                <MyControls />
            </Canvas>
        </>
    )
}
