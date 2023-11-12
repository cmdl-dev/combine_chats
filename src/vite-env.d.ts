/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly OAUTH: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}