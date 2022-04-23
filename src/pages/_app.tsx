import '@awsui/global-styles/index.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { FlashbarContext } from '../contexts/flashbar-context';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <FlashbarContext>
      <Component {...pageProps} />
    </FlashbarContext>
  );
}

export default MyApp;
