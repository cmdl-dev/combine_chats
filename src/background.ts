//@ts-check
import { Client, type ChatUserstate } from 'tmi.js';
import { isCurrentlyStreaming, requestCurrentYoutubeUser } from './util/youtube';
import { isYoutubeVideo, retry, sleep, stringToChatMessage } from './util/helper';
import { getPairingForUser } from './util/storage';
import type { Messenger } from './util/chromeTab';
const userClientMap: Map<string, ChatClient> = new Map();
// TODO: have the user be able to login to twitch
const oauth = import.meta.env.VITE_OAUTH;
const userName = import.meta.env.VITE_USERNAME

type ChatClient = {
    client: Client,
    tabId: number
}
type ChatTextType = {
    type: 'string',
    value: string,
}

type ChatLinkType = {
    type: 'link',
    value: string,
}
type ChatEmoteType = {
    type: 'emote',
    emoteTag: string,
    value: string,
}
export type ChatMessage = ChatTextType | ChatLinkType | ChatEmoteType;
export interface IncomingMessage extends ChatUserstate {
    origin: "YT" | "TT",
    message: ChatMessage[],
    channel: string
}

function createTwitchSocket(tabId: number, tt_user: string) {
    //MAYBE: have it so that the user only has 1 client open at a time, but connected to different channels
    const ttClient = new Client({
        options: {},
        identity: {
            username: userName,
            password: `oauth:${oauth}`
        },
        channels: [tt_user]
    })

    ttClient.connect().catch(console.error)
    ttClient.on('message', (channel, tags, message, self) => {
        const msg: Messenger = {
            messageType: 'INCOMING_MESSAGE',
            message: {
                ...tags,
                origin: 'TT',
                message: stringToChatMessage(message),
            } as IncomingMessage
        }
        chrome.tabs.sendMessage(tabId, msg)
    })
    const chatClient: ChatClient = {
        client: ttClient,
        tabId
    }
    userClientMap.set(tt_user, chatClient)
}

function connect(tab: chrome.tabs.Tab, tt_user: string) {
    try {
        if (!tab || !tab.id) return
        console.log(userClientMap)
        if (userClientMap.has(tt_user)) return;
        createTwitchSocket(tab.id, tt_user)
    } catch (err) {
        console.log('backrgound task', err)
    }
}

async function insertIntoPage(tabId: number) {
    await chrome.scripting.insertCSS({
        target: { tabId, allFrames: true },
        files: ["combine_chats.css"]
    })
    await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        args: [],
        func: function () {
            try {
                const chatContainer = document.querySelector("#item-offset")
                if (!chatContainer || document.querySelector("#item-offset #cc_container")) return

                const container = document.createElement('div')
                container.setAttribute('id', 'cc_container')
                chatContainer.append(container)

            } catch (err) {
                //TODO:
            }
        }
    })
}
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (changeInfo.status !== 'complete') return // only when the tab is created or reloaded
    if (!tab?.url) return
    if (!isYoutubeVideo(tab.url)) return
    // TODO: wait for content to be loaded on the page instead of just waiting 3 seconds
    await sleep(3000);
    const isStreaming = await retry(() => isCurrentlyStreaming(tab).then(res => {
        if (res) return res
        throw new Error('Not streaming')
    }))
    if (!isStreaming) return

    const yt_name = await retry(requestCurrentYoutubeUser)

    await insertIntoPage(tabId)
    const pairing = await getPairingForUser(yt_name);
    if (!pairing) return// TODO: show error message

    console.log('pairing for user', pairing)
    connect(tab, pairing)
})
