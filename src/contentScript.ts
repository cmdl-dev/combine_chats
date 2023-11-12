import type { IncomingMessage } from "./background";

const ignoreList = ['Restream Bot', 'restreambot'].map(name => name.toLowerCase())
/**
@param {string} message 
@return Array<string|ParsedEmotes>
*/
let cc_obsverver: MutationObserver;
function parseUserMessage(message: string | any) {
    return [message]
    // if (Object.keys(emotes).length === 0) return [message];
    // let messageParts = message.split(' ');
    // /**@type{Array<string | ParsedEmotes>}*/
    // let comps = [];
    // let str = '';
    // // debugger;
    // for (let index = 0; index < messageParts.length; index++) {
    //     const part = messageParts[index].trimEnd();
    //     if (emotes[part]) {
    //         // Reset str and add comps to array
    //         comps.push(str);
    //         str = '';
    //         const foundEmote = emotes[part];
    //         comps.push(foundEmote);
    //     } else {
    //         str += (index === 0 ? '' : ' ') + part;
    //     }
    // }
    // if (str) {
    //     comps.push(str)
    // }
    // console.log(message, comps)
    // return comps;
}

function listenOnYTChat() {
    const yt_chat = document.querySelector('#item-offset #items')
    // TODO:
    if (!yt_chat) {
        console.log("Could not find yt chat")
        return
    }
    if (cc_obsverver) {
        console.log("Observer already created")
        return
    }
    // observer instance
    cc_obsverver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            // const [timestamp]
            //@ts-expect-error
            const [timestamp, author, _, message] = mutation.addedNodes[0].children.content.childNodes
            // console.log(mutation.addedNodes, timestamp.innerText, author.innerText, message.innerText);

            let parsedMessage: IncomingMessage = {
                "emotes": undefined,
                "first-msg": false,
                "flags": undefined,
                "mod": false,
                "returning-chatter": false,
                "room-id": "3713327",
                "subscriber": undefined,
                "tmi-sent-ts": "1699766625533",
                "turbo": false,
                "user-type": undefined,
                "emotes-raw": undefined,
                "badge-info-raw": "subscriber/5",
                "badges-raw": "subscriber/0",
                "username": "dioxsisttv",
                "message-type": "chat",
                "channel-nonce": '',
                "display-name": author.innerText,
                "user-id": '',
                "color": 'red',
                message: message.innerText,
                origin: 'YT',
                id: '',
                channel: 'TODO'
            }
            appendMessageToYT(parsedMessage);
        });
    });

    // configuration
    var config = { attributes: false, childList: true, characterData: true, subtree: false };

    // start observer
    cc_obsverver.observe(yt_chat, config);
}
document.addEventListener('DOMContentLoaded', function () {
    listenOnYTChat()
    chrome.runtime.onMessage.addListener(function (message: { messageType: string, message: any }, sender, sendResponse) {
        console.log(message, sender)
        if (message.messageType === 'INCOMING_MESSAGE') appendMessageToYT(message.message)

    })
})

// TODO: automatically have the scroll bar scroll to the bottom
function appendMessageToYT(message: IncomingMessage) {
    const userMessages = parseUserMessage(message.message)
    // const chatContainer = document.querySelector("ul")
    const containerDiv = document.createElement('span')
    containerDiv.classList.add('cc_message')

    for (const uMessage of userMessages) {
        if (typeof uMessage === 'string') {
            const linkRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/, 'gm')
            if (uMessage.match(linkRegex)) {
                const messageComp = uMessage.split(' ')
                for (const msg of messageComp) {
                    if (linkRegex.test(msg)) {
                        const link = document.createElement('a')
                        link.href = uMessage
                        link.target = '_blank'
                        link.innerText = msg
                        containerDiv.append(link)
                    } else {
                        containerDiv.append(msg + ' ')
                    }
                }
            } else {

                const span = document.createElement('span')
                span.style.color = 'white'
                span.innerHTML = uMessage
                containerDiv.append(span)
            }
        } else {
            const img = document.createElement('img')
            img.src = `"https://static-cdn.jtvnw.net/emoticons/v2/${uMessage.id}/default/dark/1.0"`
            img.alt = uMessage.token
            containerDiv.append(img)
        }
    }
    try {
        createTextNode(message, containerDiv)
        checkChildNodes()
    } catch (err) {
        console.log("err", err)
    }
}
// A function that will check how many child nodes are in a parent node and remove the first one if there are more than 100
function checkChildNodes() {
    const cc_container = document.querySelector('#cc_container')
    if (cc_container && cc_container.childNodes.length > 200) {
        // remove nodes
        for (let i = 0; i < 10; i++) {
            cc_container.removeChild(cc_container.childNodes[i])
        }
    }
}

/**
 * <div class="cc_text_container">
 * <span class="cc_username">username</span><span>:</span><span class="cc_message">message</span> 
 * </div>
 */
function createTextNode(message: IncomingMessage, messageHTML: Node) {
    if (!message["display-name"] || ignoreList.includes(message["display-name"].toLowerCase())) return;
    const cc_text_container = document.createElement('div')
    cc_text_container.classList.add('cc_text_container')


    const usernameSpan = document.createElement('span')
    usernameSpan.innerText = `${message["display-name"]}`
    usernameSpan.classList.add('cc_username')
    usernameSpan.style.color = message.color || 'white'
    cc_text_container.appendChild(usernameSpan)

    const elipseSpan = document.createElement('span')
    elipseSpan.innerText = ':'
    cc_text_container.append(elipseSpan)

    cc_text_container.appendChild(messageHTML)

    const cc_container = document.querySelector('#cc_container')
    if (cc_container) {

        cc_container.appendChild(cc_text_container)

        cc_container.scrollTop = cc_container?.scrollHeight;
    }
}
