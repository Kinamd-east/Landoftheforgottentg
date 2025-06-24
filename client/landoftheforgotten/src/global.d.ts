// global.d.ts

export {};

declare global {
  interface TelegramUser {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    language_code?: string;
    is_premium?: boolean;
    is_bot: boolean;
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      user?: TelegramUser;
    };
    ready: () => void;
    expand: () => void;
    close: () => void;
    sendData: (data: string) => void;
  }

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
