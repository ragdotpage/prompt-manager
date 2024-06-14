import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { type GetUsersParams, getUsers, updateUser } from '~/api/users';

import type { RowsChangeData, SortColumn } from 'react-data-grid';
import { toast } from 'sonner';
import { useDebounce } from '~/hooks/use-debounce';
import { useMutateInfiniteQueryData } from '~/hooks/use-mutate-query-data';
import { DataTable } from '~/modules/common/data-table';
import type { User } from '~/types';
import useSaveInSearchParams from '../../../hooks/use-save-in-search-params';
import { useColumns } from './columns';
import Toolbar from './toolbar';
import { useMutation } from '~/hooks/use-mutations';
import { UsersTableRoute, type UsersSearchType } from '~/routes/system';
import type { config } from 'config';

export const LIMIT = 40;

const usersQueryOptions = ({ q, sort: initialSort, order: initialOrder, role, limit }: GetUsersParams) => {
  const sort = initialSort || 'createdAt';
  const order = initialOrder || 'desc';

  return infiniteQueryOptions({
    queryKey: ['users', q, sort, order, role],
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const fetchedData = await getUsers(
        {
          page: pageParam,
          q,
          sort,
          order,
          role,
          limit,
        },
        signal,
      );
      return fetchedData;
    },
    getNextPageParam: (_lastPage, allPages) => allPages.length,
    refetchOnWindowFocus: false,
  });
};

export type SystemRoles = (typeof config.rolesByType.systemRoles)[number] | undefined;

const UsersTable = () => {
  const search = useSearch({ from: UsersTableRoute.id });

  const [rows, setRows] = useState<User[]>([]);
  const [selectedRows, setSelectedRows] = useState(new Set<string>());
  const [query, setQuery] = useState<UsersSearchType['q']>(search.q);
  const [role, setRole] = useState<UsersSearchType['role']>(search.role);

  const [sortColumns, setSortColumns] = useState<SortColumn[]>(
    search.sort && search.order
      ? [{ columnKey: search.sort, direction: search.order === 'asc' ? 'ASC' : 'DESC' }]
      : [{ columnKey: 'createdAt', direction: 'DESC' }],
  );

  const debounceQuery = useDebounce(query, 300);

  // Save filters in search params
  const filters = useMemo(
    () => ({
      q: debounceQuery,
      sort: sortColumns[0]?.columnKey,
      order: sortColumns[0]?.direction.toLowerCase(),
      role,
    }),
    [debounceQuery, role, sortColumns],
  );

  useSaveInSearchParams(filters, { sort: 'createdAt', order: 'desc' });
  const callback = useMutateInfiniteQueryData([
    'users',
    debounceQuery,
    sortColumns[0]?.columnKey as UsersSearchType['sort'],
    sortColumns[0]?.direction.toLowerCase() as UsersSearchType['order'],
    role,
  ]);

  const { mutate: updateUserRole } = useMutation({
    mutationFn: async (user: User) => {
      return await updateUser(user.id, { role: user.role }); // Update user role
    },
    onSuccess: (response) => {
      callback([response], 'update');
      toast.success('Role updated successfully');
    },
    onError: () => toast.error('Error updating role'),
  });

  const queryResult = useInfiniteQuery(
    usersQueryOptions({
      q: debounceQuery,
      sort: sortColumns[0]?.columnKey as UsersSearchType['sort'],
      order: sortColumns[0]?.direction.toLowerCase() as UsersSearchType['order'],
      role,
      limit: LIMIT,
    }),
  );
  const [columns, setColumns] = useColumns(callback);

  const isFiltered = role !== undefined || !!debounceQuery;

  const onResetFilters = () => {
    setQuery('');
    setSelectedRows(new Set<string>());
    setRole(undefined);
  };

  const onRoleChange = (role?: string) => {
    setRole(role === 'all' ? undefined : (role as SystemRoles));
  };
  const onRowsChange = (changedRows: User[], { indexes, column }: RowsChangeData<User>) => {
    // mutate user role
    for (const index of indexes) {
      if (column.key === 'role') updateUserRole(changedRows[index]);
    }
    setRows(changedRows);
  };

  useEffect(() => {
    const data = queryResult.data?.pages?.flatMap((page) => page.items);

    if (data) {
      setSelectedRows(new Set<string>([...selectedRows].filter((id) => data.some((row) => row.id === id))));
      setRows(data);
    }
  }, [queryResult.data]);

  return (
    <div className="space-y-4 h-full">
      <Toolbar
        isFiltered={isFiltered}
        total={queryResult.data?.pages[0].total}
        query={query}
        setQuery={setQuery}
        onResetFilters={onResetFilters}
        onResetSelectedRows={() => setSelectedRows(new Set<string>())}
        role={role}
        onRoleChange={onRoleChange}
        selectedUsers={rows.filter((row) => selectedRows.has(row.id))}
        columns={columns}
        setColumns={setColumns}
        callback={callback}
      />

      <DataTable<User>
        {...{
          columns: columns.filter((column) => column.visible),
          rowHeight: 42,
          enableVirtualization: false,
          onRowsChange,
          rows,
          limit: LIMIT,
          totalCount: queryResult.data?.pages[0].total,
          rowKeyGetter: (row) => row.id,
          error: queryResult.error,
          isLoading: queryResult.isLoading,
          isFetching: queryResult.isFetching,
          fetchMore: queryResult.fetchNextPage,
          isFiltered,
          selectedRows,
          onSelectedRowsChange: setSelectedRows,
          sortColumns,
          onSortColumnsChange: setSortColumns,
        }}
      />
    </div>
  );
};

export default UsersTable;
