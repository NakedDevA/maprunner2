import * as THREE from 'three'

export const unknownLandmarkMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: true,
})
export const greenTreeMaterial = new THREE.MeshPhongMaterial({
    color: 0x188c37,
    flatShading: true,
})
export const autumnTreeMaterial = new THREE.MeshPhongMaterial({
    color: 0x8c6f18,
    flatShading: true,
})
export const modelMaterial = new THREE.MeshPhongMaterial({ color: 0x3a3c42, flatShading: true })
export const zoneMaterial = new THREE.MeshPhongMaterial({
    color: 0xd007de,
    opacity: 0.5,
    transparent: true,
})
export const truckMaterial = new THREE.MeshPhongMaterial({ color: 0xff0303, flatShading: true })
const loader = new THREE.TextureLoader()
export const terrainMaterial = new THREE.MeshPhongMaterial({
    map: loader.load('./level_us_01_01.pak.png'),
})
