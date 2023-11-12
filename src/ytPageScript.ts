import type { Messenger } from "./util/chromeTab"

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.onMessage.addListener(function (message: Messenger, sender, sendResponse) {
        if (message.messageType === 'REQUEST_YT_USER') {
            sendResponse(requestYTInfo())
        }
    })
})
function requestYTInfo(): string {
    const yt_name = document.querySelector('#channel-name #text > a')?.getAttribute('href')
    if (!yt_name) {
        return 'NONE'
    }

    return yt_name.startsWith('/') ? yt_name.substring(1) : yt_name
}