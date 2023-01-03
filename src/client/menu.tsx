import { MapZonesJson, ZoneSettings } from '../typings/initialCacheTypes'
import { fetchJson } from './client'
import { CommonDOMRenderer } from 'render-jsx/dom'
import './menu.scss'

const renderer = new CommonDOMRenderer()

export const renderMenu = async (path: string, goToZone: (zoneName: string) => void) => {
    const menuElement = document.getElementById('menu')
    if (!menuElement) return
    menuElement.firstChild?.remove()
    
    const zoneJson = await fetchJson<MapZonesJson>(path)
    const zoneIDList = Object.keys(zoneJson.zoneDesc).sort()

    const jsx = (
        <div class="container">
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
            <div class={['tab', 'hidden']} id={'tab-trucks'}>
                truck truck truck
            </div>
        </div>
    )
    return renderer.render(jsx).on(menuElement)
}

const zoneDescription = (zoneProps: ZoneSettings): string => {
    if (!zoneProps) return 'No properties'
    const keys = Object.keys(zoneProps)
    const string = keys.filter((key) => key.startsWith('Zone')).toString()
    const multiline = string.replace(',', ',\n')
    return multiline
}

const toggleInfoBox = (zoneId: string) => {
    const clickedZoneInfo = document.querySelector(`#zoneEntry-${zoneId}`)
    if (!clickedZoneInfo) return
    
    //close this one if it's already open
    if (clickedZoneInfo.classList.contains('zone-info-open')) {
        return clickedZoneInfo.classList.remove('zone-info-open')
    }

    //else close all and open the chosen one
    const openZoneInfos = document.querySelectorAll('.zone-info-open')
    openZoneInfos.forEach((element) => {
        element.classList.remove('zone-info-open')
    })
    clickedZoneInfo.classList.add('zone-info-open')
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
        tab.classList.add('hidden')
    })
    const selectedTab = document.querySelector(`#tab-${tabName}`)
    selectedTab?.classList.remove('hidden')
}
