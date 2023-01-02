import { MapZonesJson } from '../typings/initialCacheTypes'
import { fetchJson } from './client'
import { CommonDOMRenderer } from 'render-jsx/dom'

const renderer = new CommonDOMRenderer()

export const setZoneMenu = async (path: string) => {
    const zoneJson = await fetchJson<MapZonesJson>(path)
    const zoneIDList = Object.keys(zoneJson.zoneDesc)
    const zoneListElement = document.getElementById('zoneList')
    if (!zoneListElement) return
    
    const jsx = (
        <div>
            {zoneIDList.map((zoneId) => {
                return <div>{zoneId}</div>
            })}
        </div>
    )
    return renderer.render(jsx).on(zoneListElement)
}
