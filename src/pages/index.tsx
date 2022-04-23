import SpaceBetween from '@awsui/components-react/space-between';
import type { NextPage } from 'next';
import { CustomAppLayout } from '../components/custom-app-layout';
import { PullRequestsTable } from '../components/pull-requests-table';
import { ClientSide } from '../components/client-side';
import Head from 'next/head';
import { TopNavigation } from '@awsui/components-react';
import { VersionInfo } from '../components/version-info';
import { GlobalStateContext } from '../contexts/global-state';
import { useState } from 'react';
import { SettingsDialog } from '../components/settings-dialog';

const Home: NextPage = () => {
  const [settingsDialogVisible, setSettingsDialogVisible] = useState(false);

  return (
    <>
      <Head>
        <title>Pull requests</title>
      </Head>
      <ClientSide>
        <GlobalStateContext>
          <div
            id="top-navigation"
            style={{ position: 'sticky', top: 0, zIndex: 1 }}
          >
            <TopNavigation
              identity={{
                href: '/',
                title: 'Pull requests on GitHub',
                onFollow: (e) => e.preventDefault(),
              }}
              i18nStrings={{} as any}
              utilities={[
                {
                  type: 'button',
                  text: 'Settings',
                  iconName: 'settings',
                  onClick: () => setSettingsDialogVisible(true),
                },
              ]}
            />
          </div>
          {settingsDialogVisible && (
            <SettingsDialog onDismiss={() => setSettingsDialogVisible(false)} />
          )}
          <CustomAppLayout
            headerSelector="#top-navigation"
            navigationHide
            toolsHide
          >
            <SpaceBetween direction="vertical" size="l">
              <PullRequestsTable />

              <VersionInfo />
            </SpaceBetween>
          </CustomAppLayout>
        </GlobalStateContext>
      </ClientSide>
    </>
  );
};

export default Home;
