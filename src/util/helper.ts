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

// Sleep function
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}