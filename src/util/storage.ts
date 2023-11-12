
export async function updatePairing(yt_user: string, tt_user: string) {
    if (!yt_user || !tt_user) throw new Error('Either yt user or tt user is undefined')
    const pairing = await getUrlPairings()

    if (!pairing) {
        await saveUrlPairing(yt_user, tt_user)
        return;
    }
    await saveUrlPairing(yt_user, tt_user)
}


function saveUrlPairing(yt_user: string, tt_user: string) {
    chrome.storage.local.set({ urlPairing: { [yt_user]: tt_user } });
}

export async function getPairingForUser(yt_user: string) {
    try {

        const pairings = await getUrlPairings()
        if (!pairings) return undefined
        return pairings[yt_user]
    } catch (err) {
        console.error(err)
        return undefined
    }
}
async function getUrlPairings() {
    try {

        const pairings = await chrome.storage.local.get(["urlPairing"])
        const urlPairing = pairings.urlPairing as Record<string, string> | undefined;
        return urlPairing
    } catch (err) {
        throw err
    }
}