//@ts-check
import { Client, type ChatUserstate } from 'tmi.js';
import { isCurrentlyStreaming, requestCurrentYoutubeUser } from './util/youtube';
import { isYoutubeVideo, retry, sleep } from './util/helper';
import { getPairingForUser } from './util/storage';
import type { Messenger } from './util/chromeTab';
let tt_client: Client;
let oauth = import.meta.env.VITE_OAUTH;

export interface IncomingMessage extends ChatUserstate {
    origin: "YT" | "TT",
    message: string,
    channel: string
}

function createTwitchSocket(tab: chrome.tabs.Tab, tt_user: string) {
    tt_client = new Client({
        options: {},
        identity: {
            username: "c_mdl",
            password: `oauth:${oauth}`
        },
        channels: [tt_user]
    })

    tt_client.connect().catch(console.error)
    tt_client.on('message', (channel, tags, message, self) => {
        //console.log(channel, tags['display-name'], message, self)
        const msg: Messenger = {
            messageType: 'INCOMING_MESSAGE',
            message: {
                ...tags,
                origin: 'TT',
                message,
            } as IncomingMessage
        }
        chrome.tabs.sendMessage(tab.id || 0, msg)
    })
}

function connect(tab: chrome.tabs.Tab, tt_user: string) {
    try {
        if (tt_client) return;
        if (!tab || !tab.id) return
        console.log('tab ', tab.id)
        createTwitchSocket(tab, tt_user)
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
//FIXME: I feel like this is not the way to do it to add stuff??
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
