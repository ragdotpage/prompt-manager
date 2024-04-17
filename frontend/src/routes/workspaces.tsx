import { createRoute } from '@tanstack/react-router';
import type { ErrorType } from 'backend/lib/errors';
// import { getUsersByOrganizationQuerySchema } from 'backend/modules/organizations/schema';
import { Suspense } from 'react';
import { queryClient } from '~/lib/router';
import { noDirectAccess } from '~/lib/utils';
import ErrorNotice from '~/modules/common/error-notice';
// import { membersQueryOptions } from '~/modules/organizations/members-table';
import Workspace, { workspaceQueryOptions } from '~/modules/workspaces/workspace';
// import OrganizationSettings from '~/modules/workspaces/workspace-settings';
import Projects from '~/modules/projects';
import { IndexRoute } from './routeTree';

// Lazy-loaded components
// const MembersTable = lazy(() => import('~/modules/organizations/members-table'));

// const membersSearchSchema = getUsersByOrganizationQuerySchema.pick({ q: true, sort: true, order: true, role: true });

export const WorkspaceRoute = createRoute({
  path: 'workspace/$workspaceIdentifier',
  staticData: { pageTitle: 'Workspace' },
  beforeLoad: ({ location }) => noDirectAccess(location, '/projects'),
  getParentRoute: () => IndexRoute,
  loader: async ({ params: { workspaceIdentifier } }) => {
    queryClient.ensureQueryData(workspaceQueryOptions(workspaceIdentifier));
  },
  errorComponent: ({ error }) => <ErrorNotice error={error as ErrorType} />,
  component: () => (
    <Suspense>
      <Workspace />
    </Suspense>
  ),
});

export const WorkspaceProjectsRoute = createRoute({
  path: '/projects',
  staticData: { pageTitle: 'Projects' },
  getParentRoute: () => WorkspaceRoute,
  component: () => <Projects />,
});

// export const WorkspaceMembersRoute = createRoute({
//   path: '/members',
//   staticData: { pageTitle: 'Members' },
//   getParentRoute: () => WorkspaceRoute,
//   validateSearch: membersSearchSchema,
//   loaderDeps: ({ search: { q, sort, order, role } }) => ({ q, sort, order, role }),
//   loader: async ({ params: { workspaceIdentifier }, deps: { q, sort, order, role } }) => {
//     const membersInfiniteQueryOptions = membersQueryOptions(workspaceIdentifier, { q, sort, order, role });
//     const cachedMembers = queryClient.getQueryData(membersInfiniteQueryOptions.queryKey);
//     if (!cachedMembers) {
//       queryClient.fetchInfiniteQuery(membersInfiniteQueryOptions);
//     }
//   },
//   component: () => (
//     <Suspense>
//       <MembersTable />
//     </Suspense>
//   ),
// });


// export const WorkspaceSettingsRoute = createRoute({
//   path: '/settings',
//   staticData: { pageTitle: 'Settings' },
//   getParentRoute: () => WorkspaceRoute,
//   component: () => <WorkspaceSettings />,
// });