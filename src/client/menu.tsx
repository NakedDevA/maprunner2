import { MapZonesJson, ZoneSettings } from '../typings/initialCacheTypes'
import { fetchJson } from './client'
import { CommonDOMRenderer } from 'render-jsx/dom'
import './menu.scss'

const renderer = new CommonDOMRenderer()

export const setZoneMenu = async (path: string, goToZone: (zoneName: string) => void) => {
    const zoneJson = await fetchJson<MapZonesJson>(path)
    const zoneIDList = Object.keys(zoneJson.zoneDesc).sort()
    const zoneListElement = document.getElementById('zoneList')
    if (!zoneListElement) return

    const jsx = (
        <>
            <div id={'headings'}>
                <h2
                    id={'tabHeading-zones'}
                    class={'selected'}
                    onclick={() => onTabClicked('zones')}
                >
                    Zones
                </h2>
                <h2 id={'tabHeading-trucks'} onclick={() => onTabClicked('trucks')}>
                    Trucks
                </h2>
            </div>

            <div class={'tab'} id={'tab-zones'}>
                <input
                    type={Text}
                    placeholder={'filter'}
                    oninput={(e: { target: HTMLInputElement }) =>
                        filterZones(e.target.value, zoneIDList)
                    }
                ></input>
                <ul>
                    {zoneIDList.map((zoneId) => {
                        const thisInfo = zoneDescription(zoneJson.zoneDesc[zoneId].props)
                        return (
                            <li class={'zoneEntry'} id={`zoneEntry-${zoneId}`}>
                                <button
                                    onclick={() => {
                                        toggleInfoBox(zoneId)
                                        goToZone(zoneId)
                                    }}
                                >
                                    {zoneId}
                                </button>
                                <p class={'zoneInfoBox'}>{thisInfo}</p>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div class={'tab'} id={'tab-trucks'}>
                truck truck truck
            </div>
        </>
    )
    return renderer.render(jsx).on(zoneListElement)
}

const zoneDescription = (zoneProps: ZoneSettings): string => {
    if (!zoneProps) return 'No properties'
    const keys = Object.keys(zoneProps)
    const string = keys.filter((key) => key.startsWith('Zone')).toString()
    const multiline = string.replace(',', ',\n')
    return multiline
}

const toggleInfoBox = (zoneId: string) => {
    const zoneInfoBox = document.querySelector(`#zoneEntry-${zoneId}`)
    if (!zoneInfoBox) return

    const otherInfoBoxes = document.querySelectorAll('.zone-info-open')
    otherInfoBoxes.forEach((box) => {
        box.classList.remove('zone-info-open')
    })

    zoneInfoBox.classList.add('zone-info-open')
}

const filterZones = (input: string, zoneIDList: string[]) => {
    for (const zoneId of zoneIDList) {
        const zoneEntry = document.querySelector(`#zoneEntry-${zoneId}`)
        if (zoneId.toLowerCase().includes(input.toLowerCase())) {
            zoneEntry?.removeAttribute('hidden')
        } else {
            zoneEntry?.setAttribute('hidden', 'true')
        }
    }
}

const onTabClicked = (tabName: string) => {
    const allHeadings = document.querySelectorAll('#headings h2')
    allHeadings.forEach((heading) => {
        heading.classList.remove('selected')
    })
    const selectedHeading = document.querySelector(`#tabHeading-${tabName}`)
    selectedHeading?.classList.add('selected')
    
    
    const allTabs = document.querySelectorAll('.tab')
    allTabs.forEach((tab) => {
        tab.setAttribute('hidden', 'true')
    })
    const selectedTab = document.querySelector(`#tab-${tabName}`)
    selectedTab?.removeAttribute('hidden')
}
