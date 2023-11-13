import { checkIfStreaming, getCurrentTab, getYoutubeInfo } from "./chromeTab"
import { isYoutubeVideo } from "./helper";

export async function requestCurrentYoutubeUser(tab?: chrome.tabs.Tab) {
    if (!tab) {
        tab = await getCurrentTab()
    }
    if (!isYoutubeVideo(tab?.url || '')) throw new Error("Not on Youtube tab");
    const pageInfo = await getYoutubeInfo(tab)
    if (!pageInfo || pageInfo === 'NONE') throw new Error('Could not get Page Info')

    return pageInfo
}

export async function isCurrentlyStreaming(tab?: chrome.tabs.Tab) {
    if (!tab) {
        tab = await getCurrentTab()
    }
    if (!isYoutubeVideo(tab?.url || '')) throw new Error("Not on Youtube tab");
    const pageInfo = await checkIfStreaming(tab)

    if (pageInfo === undefined) throw new Error('Could not get Page Info')
    return pageInfo
}