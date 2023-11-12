//@ts-check
import { Client, type ChatUserstate } from 'tmi.js';
const urls = ["https://www.youtube.com/watch?v=wpd90LUZPUE"];
let tt_client: Client;
let oauth = import.meta.env.VITE_OAUTH;
let channel = 'riotgames';

export interface IncomingMessage extends ChatUserstate {
    origin: "YT" | "TT",
    message: string,
    channel: string
}

function createTwitchSocket(tab: chrome.tabs.Tab) {
    tt_client = new Client({
        options: {
            debug: true
        },
        identity: {
            username: "c_mdl",
            password: `oauth:${oauth}`
        },
        channels: [channel]
    })

    tt_client.connect().catch(console.error)
    tt_client.on('message', (channel, tags, message, self) => {
        //console.log(channel, tags['display-name'], message, self)
        chrome.tabs.sendMessage(tab.id || 0, {
            messageType: 'INCOMING_MESSAGE', mesage: {
                ...tags,
                origin: 'TT',
                message,
            } as IncomingMessage
        })
    })
}

function connect(tab: chrome.tabs.Tab) {
    try {

        if (tt_client) return;
        if (!tab || !tab.id) return
        console.log('tab ', tab.id)
        createTwitchSocket(tab)

    } catch (err) {
        console.log('backrgound task', err)

    }
}
//FIXME: I feel like this is not the way to do it to add stuff??
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (!tab || !tab.url || !tab.id) return
    console.log('Tab activeted', changeInfo, tab)
    try {
        // TODO: doesn't load on the first try 
        for (let index = 0; index < 4; index++) {
            if (!tab.id) return
            await chrome.scripting.insertCSS({
                target: { tabId: tab.id, allFrames: true },
                files: ["combine_chats.css"]
            }).then(() => {
                chrome.scripting.executeScript({
                    //@ts-expect-error
                    target: { tabId: tab.id, allFrames: true },
                    func: function () {
                        try {
                            const chatContainer = document.querySelector("#item-offset")
                            if (!chatContainer || document.querySelector("#item-offset #cc_container")) return

                            const container = document.createElement('div')
                            container.setAttribute('id', 'cc_container')
                            chatContainer.append(container)

                        } catch (err) {
                            console.log('yeeee', err)

                        }
                    }
                })
            }
            );
        }
    } catch (err) { }
    if (!urls.includes(tab.url)) return
    connect(tab)
})
