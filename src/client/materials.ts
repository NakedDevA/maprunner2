import * as THREE from 'three'

export const unknownLandmarkMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: true,
})
export const greenTreeMaterial = new THREE.MeshPhongMaterial({
    color: 0x202e09,
    flatShading: true,
    shininess:0.1
})
export const autumnTreeMaterial = new THREE.MeshPhongMaterial({
    color: 0x7e3a28,
    flatShading: true,
    shininess:0.1
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
    map: loader.load('./us1HD.jpg')
})
