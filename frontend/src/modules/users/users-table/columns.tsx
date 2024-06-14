import { useTranslation } from 'react-i18next';
import type { User } from '~/types';

import { UserRoundCheck } from 'lucide-react';
import { useBreakpoints } from '~/hooks/use-breakpoints';
import { dateShort } from '~/lib/utils';
import { renderSelect } from '~/modules/common/data-table/select-column';
import { AvatarWrap } from '../../common/avatar-wrap';
import CheckboxColumn from '../../common/data-table/checkbox-column';
import type { ColumnOrColumnGroup } from '../../common/data-table/columns-view';
import HeaderCell from '../../common/data-table/header-cell';
import RowEdit from './row-edit';
import { config } from 'config';
import { sheet } from '~/modules/common/sheeter/state';
import { UserProfile } from '../user-profile';
import { useState } from 'react';

export const useColumns = (callback: (users: User[], action: 'create' | 'update' | 'delete') => void) => {
  const { t } = useTranslation();
  const isMobile = useBreakpoints('max', 'sm');

  const openUserPreviewSheet = (user: User) => {
    sheet(<UserProfile user={user} />, {
      className: 'sm:max-w-full max-w-full w-[50vw]',
      title: t('common:user_preview'),
      id: 'user-preview',
    });
  };
  const mobileColumns: ColumnOrColumnGroup<User>[] = [
    CheckboxColumn,
    {
      key: 'name',
      name: t('common:name'),
      visible: true,
      minWidth: 180,
      sortable: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => (
        <button className="flex space-x-2 items-center outline-0 ring-0 group" type="button" onClick={() => openUserPreviewSheet(row)}>
          <AvatarWrap type="USER" className="h-8 w-8" id={row.id} name={row.name} url={row.thumbnailUrl} />
          <span className="group-hover:underline underline-offset-4 truncate font-medium">{row.name || '-'}</span>
        </button>
      ),
    },
    {
      key: 'edit',
      name: '',
      visible: true,
      width: 32,
      renderCell: ({ row, tabIndex }) => <RowEdit user={row} tabIndex={tabIndex} callback={callback} />,
    },
  ];
  const columns: ColumnOrColumnGroup<User>[] = [
    {
      key: 'email',
      name: t('common:email'),
      sortable: true,
      visible: true,
      renderHeaderCell: HeaderCell,
      minWidth: 140,
      renderCell: ({ row, tabIndex }) => {
        return (
          <a href={`mailto:${row.email}`} tabIndex={tabIndex} className="truncate hover:underline underline-offset-4 outline-0 ring-0 font-light">
            {row.email || '-'}
          </a>
        );
      },
    },
    {
      key: 'role',
      name: t('common:role'),
      sortable: true,
      visible: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => t(row.role.toLowerCase()),
      width: 100,
      renderEditCell: (props) =>
        renderSelect({
          props,
          options: config.rolesByType.systemRoles,
          key: 'role',
        }),
    },
    {
      key: 'createdAt',
      name: t('common:created_at'),
      sortable: true,
      visible: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => dateShort(row.createdAt),
      minWidth: 180,
    },
    {
      key: 'lastSeenAt',
      name: t('common:last_seen_at'),
      sortable: true,
      visible: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => dateShort(row.lastSeenAt),
      minWidth: 180,
    },
    {
      key: 'membershipCount',
      name: 'Memberships',
      sortable: false,
      visible: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => (
        <>
          <UserRoundCheck className="mr-2 opacity-50" size={16} />
          {row.counts?.memberships | 0}
        </>
      ),
      width: 140,
    },
  ];

  return useState<ColumnOrColumnGroup<User>[]>(isMobile ? mobileColumns : [...mobileColumns, ...columns]);
};
