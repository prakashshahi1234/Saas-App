import { observer } from 'mobx-react-lite';
import { ProjectStoreType } from '@/models/Project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Props = {
  projectId: string;
  onClose: () => void;
  projectStore: ProjectStoreType;
};

export const ProjectDetails = observer(({ projectId, onClose, projectStore }: Props) => {
  const project = projectStore.projectById(projectId);
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Project Details</h2>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Title:</span> {project.title}
          </div>
          <div>
            <span className="font-semibold">Description:</span> {project.description}
          </div>
          <div className="flex gap-2">
            <Badge>{project.status.replace('-', ' ')}</Badge>
            <Badge>{project.priority}</Badge>
          </div>
          <div>
            <span className="font-semibold">Progress:</span> {project.progress}%
          </div>
          <div>
            <span className="font-semibold">Start Date:</span> {project.formattedStartDate}
          </div>
          <div>
            <span className="font-semibold">End Date:</span> {project.formattedEndDate}
          </div>
          <div>
            <span className="font-semibold">Budget:</span> {project.budget ?? 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Team Members:</span> {project.teamMembers.length > 0 ? project.teamMembers.join(', ') : 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Tags:</span> {project.tags.length > 0 ? project.tags.join(', ') : 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Notes:</span> {project.notes || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Created At:</span> {new Date(project.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Updated At:</span> {new Date(project.updatedAt).toLocaleString()}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}); 