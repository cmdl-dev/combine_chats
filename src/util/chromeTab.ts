export async function getCurrentTab(options?: chrome.tabs.QueryInfo) {
    const [tab] = await chrome.tabs.query(options || {
        active: true,
        currentWindow: true,
    });
    return tab
}

export type Messenger = {
    messageType: 'REQUEST_YT_USER' | 'INCOMING_MESSAGE',
    message?: any // TODO: better ts types
}
export async function sendMessage<T>(tabId: number, message: Messenger) {
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