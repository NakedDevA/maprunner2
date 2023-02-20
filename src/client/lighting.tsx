import * as React from 'react'

export default function Lighting(props: { isWinter: boolean }) {
    return (
        <>
            <directionalLight
                color={'0xffffff'}
                position={[-2000, 1250, 0]}
                intensity={props.isWinter ? 1 : 1.2}
                castShadow
                shadow-mapSize-width={4096}
                shadow-mapSize-height={4096}
                shadow-radius={3}
                shadow-camera-top={1000}
                shadow-camera-right={1000}
                shadow-camera-bottom={-1000}
                shadow-camera-left={-1000}
                shadow-camera-near={1}
                shadow-camera-far={20000}
                //shadow-camera-fov={45}
                shadow-bias={-0.0005}
            ></directionalLight>
            isWinter && <ambientLight color={0xaaedff} intensity={0.3}></ambientLight>
            !isWinter && <ambientLight color={0xffadad} intensity={0.5}></ambientLight>
            <pointLight position={[-10, -10, -10]} />
        </>
    )
}
