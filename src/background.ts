//@ts-check
import { Client, type ChatUserstate } from 'tmi.js';
const urls = ["https://www.youtube.com/watch?v=sV2F8OuXbYU"];
let tt_client: Client;
let oauth = import.meta.env.VITE_OAUTH;
let channel = 'bum1six3';

export interface IncomingMessage extends ChatUserstate {
    origin: "YT" | "TT",
    message: string,
    channel: string
}

// function parseMessage(message: string, from: ParsedMessage['origin']) {
//     try {
//         const parts = message.split(/;/g);
//         let obj: ParsedMessage = {
//             message: '',
//             badges: [],
//             'display-name': '',
//             'channel-nonce': '',
//             color: '',
//             id: '',
//             subscriber: '',
//             'user-id': '',
//             'badge-info': '',
//             origin: from || 'YT'
//         };

//         for (let index = 0; index < parts.length; index++) {
//             const [k, v] = parts[index].split('=');
//             let value: string | string[] = v;
//             let key = k;
//             if (k === 'badges') {
//                 value = v.split(',');
//             }
//             if (k === '@badge-info') {
//                 key = 'badge-info';
//             }
//             obj = { ...obj, [key]: value };
//             if (k === 'user-type') {
//                 if (value.includes('PRIVMSG') && typeof value === 'string') {
//                     let [_, ...message] = value
//                         .split('PRIVMSG')[1]
//                         .split(' ')
//                         .filter((v) => v);
//                     let finalMessage = message.join(' ').substring(1);
//                     obj = { ...obj, message: finalMessage };
//                 }
//             }
//         }
//         return obj;
//     } catch (err) {
//         return message;
//     }
// }
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
            ...tags,
            origin: 'TT',
            message,
        } as IncomingMessage)
    })
}

function connect(tab: chrome.tabs.Tab) {
    try {

        if (tt_client) return;
        if (!tab || !tab.id) return
        console.log('tab ', tab.id)
        createTwitchSocket(tab)
        //listenOnYTChat(tab)

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
