import {
  SelectProps,
  SpaceBetween,
  FormField,
  Select,
} from '@awsui/components-react';
import { useGlobalState } from '../contexts/global-state';

export function TeamSelector() {
  const {
    selectOrg,
    selectTeam,
    selectedOrg,
    selectedTeam,
    accessToken,
    availableOrgs,
    orgsLoading,
    orgsError,
  } = useGlobalState();

  const selectedOrgOption: SelectProps['selectedOption'] = selectedOrg
    ? { label: selectedOrg.name, value: selectedOrg.login }
    : null;

  const selectedTeamOption: SelectProps['selectedOption'] = (() => {
    if (selectedOrg?.teams.length === 0) {
      return { value: undefined, label: '-' };
    }
    if (!selectedTeam) {
      return null;
    }
    return { label: selectedTeam.name, value: selectedTeam.slug };
  })();

  const availableOrgOptions: SelectProps['options'] = availableOrgs?.map(
    (org) => ({
      label: org.name,
      value: org.login,
    })
  );

  const availableTeamOptions: SelectProps['options'] = selectedOrg?.teams?.map(
    (team) => ({ label: team.name, value: team.slug })
  );

  return (
    <SpaceBetween size="s" direction="horizontal">
      <FormField label="Organisation">
        <div style={{ minWidth: 200 }}>
          <Select
            disabled={!accessToken}
            selectedOption={selectedOrgOption}
            placeholder="Choose an organisation"
            statusType={
              orgsLoading
                ? 'loading'
                : orgsError && !availableOrgOptions
                ? 'error'
                : 'finished'
            }
            errorText="The list failed to load."
            options={availableOrgOptions}
            onChange={(e) => selectOrg(e.detail.selectedOption.value!)}
            empty="No organisations available"
          />
        </div>
      </FormField>

      <FormField label="Team">
        <div style={{ minWidth: 200 }}>
          <Select
            selectedOption={selectedOrg ? selectedTeamOption : null}
            placeholder="Choose a team"
            options={availableTeamOptions}
            empty="No teams available"
            disabled={!selectedOrg}
            onChange={(e) => selectTeam(e.detail.selectedOption.value!)}
          />
        </div>
      </FormField>
    </SpaceBetween>
  );
}
