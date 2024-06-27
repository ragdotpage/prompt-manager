import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import type { UseFormProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import MDEditor from '@uiw/react-md-editor';
import { Bolt, Bug, Star, UserX, Tag, X, ChevronDown } from 'lucide-react';
import { type LegacyRef, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useFormWithDraft } from '~/hooks/use-draft-form';
import { useHotkeys } from '~/hooks/use-hot-keys.ts';
import { cn, nanoid } from '~/lib/utils.ts';
import { Button, buttonVariants } from '~/modules/ui/button';
import { useThemeStore } from '~/store/theme.ts';
import { useUserStore } from '~/store/user.ts';
import { dialog } from '~/modules/common/dialoger/state.ts';
import { type Label, type Task, useElectric } from '~/modules/common/electric/electrify.ts';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../ui/form.tsx';
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group.tsx';
import { useProjectContext } from '../board/project-context.tsx';
import { impacts, SelectImpact } from './task-selectors/select-impact.tsx';
import SetLabels, { badgeStyle } from './task-selectors/select-labels.tsx';
import SelectStatus from './task-selectors/select-status.tsx';
import { NotSelected } from './task-selectors/impact-icons/not-selected.tsx';
import { useMeasure } from '~/hooks/use-measure';
import AssignMembers from './task-selectors/select-members.tsx';
import { AvatarGroup, AvatarGroupList, AvatarOverflowIndicator } from '~/modules/ui/avatar';
import { AvatarWrap } from '~/modules/common/avatar-wrap.tsx';
import type { Member } from '~/types/index.ts';
import { Badge } from '../../ui/badge.tsx';

export type TaskType = 'feature' | 'chore' | 'bug';
export type TaskStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type TaskImpact = 0 | 1 | 2 | 3 | null;

export const taskTypes = ['feature', 'chore', 'bug'];

interface CreateTaskFormProps {
  dialog?: boolean;
  onCloseForm?: () => void;
  onFormSubmit?: (task: Task, isNew?: boolean, toStatus?: TaskStatus) => void;
}

const formSchema = z.object({
  id: z.string(),
  summary: z.string(),
  markdown: z.string(),
  type: z.string(),
  impact: z.number().nullable(),
  assignedTo: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      thumbnailUrl: z.string().nullable(),
      bio: z.string(),
    }),
  ),
  labels: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string().nullable(),
      project_id: z.string(),
    }),
  ),
  status: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ dialog: isDialog, onCloseForm }) => {
  const { t } = useTranslation();
  const { mode } = useThemeStore();
  const { user } = useUserStore(({ user }) => ({ user }));

  const { ref, bounds } = useMeasure();
  const Electric = useElectric();

  const { project, tasks, labels, members } = useProjectContext(({ project, tasks, labels, members }) => ({ project, tasks, labels, members }));

  const handleCloseForm = () => {
    if (isDialog) dialog.remove();
    onCloseForm?.();
  };

  const handleMDEscKeyPress: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (event.key !== 'Escape') return;
      handleCloseForm();
    },
    [handleCloseForm],
  );

  const handleHotKeysKeyPress = useCallback(() => {
    handleCloseForm();
  }, [handleCloseForm]);

  useHotkeys([['Escape', handleHotKeysKeyPress]]);

  const formOptions: UseFormProps<FormValues> = useMemo(
    () => ({
      resolver: zodResolver(formSchema),
      defaultValues: {
        id: nanoid(),
        markdown: '',
        summary: '',
        type: 'feature',
        impact: null,
        assignedTo: [],
        labels: [],
        status: 1,
      },
    }),
    [],
  );

  // Form with draft in local storage
  const form = useFormWithDraft<FormValues>(`create-task-${project.id}`, formOptions);

  const onSubmit = (values: FormValues) => {
    if (!Electric) return toast.error(t('common:local_db_inoperable'));
    // create(values);
    const summary = values.markdown.split('\n')[0];
    const slug = summary.toLowerCase().replace(/ /g, '-');
    const projectTasks = tasks.filter((task) => task.project_id === project.id);
    const order = projectTasks.length > 0 ? projectTasks[0].sort_order / 1.1 : 1;

    Electric.db.tasks
      .create({
        data: {
          id: values.id,
          markdown: values.markdown,
          summary: summary,
          type: values.type as TaskType,
          impact: values.impact as TaskImpact,
          labels: values.labels.map((label) => label.id),
          assigned_to: values.assignedTo.map((user) => user.id),
          status: values.status,
          organization_id: project.organizationId,
          project_id: project.id,
          created_at: new Date(),
          created_by: user.id,
          slug: slug,
          sort_order: order,
        },
      })
      .then(() => {
        form.reset();
        toast.success(t('common:success.create_resource', { resource: t('common:task') }));
        handleCloseForm();
      });
  };
  // Fix types
  return (
    <Form {...form}>
      <form
        ref={ref as LegacyRef<HTMLFormElement>}
        id="create-task"
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-3 border-b flex gap-2 flex-col shadow-inner"
      >
        <FormField
          control={form.control}
          name="markdown"
          render={({ field: { value, onChange } }) => {
            return (
              <FormItem>
                <FormControl>
                  <MDEditor
                    onKeyDown={handleMDEscKeyPress}
                    value={value}
                    textareaProps={{ placeholder: t('common:placeholder.mdEditor') }}
                    defaultTabEnable={true}
                    preview={'edit'}
                    onChange={(newValue) => {
                      if (typeof newValue === 'string') onChange(newValue);
                    }}
                    autoFocus={true}
                    hideToolbar={true}
                    visibleDragbar={false}
                    height={'auto'}
                    minHeight={40}
                    className="text-sm my-1"
                    style={{ color: mode === 'dark' ? '#F2F2F2' : '#17171C', background: 'transparent', padding: '0' }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field: { value, onChange } }) => {
            return (
              <FormItem>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    variant="merged"
                    className="gap-0 w-full"
                    value={value}
                    onValueChange={(newValue) => {
                      if (newValue.length > 0) onChange(newValue);
                    }}
                  >
                    {taskTypes.map((type) => (
                      <ToggleGroupItem size="sm" value={type} className="w-full" key={type}>
                        {type === 'feature' && <Star size={16} className="fill-amber-400 text-amber-500" />}
                        {type === 'chore' && <Bolt size={16} className="fill-slate-400 text-slate-500" />}
                        {type === 'bug' && <Bug size={16} className="fill-red-400 text-red-500" />}
                        <span className="ml-2 font-light">{t(`common:${type}`)}</span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {form.getValues('type') !== 'bug' && (
          <FormField
            control={form.control}
            name="impact"
            render={({ field: { onChange, value } }) => {
              const selectedImpactValue = value as TaskImpact;
              const selectedImpact = selectedImpactValue !== null ? impacts[selectedImpactValue] : null;
              return (
                <FormItem>
                  <FormControl>
                    <SelectImpact value={selectedImpactValue} triggerWidth={bounds.width} changeTaskImpact={onChange}>
                      <Button
                        aria-label="Set impact"
                        variant="ghost"
                        size="sm"
                        className="w-full text-left font-light flex gap-2 justify-start border"
                      >
                        {selectedImpact !== null ? (
                          <>
                            <selectedImpact.icon className="size-4" aria-hidden="true" title="Set impact" />
                            {selectedImpact.label}
                          </>
                        ) : (
                          <>
                            <NotSelected className="size-4" aria-hidden="true" title="Set impact" />
                            {t('common:set_impact')}
                          </>
                        )}
                      </Button>
                    </SelectImpact>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field: { onChange, value } }) => {
            return (
              <FormItem>
                <FormControl>
                  <AssignMembers users={members} value={value as Member[]} triggerWidth={bounds.width} changeAssignedTo={onChange}>
                    <Button aria-label="Assign" variant="ghost" size="sm" className="flex justify-start gap-2 font-light w-full text-left border">
                      {value.length ? (
                        <>
                          <AvatarGroup limit={3}>
                            <AvatarGroupList>
                              {value.map((user) => (
                                <AvatarWrap
                                  type="USER"
                                  key={user.id}
                                  id={user.id}
                                  name={user.name}
                                  url={user.thumbnailUrl}
                                  className="h-6 w-6 text-xs"
                                />
                              ))}
                            </AvatarGroupList>
                            <AvatarOverflowIndicator className="h-6 w-6 text-xs" />
                          </AvatarGroup>
                          <span className="ml-2 truncate">
                            {value.length === 0 && 'Assign to'}
                            {value.length === 1 && value[0].name}
                            {value.length === 2 && value.map(({ name }) => name).join(', ')}
                            {value.length > 2 && `${value.length} assigned`}
                          </span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-4 w-4 opacity-50" /> {t('common:assign_to')}
                        </>
                      )}
                    </Button>
                  </AssignMembers>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {
          // TODO: Bind the entire project object instead of individual IDs
        }
        <FormField
          control={form.control}
          name="labels"
          render={({ field: { onChange, value } }) => {
            return (
              <FormItem>
                <FormControl>
                  <SetLabels
                    labels={labels}
                    value={value as Label[]}
                    triggerWidth={bounds.width}
                    projectId={project.id}
                    organizationId={project.organizationId}
                    changeLabels={onChange}
                  >
                    <Button
                      aria-label="Set labels"
                      variant="ghost"
                      size="sm"
                      className="flex h-auto justify-start font-light w-full  text-left min-h-9 py-1 border hover:bg-accent/20"
                    >
                      <div className="flex truncate flex-wrap gap-[1px]">
                        {value.length > 0 ? (
                          value.map(({ name, id, color }) => {
                            return (
                              <div
                                key={id}
                                style={badgeStyle(color)}
                                className="flex flex-wrap align-center justify-center items-center rounded-full border pl-2 pr-1 bg-border"
                              >
                                <Badge variant="outline" key={id} className="border-0 font-normal px-1 text-[12px] text-sm h-6 last:mr-0">
                                  {name}
                                </Badge>

                                <button
                                  type="button"
                                  className={cn(
                                    buttonVariants({ size: 'micro', variant: 'ghost' }),
                                    'opacity-70 hover:opacity-100 rounded-full w-5 h-5 focus-visible:ring-offset-0 active:translate-y-0',
                                  )}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    onChange(value.filter((l) => l.name !== name));
                                  }}
                                >
                                  <X size={16} strokeWidth={3} />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <>
                            <Tag size={16} className="opacity-50" />
                            <span className="ml-2">{t('common:choose_labels')}</span>
                          </>
                        )}
                      </div>
                    </Button>
                  </SetLabels>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex [&:not(.absolute)]:active:translate-y-px">
            <Button
              size={'xs'}
              type="submit"
              disabled={!form.formState.isDirty}
              className={`grow ${form.formState.isDirty ? 'rounded-none rounded-l' : 'rounded'} [&:not(.absolute)]:active:translate-y-0`}
            >
              <span>{t('common:create')}</span>
            </Button>
            {form.formState.isDirty && (
              <FormField
                control={form.control}
                name="status"
                render={({ field: { onChange } }) => {
                  return (
                    <FormItem className="gap-0 w-8">
                      <FormControl>
                        <SelectStatus
                          taskStatus={1}
                          changeTaskStatus={(newStatus) => {
                            onChange(newStatus);
                            onSubmit(form.getValues());
                          }}
                          trigger={
                            <Button
                              aria-label="Set status"
                              variant={'default'}
                              size="xs"
                              className="rounded-none rounded-r border-l border-l-background/25 [&:not(.absolute)]:active:translate-y-0"
                            >
                              <ChevronDown size={16} />
                            </Button>
                          }
                          inputPlaceholder={t('common:placeholder.create_with_status')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
          </div>

          <Button
            size={'xs'}
            type="reset"
            variant="secondary"
            className={form.formState.isDirty ? '' : 'invisible'}
            aria-label="Cancel"
            onClick={() => form.reset()}
          >
            {t('common:cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateTaskForm;
