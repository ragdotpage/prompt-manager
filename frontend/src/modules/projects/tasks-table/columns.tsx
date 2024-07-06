import { Link } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useBreakpoints } from '~/hooks/use-breakpoints';
import { dateShort } from '~/lib/utils';
import type { Task } from '~/modules/common/electric/electrify';
import CheckboxColumn from '~/modules/common/data-table/checkbox-column';
import type { ColumnOrColumnGroup } from '~/modules/common/data-table/columns-view';
import HeaderCell from '~/modules/common/data-table/header-cell';
import type { TaskStatus } from '../task/task-selectors/select-status';
import { AvatarWrap } from '~/modules/common/avatar-wrap';
import { taskStatuses } from './status';
import { taskTypes } from '../task/task-selectors/select-task-type.tsx';
import { impacts } from '../task/task-selectors/select-impact.tsx';
import { sheet } from '~/modules/common/sheeter/state.ts';
import { TaskCard } from '../task/task-card.tsx';
import { NotSelected } from '../task/task-selectors/impact-icons/not-selected.tsx';
import { Button } from '~/modules/ui/button.tsx';
import { useWorkspaceStore } from '~/store/workspace.ts';
import { openUserPreviewSheet } from '~/modules/users/users-table/columns.tsx';

const statusTextColors = {
  0: 'text-sky-500',
  1: 'text-slate-300',
  2: 'text-slate-500',
  3: 'text-lime-500',
  4: 'text-yellow-500',
  5: 'text-orange-500',
  6: 'text-green-500',
};

const openTaskCardSheet = async (
  row: Task,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  handleTaskChange: (field: keyof Task, value: any, taskId: string) => void,
  handleTaskActionClick: (task: Task, field: string, trigger: HTMLElement) => void,
) => {
  sheet(
    <TaskCard
      task={row}
      isExpanded={true}
      isSelected={false}
      isFocused={true}
      handleTaskChange={handleTaskChange}
      handleTaskActionClick={handleTaskActionClick}
    />,
    {
      className: 'max-w-full lg:max-w-4xl p-0',
      title: <span className="pl-4">Task card preview</span>,
      text: <span className="pl-4">Here you can modify or delete your task</span>,
      id: `task-card-preview-${row.id}`,
    },
  );
};

export const useColumns = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  handleTaskChange: (field: keyof Task, value: any, taskId: string) => void,
  handleTaskActionClick: (task: Task, field: string, trigger: HTMLElement) => void,
) => {
  const { t } = useTranslation();
  const isMobile = useBreakpoints('max', 'sm');
  const { projects } = useWorkspaceStore();

  const mobileColumns: ColumnOrColumnGroup<Task>[] = [
    CheckboxColumn,
    {
      key: 'summary',
      name: t('common:summary'),
      visible: true,
      minWidth: 280,
      sortable: false,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row, tabIndex }) => (
        <Button
          variant="none"
          tabIndex={tabIndex}
          className="inline-flex justify-start h-auto text-left flex-wrap w-full outline-0 ring-0 group px-0"
          onClick={() => {
            openTaskCardSheet(row, handleTaskChange, handleTaskActionClick);
          }}
        >
          <span className="font-light whitespace-pre-wrap leading-5 py-1">{row.summary || '-'}</span>
        </Button>
      ),
    },
  ];

  return useState<ColumnOrColumnGroup<Task>[]>(
    isMobile
      ? mobileColumns
      : [
          ...mobileColumns,
          {
            key: 'type',
            name: t('common:type'),
            sortable: true,
            visible: true,
            cellClass: 'start',
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => (
              <>
                {taskTypes[taskTypes.findIndex((t) => t.value === row.type)]?.icon()} <span className="ml-2">{t(`common:${row.type}`)}</span>
              </>
            ),
            width: 140,
          },
          {
            key: 'impact',
            name: t('common:impact'),
            sortable: false,
            visible: true,
            width: 120,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => {
              if (row.type === 'bug') return '-';

              const impact = row.impact === null ? null : impacts[row.impact];

              return (
                <>
                  {impact === null ? (
                    <NotSelected className="size-4 mr-2" aria-hidden="true" title="Set impact" />
                  ) : (
                    <impact.icon className="size-4 mr-2" aria-hidden="true" title="Set impact" />
                  )}

                  <span>{impact === null ? '-' : impact.label}</span>
                </>
              );
            },
          },
          {
            key: 'status',
            name: t('common:status'),
            sortable: true,
            visible: true,
            width: 140,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => (
              <span className={statusTextColors[row.status as TaskStatus]}>{t(taskStatuses[row.status as TaskStatus].status)}</span>
            ),
          },
          {
            key: 'subTasks',
            name: t('common:todos'),
            sortable: false,
            visible: false,
            width: 80,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) =>
              row.subTasks.length > 0 ? (
                <div className="inline-flex py-0 h-5 ml-1 gap-[.07rem]">
                  <span className="text-success">{row.subTasks.filter((t) => t.status === 6).length}</span>
                  <span className="font-light">/</span>
                  <span className="font-light">{row.subTasks.length}</span>
                </div>
              ) : (
                row.subTasks.length
              ),
          },
          {
            key: 'created_by',
            name: t('common:created_by'),
            sortable: true,
            visible: true,
            width: 180,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row, tabIndex }) => {
              const user = row.virtualCreatedBy;
              if (!user) return row.created_by;
              return (
                <Link
                  to="/user/$idOrSlug"
                  tabIndex={tabIndex}
                  params={{ idOrSlug: user.id }}
                  className="flex space-x-2 items-center outline-0 ring-0 group truncate"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey) return;
                    e.preventDefault();
                    openUserPreviewSheet(user);
                  }}
                >
                  <AvatarWrap type="USER" className="h-6 w-6" id={user.id} name={user.name} url={user.thumbnailUrl} />
                  <span className="group-hover:underline underline-offset-4 truncate">{user.name || '-'}</span>
                </Link>
              );
            },
          },
          {
            key: 'project_id',
            name: t('common:project'),
            sortable: true,
            visible: true,
            width: 180,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row, tabIndex }) => {
              const project = projects.find((p) => p.id === row.project_id);
              if (!project) return row.project_id;

              return (
                <Link
                  to="/workspaces/$idOrSlug"
                  tabIndex={tabIndex}
                  params={{ idOrSlug: project.workspaceId || project.id }}
                  className="flex space-x-2 items-center outline-0 ring-0 group truncate"
                >
                  <AvatarWrap type="PROJECT" className="h-6 w-6 text-xs" id={project.id} name={project.name} />
                  <span className="group-hover:underline underline-offset-4 truncate">{project.name || '-'}</span>
                </Link>
              );
            },
          },
          {
            key: 'created_at',
            name: t('common:created_at'),
            sortable: true,
            visible: true,
            width: 180,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => dateShort(row.created_at),
          },
          {
            key: 'modified_at',
            name: t('common:updated_at'),
            sortable: true,
            visible: false,
            width: 180,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => dateShort(row.modified_at),
          },
        ],
  );
};
