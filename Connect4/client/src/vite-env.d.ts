/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute URL of the game server (see .env.example). */
  readonly VITE_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
