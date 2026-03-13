/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_HIRESHIELD_ADDRESS: string;
  readonly VITE_ESCROW_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
