import type { Messenger } from "./util/chromeTab"

chrome.runtime.onMessage.addListener(function (message: Messenger, _, sendResponse) {
    console.log('message', message)
    if (message.messageType === 'REQUEST_YT_USER') {
        sendResponse(requestYTInfo())
    }
    if (message.messageType === 'CHECK_IF_STREAMING') {
        console.log('requestIfStreaming', message.messageType)
        sendResponse(requestIfStreaming())
    }
})
function requestIfStreaming(): boolean {
    const yt_name = document.querySelector('#chatframe')
    console.log(yt_name)
    if (!yt_name) {
        return false
    }
    return true
}
function requestYTInfo(): string {
    const yt_name = document.querySelector('#channel-name #text > a')?.getAttribute('href')
    if (!yt_name) {
        return 'NONE'
    }

    return yt_name.startsWith('/') ? yt_name.substring(1) : yt_name
}