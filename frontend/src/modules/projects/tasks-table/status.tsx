import { Check, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Kbd } from '~/modules/common/kbd.tsx';
import { Button } from '~/modules/ui/button';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '~/modules/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '~/modules/ui/popover';
import { IcedIcon } from '../task/task-selectors/status-icons/iced';
import { StartedIcon } from '../task/task-selectors/status-icons/started';
import { UnstartedIcon } from '../task/task-selectors/status-icons/unstarted';
import { FinishedIcon } from '../task/task-selectors/status-icons/finished';
import { DeliveredIcon } from '../task/task-selectors/status-icons/delivered';
import { ReviewedIcon } from '../task/task-selectors/status-icons/reviewed';
import { AcceptedIcon } from '../task/task-selectors/status-icons/accepted';

export const taskStatuses = [
  { value: 0, action: 'iced', status: 'iced', icon: IcedIcon },
  { value: 1, action: 'start', status: 'unstarted', icon: UnstartedIcon },
  { value: 2, action: 'finish', status: 'started', icon: StartedIcon },
  { value: 3, action: 'deliver', status: 'finished', icon: FinishedIcon },
  { value: 4, action: 'review', status: 'delivered', icon: DeliveredIcon },
  { value: 5, action: 'accept', status: 'reviewed', icon: ReviewedIcon },
  { value: 6, action: 'accepted', status: 'accepted', icon: AcceptedIcon },
] as const;

interface Props {
  selectedStatuses: number[];
  setSelectedStatuses: (statuses: number[]) => void;
}

const SelectStatus = ({ selectedStatuses, setSelectedStatuses }: Props) => {
  const { t } = useTranslation();

  const [openPopover, setOpenPopover] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const isSearching = searchValue.length > 0;
  const indexArray = [...Array(taskStatuses.length).keys()];

  const handleSelectClick = (value: number) => {
    const existingStatus = selectedStatuses.find((status) => status === value);
    if (typeof existingStatus !== 'undefined') {
      const updatedList = selectedStatuses.filter((status) => status !== value);
      setSelectedStatuses(updatedList);
      return;
    }
    const newStatus = taskStatuses.find((status) => status.value === value);
    if (newStatus) {
      const updatedList = [...selectedStatuses, newStatus.value];
      setSelectedStatuses(updatedList);
      return;
    }
  };

  // TODO prevent search results from blick
  useMemo(() => {
    if (!indexArray.includes(Number.parseInt(searchValue))) return;
    handleSelectClick(taskStatuses[Number.parseInt(searchValue)].value);
    setSearchValue('');
    return;
  }, [searchValue]);

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Select Status"
          variant="ghost"
          size="sm"
          className="flex justify-start gap-2 group-hover/task:opacity-100 group-[.is-focused]/task:opacity-100 opacity-70"
        >
          {selectedStatuses.length ? (
            <div className="flex items-center gap-1">
              {selectedStatuses.map((status) => {
                const currentStatus = taskStatuses.find((s) => s.value === status);
                if (!currentStatus) return null;
                return (
                  <div key={currentStatus.value} className="flex items-center gap-1">
                    <currentStatus.icon title={currentStatus.status} />
                    <span>{t(currentStatus.status)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {t('common:status')}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 rounded-lg" align="end" onCloseAutoFocus={(e) => e.preventDefault()} sideOffset={4}>
        <Command className="relative rounded-lg">
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            clearValue={setSearchValue}
            className="leading-normal"
            placeholder={t('common:placeholder.select_status')}
          />
          {!isSearching && <Kbd value="A" className="absolute top-3 right-2.5" />}
          <CommandList>
            {taskStatuses && (
              <CommandGroup>
                {taskStatuses.map((status, index) => (
                  <CommandItem
                    key={status.value}
                    value={status.status}
                    onSelect={() => {
                      handleSelectClick(index);
                    }}
                    className="group rounded-md flex justify-between items-center w-full leading-normal"
                  >
                    <div className="flex items-center">
                      <status.icon title={status.status} className="mr-2 size-4" />
                      <span>{t(status.status)}</span>
                    </div>
                    <div className="flex items-center">
                      {selectedStatuses.some((s) => s === status.value) && <Check size={16} className="text-success" />}
                      {!isSearching && <span className="max-xs:hidden text-xs opacity-50 ml-3 mr-1">{index}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SelectStatus;
