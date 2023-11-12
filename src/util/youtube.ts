import { getCurrentTab, sendMessage } from "./chromeTab"

export async function requestCurrentYoutubeUser() {
    const tab = await getCurrentTab()
    // Use better guard
    if (!tab.url?.includes("youtube.com")) throw new Error("Not on Youtube tab");
    const pageInfo = await sendMessage<string>(tab.id || 0, { messageType: 'REQUEST_YT_USER' })
    if (pageInfo === 'NONE') throw new Error('Could not get Page Info')
    return pageInfo
}