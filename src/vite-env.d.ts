/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_OAUTH: string
    readonly VITE_USERNAME: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}