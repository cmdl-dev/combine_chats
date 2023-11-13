export async function getCurrentTab(options?: chrome.tabs.QueryInfo) {
    const [tab] = await chrome.tabs.query(options || {
        active: true,
        currentWindow: true,
    });
    return tab
}


export type Messenger = {
    messageType: 'REQUEST_YT_USER' | 'INCOMING_MESSAGE' | 'CHECK_IF_STREAMING',
    message?: any // TODO: better ts types
}

export async function getYoutubeInfo(tab?: chrome.tabs.Tab) {
    return sendMessage<string>(tab?.id || 0, { messageType: 'REQUEST_YT_USER' })
}
export async function checkIfStreaming(tab?: chrome.tabs.Tab) {
    return sendMessage<boolean>(tab?.id || 0, { messageType: 'CHECK_IF_STREAMING' })
}

async function sendMessage<T>(tabId: number, message: Messenger) {
    const response = (await new Promise((res, rej) => {
        try {
            chrome.tabs.sendMessage(
                tabId,
                message,
                (response: T) => res(response)
            );
        } catch (error) {
            rej(error);
        }
    })) as T;
    return response
}