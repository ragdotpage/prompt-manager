import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useParams } from '@tanstack/react-router';
import { createContext, useEffect, useRef, useState } from 'react';
import { getWorkspaceBySlugOrId } from '~/api/workspaces';
import { enableMocking, stopMocking } from '~/mocks/browser';
import type { MockResponse } from '~/mocks/dataGeneration';
import { WorkspaceRoute } from '~/routes/workspaces';
import type { Workspace } from '~/types';

interface WorkspaceContextValue {
  workspace: Workspace;
  projects: MockResponse['project'];
  labels: MockResponse['workspace']['labelsTable'];
}

export const WorkspaceContext = createContext({} as WorkspaceContextValue);

export const workspaceQueryOptions = (idOrSlug: string) =>
  queryOptions({
    queryKey: ['workspaces', idOrSlug],
    queryFn: () => getWorkspaceBySlugOrId(idOrSlug),
  });

const WorkspacePage = () => {
  const { idOrSlug } = useParams({ from: WorkspaceRoute.id });
  const workspaceQuery = useSuspenseQuery(workspaceQueryOptions(idOrSlug));
  const workspace = workspaceQuery.data;
  const [projects, setProjects] = useState([] as MockResponse['project']);
  const [labels, setLabels] = useState([] as MockResponse['workspace']['labelsTable']);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Stop mock worker from running twice in Strict mode
    }

    enableMocking().then(() => {
      fetch('/mock/workspace')
        .then((response) => response.json())
        .then((data) => {
          setProjects(data.project);
          setLabels(data.workspace.labelsTable);
          stopMocking(); // Ensure to stop mocking after fetching data
        })
        .catch((error) => console.error('Error fetching MSW data:', error));
    });
  }, [workspace]);

  return (
    <WorkspaceContext.Provider value={{ workspace, projects, labels }}>
      <Outlet />
    </WorkspaceContext.Provider>
  );
};

export default WorkspacePage;