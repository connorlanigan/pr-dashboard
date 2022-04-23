import { FlashbarProps } from '@awsui/components-react';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { randomId } from '../utils/random-id';

const context = createContext<FlashbarContext>({
  messages: [],
  addMessage: (message, props) => {
    console.warn('No flashbar context is available. Message:', message, props);
  },
});

interface FlashbarContext {
  messages: FlashbarProps['items'];
  addMessage: (
    message: string,
    props?: Partial<FlashbarProps.MessageDefinition>
  ) => void;
}

type MessageWithId = FlashbarProps.MessageDefinition & { id: string };

export function FlashbarContext({ children }: PropsWithChildren<{}>) {
  const [messages, setMessages] = useState<ReadonlyArray<MessageWithId>>([]);

  const addMessage = useCallback(
    (message: string, props?: Partial<FlashbarProps.MessageDefinition>) => {
      const id = randomId();
      const entry: MessageWithId = {
        id,
        dismissible: true,
        dismissLabel: 'Dismiss message',
        content: message,
        ...props,
        onDismiss: (e) => {
          setMessages((messages) => messages.filter((m) => m.id !== id));
          props?.onDismiss?.(e);
        },
      };
      setMessages((messages) => [...messages, entry]);
    },
    []
  );

  const value = useMemo(
    () => ({
      messages,
      addMessage,
    }),
    [addMessage, messages]
  );

  return <context.Provider value={value}>{children}</context.Provider>;
}

export function useFlashbarContext() {
  return useContext(context);
}
