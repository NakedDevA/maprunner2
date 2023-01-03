import { MapZonesJson } from '../typings/initialCacheTypes'
import { fetchJson } from './client'
import { CommonDOMRenderer } from 'render-jsx/dom'
import './menu.scss'

const renderer = new CommonDOMRenderer()

export const setZoneMenu = async (path: string, goToZone:(zoneName:string)=>void) => {
    const zoneJson = await fetchJson<MapZonesJson>(path)
    const zoneIDList = Object.keys(zoneJson.zoneDesc)
    const zoneListElement = document.getElementById('zoneList')
    if (!zoneListElement) return
    
    const jsx = (
        <ul>
            {zoneIDList.map((zoneId) => {
                return <li><button onclick={() =>goToZone(zoneId)}>{zoneId}</button></li>
            })}
        </ul>
    )
    return renderer.render(jsx).on(zoneListElement)
}
