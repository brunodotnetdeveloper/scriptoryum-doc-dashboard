import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { THEME_SIZES, THEME_SPACING } from '@/constants/theme';

interface WorkspaceSelectorProps {
  className?: string;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ className }) => {
  const { currentWorkspace, userWorkspaces, switchWorkspace } = useAuth();

  if (!userWorkspaces.length) {
    return null;
  }

  const handleWorkspaceChange = (workspaceId: string) => {
    switchWorkspace(parseInt(workspaceId));
  };

  return (
    <div className={`flex items-center ${THEME_SPACING.gap.sm} ${className}`}>
      <Building2 className={`${THEME_SIZES.icon.sm} text-muted-foreground flex-shrink-0`} />
      <Select
        value={currentWorkspace?.id?.toString() || ''}
        onValueChange={handleWorkspaceChange}
      >
        <SelectTrigger className="w-full sm:w-[200px] min-w-0">
          <SelectValue placeholder="Selecionar workspace" />
        </SelectTrigger>
        <SelectContent>
          {userWorkspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id.toString()}>
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="truncate">{workspace.name}</span>
                {workspace.status === 'Inactive' && (
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">(Inativo)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WorkspaceSelector;