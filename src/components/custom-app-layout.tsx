import { AppLayout, AppLayoutProps, Flashbar } from '@awsui/components-react';
import { PropsWithChildren } from 'react';
import { useFlashbarContext } from '../contexts/flashbar-context';
import { useGlobalState } from '../contexts/global-state';

interface CustomAppLayoutProps extends Omit<AppLayoutProps, 'content'> {}

export function CustomAppLayout({
  children,
  ...rest
}: PropsWithChildren<CustomAppLayoutProps>) {
  const { messages } = useFlashbarContext();

  const { accessToken } = useGlobalState();

  return (
    <AppLayout
      {...rest}
      content={
        <div style={{ margin: '0 auto 150px', maxWidth: 1500 }}>{children}</div>
      }
      notifications={
        <div style={{ margin: '0 auto', maxWidth: 1500 }}>
          <Flashbar
            items={
              !accessToken
                ? [
                    {
                      type: 'info',
                      content:
                        'To get started, open the settings and configure an access token.',
                    },
                  ]
                : messages
            }
          />
        </div>
      }
    />
  );
}
