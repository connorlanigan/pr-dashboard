import {
  Container,
  Header,
  FormField,
  Box,
  Button,
  Input,
  Link,
  Modal,
  SpaceBetween,
  Alert,
  TextContent,
} from '@awsui/components-react';
import { ReactNode, useState } from 'react';
import { useFlashbarContext } from '../contexts/flashbar-context';
import { useGlobalState } from '../contexts/global-state';
import { checkTokenScopes, FetchError } from '../data/graphql';

interface SettingsDialogProps {
  onDismiss: () => void;
}

export function SettingsDialog({ onDismiss }: SettingsDialogProps) {
  const { accessToken, setAccessToken } = useGlobalState();
  const [localToken, setLocalToken] = useState(accessToken);
  const { addMessage } = useFlashbarContext();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<
    string | undefined | ReactNode
  >(undefined);

  const save = async () => {
    setLoading(true);
    setErrorMessage(undefined);

    try {
      const scopes = await checkTokenScopes(localToken);
      if (
        scopes.includes('repo') &&
        (scopes.includes('read:org') || scopes.includes('admin:org'))
      ) {
        addMessage('Personal access token saved.', { type: 'success' });

        setAccessToken(localToken);
        onDismiss();
      } else {
        setErrorMessage(
          <>
            The token does not have the required scopes. It must have the{' '}
            <Box variant="code">repo</Box> and{' '}
            <Box variant="code">read:org</Box> scopes. It currently has the
            following scopes:
            <TextContent>
              <ul>
                {scopes.map((scope, index) => (
                  <li key={index}>
                    <Box variant="code">{scope}</Box>
                  </li>
                ))}
                {scopes.length === 0 && <li>(none)</li>}
              </ul>
            </TextContent>
          </>
        );
      }
    } catch (e) {
      if (e instanceof FetchError) {
        if (e.response.status === 401) {
          setErrorMessage('This token is not valid.');
          return;
        }
      }
      setErrorMessage('An error occured while checking this token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      header="Settings"
      visible
      onDismiss={loading ? undefined : onDismiss}
      closeAriaLabel="Close settings dialog"
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button
            onClick={save}
            loading={loading}
            disabled={localToken === accessToken}
            variant="primary"
          >
            Save
          </Button>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <SpaceBetween size="m">
          <FormField
            label="Personal access token"
            constraintText={
              <>
                Needs <Box variant="code">repo</Box> and{' '}
                <Box variant="code">read:org</Box> scopes.{' '}
                <Link
                  href="https://github.com/settings/tokens/new?description=pull-requests.connorlanigan.com&scopes=repo,read:org"
                  fontSize="body-s"
                  external
                >
                  Create a token on GitHub
                </Link>
              </>
            }
          >
            <Input
              value={localToken}
              autoComplete={false}
              placeholder="ghp_"
              onChange={(e) => {
                setLocalToken(e.detail.value);
              }}
            />
          </FormField>
          {errorMessage && <Alert type="error">{errorMessage}</Alert>}
        </SpaceBetween>
      </form>
    </Modal>
  );
}
