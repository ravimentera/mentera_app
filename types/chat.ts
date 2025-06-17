export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatInterfaceProps {
  className?: string;
  onSendMessage: () => void;
  hasChatStarted?: boolean;
  username?: string;
  showDynamicContent?: boolean;
}
