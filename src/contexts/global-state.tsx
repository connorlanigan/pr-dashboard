import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { fetchPRs, PullRequest } from '../data/fetch-prs';
import { fetchTeams, Organisation, Team } from '../data/fetch-teams';
import { GraphQlError } from '../data/graphql';
import { usePersistedState } from '../hooks/persisted-state';
import { formatErrorText } from '../utils/format-error-text';
import { useFlashbarContext } from './flashbar-context';

const context = createContext<GlobalStateContext>({
  availableOrgs: undefined,
  orgsLoading: false,
  orgsError: false,
  pullRequests: undefined,
  pullRequestsError: undefined,
  pullRequestsLoading: false,
  accessToken: '',
  setAccessToken: () => {},
  selectOrg: () => {},
  selectTeam: () => {},
  selectedOrg: undefined,
  selectedTeam: undefined,
  useShortNamesForTeamMembers: false,
  setUseShortNamesForTeamMembers: () => {},
});

interface GlobalStateContext {
  availableOrgs: undefined | ReadonlyArray<Organisation>;
  orgsLoading: boolean;
  orgsError: boolean;
  pullRequests: ReadonlyArray<PullRequest> | undefined;
  pullRequestsError: undefined | Error | GraphQlError;
  pullRequestsLoading: boolean;
  accessToken: string;
  setAccessToken: (token: string) => void;
  selectedOrg: Organisation | undefined;
  selectOrg: (org: string | null) => void;
  selectedTeam: Team | undefined;
  selectTeam: (team: string | null) => void;
  useShortNamesForTeamMembers: boolean;
  setUseShortNamesForTeamMembers: (value: boolean) => void;
}

export function GlobalStateContext({ children }: PropsWithChildren<{}>) {
  const { addMessage } = useFlashbarContext();

  const [availableOrgs, setAvailableOrgs] = usePersistedState<
    ReadonlyArray<Organisation>
  >('available-orgs', []);
  const [orgsLoading, setOrgsLoading] = useState(availableOrgs === []);
  const [orgsError, setOrgsError] = useState(false);

  const [accessToken, setAccessToken] = usePersistedState('access-token', '');

  const [selectedOrgId, setSelectedOrgId] = usePersistedState<
    string | undefined
  >('selected-org', undefined);
  const selectedOrgIdRef = useRef(selectedOrgId);
  selectedOrgIdRef.current = selectedOrgId;

  const [selectedTeamId, setSelectedTeamId] = usePersistedState<
    string | null | undefined
  >('selected-team', undefined);
  const selectedTeamIdRef = useRef(selectedTeamId);
  selectedTeamIdRef.current = selectedTeamId;

  const [loading, setLoading] = useState(false);
  const [error, setPrError] = useState<undefined | Error | GraphQlError>(
    undefined
  );
  const [data, setData] = useState<ReadonlyArray<PullRequest> | undefined>(
    undefined
  );

  const selectedOrg = availableOrgs.find((org) => org.login === selectedOrgId);
  const selectedTeam = selectedOrg?.teams.find(
    (team) => team.slug === selectedTeamId
  );

  const [useShortNamesForTeamMembers, setUseShortNamesForTeamMembers] =
    usePersistedState('use-short-names-for-team-members', true);

  /**
   * Load organisations and teams.
   */
  useEffect(() => {
    let canceled = false;
    setOrgsLoading(true);
    setOrgsError(false);
    //setAvailableOrgs([]);

    if (accessToken) {
      new Promise((r) => setTimeout(r, 1000))
        .then(() => fetchTeams(accessToken))
        .then((orgs) => {
          if (!canceled) {
            setAvailableOrgs(orgs);

            /**
             * If the currently selected org or team are not available,
             * fall back to the first one respectively.
             */
            const currentOrg = orgs.find(
              (org) => org.login === selectedOrgIdRef.current
            );
            if (!selectedOrgIdRef.current || !currentOrg) {
              setSelectedOrgId(orgs.length > 0 ? orgs[0].login : undefined);
            } else {
              const currentTeam = currentOrg.teams.find(
                (team) => team.slug === selectedTeamIdRef.current
              );
              if (!selectedTeamIdRef.current || !currentTeam) {
                setSelectedTeamId(
                  currentOrg.teams.length > 0 ? currentOrg.teams[0].slug : null
                );
              }
            }
          }
        })
        .catch((e) => {
          if (!canceled) {
            setOrgsError(true);
            addMessage(
              formatErrorText(
                e,
                `The list of available organisations failed to load.`
              ),
              {
                type: 'error',
              }
            );
            console.error(e);
          }
        })
        .finally(() => {
          if (!canceled) {
            setOrgsLoading(false);
          }
        });
    }
    return () => {
      canceled = true;
    };
  }, [
    accessToken,
    addMessage,
    setAvailableOrgs,
    setSelectedOrgId,
    setSelectedTeamId,
  ]);

  /**
   * Load pull requests.
   */
  useEffect(() => {
    let canceled = false;
    setData(undefined);
    if (!accessToken || !selectedOrgId || selectedTeamId === undefined) {
      return;
    }
    setLoading(true);
    fetchPRs(accessToken, selectedOrgId, selectedTeamId)
      .then((data) => {
        if (!canceled) {
          setData(data);
        }
      })
      .catch((e) => {
        if (!canceled) {
          console.error(e);
          setPrError(e);
          addMessage(
            formatErrorText(e, `The list of pull requests failed to load.`),
            {
              type: 'error',
            }
          );
        }
      })
      .finally(() => {
        if (!canceled) {
          setLoading(false);
        }
      });
    return () => {
      canceled = true;
    };
  }, [accessToken, addMessage, selectedOrgId, selectedTeamId]);

  const value = useMemo(
    () =>
      ({
        availableOrgs,
        accessToken,
        setAccessToken,
        selectedOrg,
        selectOrg: (id: string) => {
          setSelectedOrgId(id);

          // Select the first available team
          const selectedOrg = availableOrgs.find((org) => org.login === id);
          if (!selectedOrg || !selectedOrg.teams[0]) {
            setSelectedTeamId(null);
          } else {
            setSelectedTeamId(selectedOrg.teams[0].slug);
          }
        },
        selectedTeam,
        orgsError,
        selectTeam: setSelectedTeamId,
        pullRequests: data,
        pullRequestsError: error,
        pullRequestsLoading: loading,
        orgsLoading,
        useShortNamesForTeamMembers,
        setUseShortNamesForTeamMembers,
      } as GlobalStateContext),
    [
      availableOrgs,
      accessToken,
      setAccessToken,
      selectedOrg,
      selectedTeam,
      orgsError,
      setSelectedTeamId,
      data,
      error,
      loading,
      orgsLoading,
      useShortNamesForTeamMembers,
      setUseShortNamesForTeamMembers,
      setSelectedOrgId,
    ]
  );

  return <context.Provider value={value}>{children}</context.Provider>;
}

export function useGlobalState() {
  return useContext(context);
}
