import * as THREE from 'three'

export const unknownLandmarkMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: true,
})
export const greenTreeMaterial = new THREE.MeshPhongMaterial({
    color: 0x202e09,
    flatShading: true,
    shininess: 0.1,
})
export const autumnTreeMaterial = new THREE.MeshPhongMaterial({
    color: '#7e3a28',
    flatShading: true,
    shininess: 0.1,
})
export const larchTreeMaterial = new THREE.MeshPhongMaterial({
    color: '#d1910d',
    flatShading: true,
    shininess: 0.1,
})
export const brownsMaterial = new THREE.MeshPhongMaterial({
    color: '#5c4033',
    flatShading: true,
    shininess: 0.1,
})
export const greysMaterial = new THREE.MeshPhongMaterial({
    color: 0x90a4ae,
    flatShading: true,
    shininess: 0.1,
})
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
