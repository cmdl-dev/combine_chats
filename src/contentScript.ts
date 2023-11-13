//@ts-check
import type { ChatMessage, IncomingMessage } from "./background";
import type { Messenger } from "./util/chromeTab";

// import { LINK_COLOR, linkRegex } from "./util/constants";
import { Emote } from "./models/emotes";

// import { isEmote, isLink } from "./util/helper";

// TODO: Figure out a way to have this be imported
// Getting Cannot import statement outside a module
const linkRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/, 'gm')

const LINK_COLOR = 'green'
function isLink(word: string) {
    return linkRegex.test(word)
}
function isEmote(word: string) {
    //TODO:
    return false
}
function stringToChatMessage(message: string): ChatMessage[] {
    let emoteRecord: Record<string, any> = {}// //TODO: put somewhere else

    let messageParts = message.split(' ');

    const chatMessages: ChatMessage[] = []
    for (let index = 0; index < messageParts.length; index++) {
        const word = messageParts[index];

        if (isEmote(word)) {
            const emote = new Emote(emoteRecord[word])
            chatMessages.push({
                emoteTag: emote.token,
                type: 'emote',
                value: emote.url
            })
        } else if (isLink(word)) {
            chatMessages.push({
                type: 'link',
                value: word
            })
        } else {
            chatMessages.push({ type: 'string', value: word })
        }
    }
    return chatMessages
}
function formatYTMessage(messageNode: any): ChatMessage[] {
    const messages: ChatMessage[] = []
    for (const child of messageNode.childNodes) {
        if (child.nodeName === '#text') messages.push(...stringToChatMessage(child.textContent));
        //Emote
        if (child.nodeName === 'IMG') {
            messages.push({
                type: 'emote',
                value: child.attributes.src.value,
                emoteTag: child.attributes['shared-tooltip-text'].value
            });
        }
    }
    return messages
}
const ignoreList = ['Restream Bot', 'restreambot'].map(name => name.toLowerCase())
let cc_obsverver: MutationObserver;


//Refactor into format messages
function messageToElements(message: ChatMessage[]): (HTMLElement | string)[] {
    const elements: (HTMLElement | string)[] = []
    for (const msg of message) {

        if (msg.type === 'emote') {
            const img = document.createElement('img');
            img.setAttribute('width', '24px')
            img.setAttribute('height', '24px')
            img.src = msg.value
            img.alt = msg.emoteTag
            elements.push(img)
            continue
        }
        if (msg.type === 'link') {
            const link = document.createElement('a')
            link.style.color = LINK_COLOR
            link.href = msg.value
            link.target = '_blank'
            link.innerText = msg.value
            elements.push(link)
            continue
        }
        if (msg.type === 'string') elements.push(msg.value)
    }
    return elements
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
            console.log(mutation.addedNodes, timestamp.innerText, author.innerText, message.innerText);

            // if (message.innerText.length === 0) {
            //     debugger;
            // }

            let parsedMessage: IncomingMessage = {
                "emotes": undefined,
                "first-msg": false,
                "flags": undefined,
                "mod": false,
                "returning-chatter": false,
                "room-id": "",
                "subscriber": undefined,
                "tmi-sent-ts": "",
                "turbo": false,
                "user-type": undefined,
                "emotes-raw": undefined,
                "badge-info-raw": "",
                "badges-raw": "",
                "username": "",
                "message-type": "chat",
                "channel-nonce": '',
                "display-name": author.innerText,
                "user-id": '',
                "color": 'red',
                message: formatYTMessage(message),
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
    chrome.runtime.onMessage.addListener(function (message: Messenger, sender, sendResponse) {
        if (message.message && message.messageType === 'INCOMING_MESSAGE') appendMessageToYT(message.message)
    })
})

// TODO: automatically have the scroll bar scroll to the bottom
function appendMessageToYT(message: IncomingMessage) {
    const containerDiv = document.createElement('span')
    containerDiv.classList.add('cc_message')

    const userMessages = messageToElements(message.message)

    userMessages.forEach((element, index) => {
        containerDiv.append(element)
        if (index !== userMessages.length - 1) containerDiv.append(' ')
    });
    try {
        appendMessageElement(message, containerDiv)
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
function appendMessageElement(message: IncomingMessage, messageHTML: Node) {
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
