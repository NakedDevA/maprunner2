import * as THREE from 'three'

export const modelMaterial = new THREE.MeshPhongMaterial({ color: 0x3a3c42, flatShading: true })
export const zoneMaterial = new THREE.MeshPhongMaterial({
    //pink
    color: 0xd007de,
    opacity: 0.7,
    transparent: true,
})
export const truckMaterial = new THREE.MeshPhongMaterial({ color: 0xff0303, flatShading: true })

export const terrainFromFileMaterial = (path: string) => {
    const loader = new THREE.TextureLoader()
    const texture = loader.load(path)
    texture.flipY = false
    return new THREE.MeshPhongMaterial({
        name: path,
        map: texture
    })
}
