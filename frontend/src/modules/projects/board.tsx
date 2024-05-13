import { Fragment, createContext, useContext, useEffect, useMemo } from 'react';
import type { ProjectWithLabels, Task } from '../common/root/electric';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { WorkspaceContext } from '../workspaces';
import { BoardColumn } from './board-column';
import { useTranslation } from 'react-i18next';
import { Bird } from 'lucide-react';
import ContentPlaceholder from '../common/content-placeholder';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

interface ProjectContextValue {
  project: ProjectWithLabels;
}

export const ProjectContext = createContext({} as ProjectContextValue);

export default function Board() {
  const { t } = useTranslation();
  const { projects, tasks, searchQuery } = useContext(WorkspaceContext);

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    return tasks.filter(
      (task) =>
        task.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.markdown?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.slug.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, tasks]);

  useEffect(() => {
    return combine(
      monitorForElements({
        canMonitor({ source }) {
          return source.data.type === 'column' || source.data.type === 'task';
        },
        onDrop({ location, source }) {
          if (!location.current.dropTargets.length) return;

          if (source.data.type === 'column') {
            console.log(22);
            //TODO Dragging a column
          }

          // Dragging a task
          if (source.data.type === 'task') {
            const sourceTask = source.data.item as Task;
            const sourceProjectId = sourceTask.project_id;

            const [destinationTask] = location.current.dropTargets;
            const destinationItem = destinationTask.data.item as Task;
            const destinationProjectId = destinationItem.project_id;

            // reordering in same project
            if (sourceProjectId === destinationProjectId) {
              return;
            }
            // moving to a new project
            return;
          }
        },
      }),
    );
  }, []);

  return (
    <div className="h-[calc(100vh-64px-64px)] transition md:h-[calc(100vh-88px)]">
      <ResizablePanelGroup direction="horizontal" className="flex gap-2" id="project-panels">
        {!projects.length && (
          <ContentPlaceholder
            Icon={Bird}
            title={t('common:no_projects')}
            text={
              <p className="inline-flex gap-1">
                <span>{t('common:click')}</span>
                <span className="text-primary">{`+ ${t('common:add')}`}</span>
                <span>{t('common:no_projects.text')}</span>
              </p>
            }
          />
        )}
        {projects.map((project, index) => (
          <Fragment key={project.id}>
            <ResizablePanel key={`${project.id}-panel`}>
              <ProjectContext.Provider value={{ project }}>
                <BoardColumn tasks={filteredTasks.filter((t) => t.project_id === project.id)} key={`${project.id}-column`} />
              </ProjectContext.Provider>
            </ResizablePanel>
            {projects.length > index + 1 && (
              <ResizableHandle className="w-[6px] rounded border border-background -mx-[7px] bg-transparent hover:bg-primary/50 data-[resize-handle-state=drag]:bg-primary transition-all" />
            )}
          </Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  );
}
