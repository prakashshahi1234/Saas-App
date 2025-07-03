import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { observer } from 'mobx-react-lite';
import { ProjectStoreType, Project } from '@/models/Project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { createUserBalance } from '@/models/UserBalance';
import { toast } from 'sonner';
import Link from 'next/link';

const projectSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(1000),
  status: z.enum(['planning', 'in-progress', 'completed', 'on-hold', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  startDate: z.string(),
  endDate: z.string(),
  progress: z.number().min(0).max(100),
  tags: z.string().optional(), // comma separated
  budget: z.number().min(0).optional(),
  teamMembers: z.string().optional(), // comma separated
  notes: z.string().max(2000).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

type Props = {
  projectId: string | null;
  onClose: () => void;
  projectStore: ProjectStoreType;
};

export const ProjectForm = observer(({ projectId, onClose, projectStore }: Props) => {
  const isEdit = Boolean(projectId);
  const project = isEdit ? projectStore.projectById(projectId!) : undefined;
  const [balanceChecked, setBalanceChecked] = useState(false);
  const [hasInsufficientBalance, setHasInsufficientBalance] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState<any>(null);
  const userBalance = createUserBalance();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: isEdit && project ? {
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
      progress: project.progress,
      tags: project.tags.join(', '),
      budget: project.budget ?? undefined,
      teamMembers: project.teamMembers.join(', '),
      notes: project.notes ?? '',
    } : {
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      progress: 0,
      tags: '',
      budget: undefined,
      teamMembers: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isEdit && project) {
      form.reset({
        title: project.title,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate.split('T')[0],
        progress: project.progress,
        tags: project.tags.join(', '),
        budget: project.budget ?? undefined,
        teamMembers: project.teamMembers.join(', '),
        notes: project.notes ?? '',
      });
    }
  }, [isEdit, project, form]);

  // Check balance for new projects
  useEffect(() => {
    if (!isEdit && !balanceChecked) {
      checkBalance();
    }
  }, [isEdit, balanceChecked]);

  const checkBalance = async () => {
    try {
      const eligibility = await userBalance.checkProjectEligibility();
      setBalanceInfo(eligibility);
      setHasInsufficientBalance(!eligibility.canCreateProject);
      setBalanceChecked(true);
    } catch (error) {
      console.error('Failed to check balance:', error);
      toast.error('Failed to check balance');
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    // Check balance again before creating new project
    if (!isEdit && hasInsufficientBalance) {
      toast.error('Insufficient balance to create project');
      return;
    }

    const payload = {
      ...data,
      progress: Number(data.progress),
      budget: data.budget ? Number(data.budget) : undefined,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      teamMembers: data.teamMembers ? data.teamMembers.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    try {
      if (isEdit && projectId) {
        await projectStore.updateProjectApi(projectId, payload);
        toast.success('Project updated successfully!');
      } else {
        await projectStore.createProject(payload as any);
        toast.success('Project created successfully! ₹100 has been deducted from your balance.');
      }
      onClose();
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 402) {
        toast.error('Insufficient balance to create project. Please add balance to continue.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save project');
      }
      console.error('Project save error', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white z-10"
          onClick={onClose}
        >
          ×
        </button>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Project' : 'New Project'}</h2>
          
          {/* Balance Warning for New Projects */}
          {!isEdit && balanceChecked && (
            <div className={`mb-4 p-4 rounded-lg ${hasInsufficientBalance ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              {hasInsufficientBalance ? (
                <div className="text-red-800">
                  <p className="font-semibold">Insufficient Balance</p>
                  <p className="text-sm">
                    Current balance: ₹{balanceInfo?.currentBalance || 0}<br />
                    Required: ₹{balanceInfo?.requiredAmount || 100}<br />
                    Shortfall: ₹{balanceInfo?.shortfall || 0}
                  </p>
                  <div className="mt-2">
                    <Link href="/dashboard/payments">
                      <Button variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-100">
                        Add Balance
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-green-800">
                  <p className="font-semibold">✓ Balance Sufficient</p>
                  <p className="text-sm">
                    Current balance: ₹{balanceInfo?.currentBalance || 0}<br />
                    Project creation fee: ₹100
                  </p>
                </div>
              )}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Project description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={100} 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="Comma separated (e.g. web, mobile)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamMembers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Members</FormLabel>
                    <FormControl>
                      <Input placeholder="Comma separated emails or names" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={!isEdit && hasInsufficientBalance}
                  className={!isEdit && hasInsufficientBalance ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {isEdit ? 'Update' : 'Create'} Project
                  {!isEdit && ' (₹100)'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}); 