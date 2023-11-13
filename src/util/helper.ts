import type { ChatMessage } from "@/background";
import { linkRegex } from "./constants";
import { Emote } from "@/models/emotes";

export function retry<T>(fn: () => Promise<T>, options?: { retry: number, interval: number }): Promise<T> {
    if (!options) options = { retry: 3, interval: 1000 }
    let retriesLeft = options.retry
    return new Promise((resolve, reject) => {
        fn()
            .then(resolve)
            .catch((error: any) => {
                setTimeout(() => {
                    if (retriesLeft === 1) {
                        // reject('maximum retries exceeded');
                        reject(error);
                        return;
                    }

                    // Passing on "reject" is the important part
                    retry(fn, { retry: retriesLeft - 1, interval: options!.interval }).then(resolve, reject);
                }, options?.interval);
            });
    }) as Promise<T>;
};


export function isYoutubeVideo(url: string) {
    const u = new URL(url)
    return u.hostname === 'www.youtube.com' && u.searchParams.has('v')
}

export function isLink(word: string) {
    return linkRegex.test(word)
}
export function isEmote(word: string) {
    //TODO:
    return false
}
// Sleep function
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function stringToChatMessage(message: string): ChatMessage[] {
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

// export function formatYTMessage(messageNode: any): ChatMessage[] {
//     const messages: ChatMessage[] = []
//     for (const child of messageNode.childNodes) {
//         if (child.nodeName === '#text') messages.push(...stringToChatMessage(child.textContent));
//         //Emote
//         if (child.nodeName === 'IMG') {
//             if (!child.attributes['shared-tooltip-text']?.value) {
//                 debugger

//             }
//             messages.push({
//                 type: 'emote',
//                 value: child.attributes.src.value,
//                 emoteTag: child.attributes['shared-tooltip-text'].value
//             });
//         }
//     }
//     return messages
// }