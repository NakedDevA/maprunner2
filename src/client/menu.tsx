import { MapZonesJson, ZoneSettings } from '../typings/initialCacheTypes'
import { CommonDOMRenderer } from 'render-jsx/dom'
import './menu.scss'
import { TruckCoords } from '../typings/types'

const renderer = new CommonDOMRenderer()

export const renderMenu = async (
    zonesJson: MapZonesJson,
    trucks: TruckCoords[],
    goToObject: (objectName: string) => void
) => {
    const menuElement = document.getElementById('menu')
    if (!menuElement) return
    menuElement.firstChild?.remove()

    const zoneIDList = Object.keys(zonesJson.zoneDesc).sort()

    // truck names aren't unique and they don't have ids, so we use the fixed index in the file
    const trucksWithIds = trucks
        .map((truck, index) => {
            return { ...truck, id: `${truck.name}_${index}` }
        })
        .sort((a, b) => (a.name > b.name ? 1 : -1))

    const truckIDList = trucksWithIds.map((truck) => truck.id)
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
                        filterEntries(e.target.value, zoneIDList, 'zoneEntry')
                    }
                ></input>
                <ul>
                    {zoneIDList.map((zoneId) => {
                        const thisInfo = zoneDescription(zonesJson.zoneDesc[zoneId].props)
                        return (
                            <li class={'zoneEntry'} id={`zoneEntry-${zoneId}`}>
                                <button
                                    onclick={() => {
                                        toggleInfoBox(`zoneEntry-${zoneId}`)
                                        goToObject(zoneId)
                                    }}
                                >
                                    {zoneId}
                                </button>
                                <p class={'infoBox'}>{thisInfo}</p>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div class={['tab', 'hidden']} id={'tab-trucks'}>
                <input
                    type={Text}
                    placeholder={'filter'}
                    oninput={(e: { target: HTMLInputElement }) =>
                        filterEntries(e.target.value, truckIDList, 'truckEntry')
                    }
                ></input>
                <ul>
                    {trucksWithIds.map((truck, index) => {
                        return (
                            <li class={'truckEntry'} id={`truckEntry-${truck.id}`}>
                                <button
                                    onclick={() => {
                                        toggleInfoBox(`truckEntry-${truck.id}`)
                                        goToObject(truck.id)
                                    }}
                                >
                                    {truck.name}
                                </button>
                                <p class={'infoBox'}>
                                    Task name: {truck.task ? truck.task : 'none'}
                                </p>
                            </li>
                        )
                    })}
                </ul>
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

const toggleInfoBox = (clickedId: string) => {
    const clickedZoneInfo = document.querySelector(`#${clickedId}`)
    if (!clickedZoneInfo) return

    //close this one if it's already open
    if (clickedZoneInfo.classList.contains('info-open')) {
        return clickedZoneInfo.classList.remove('info-open')
    }

    //else close all and open the chosen one
    const openZoneInfos = document.querySelectorAll('.info-open')
    openZoneInfos.forEach((element) => {
        element.classList.remove('info-open')
    })
    clickedZoneInfo.classList.add('info-open')
}

const filterEntries = (input: string, IDList: string[], candidateIDPrefix: string) => {
    for (const truckId of IDList) {
        const entry = document.querySelector(`#${candidateIDPrefix}-${truckId}`)
        if (truckId.toLowerCase().includes(input.toLowerCase())) {
            entry?.removeAttribute('hidden')
        } else {
            entry?.setAttribute('hidden', 'true')
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
