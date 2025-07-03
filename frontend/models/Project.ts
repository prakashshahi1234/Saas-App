import { types, flow, Instance, SnapshotIn, SnapshotOut, cast } from 'mobx-state-tree';
import apiClient, { API_ENDPOINTS, ApiResponse, NestedApiResponse } from '../lib/api/config';

// Project Status and Priority types
export const ProjectStatus = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
  CANCELLED: 'cancelled',
} as const;

export const ProjectPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Project interface
export interface IProject {
  _id: string;
  title: string;
  description: string;
  status: typeof ProjectStatus[keyof typeof ProjectStatus];
  priority: typeof ProjectPriority[keyof typeof ProjectPriority];
  userId: string;
  startDate: string;
  endDate: string;
  progress: number;
  tags: string[];
  budget?: number;
  teamMembers: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  duration?: number;
  daysRemaining?: number;
}

// Project Stats interface
export interface IProjectStats {
  total: number;
  planning: number;
  inProgress: number;
  completed: number;
  onHold: number;
  cancelled: number;
}

// Project Model
export const ProjectModel = types
  .model('Project', {
    _id: types.identifier,
    title: types.string,
    description: types.string,
    status: types.enumeration(Object.values(ProjectStatus)),
    priority: types.enumeration(Object.values(ProjectPriority)),
    userId: types.string,
    startDate: types.string,
    endDate: types.string,
    progress: types.number,
    tags: types.array(types.string),
    budget: types.maybe(types.number),
    teamMembers: types.array(types.string),
    notes: types.maybe(types.string),
    createdAt: types.string,
    updatedAt: types.string,
    duration: types.maybe(types.number),
    daysRemaining: types.maybe(types.number),
  })
  .views((self) => ({
    get isOverdue() {
      if (!self.daysRemaining) return false;
      return self.daysRemaining < 0;
    },
    get isCompleted() {
      return self.status === ProjectStatus.COMPLETED;
    },
    get isInProgress() {
      return self.status === ProjectStatus.IN_PROGRESS;
    },
    get progressPercentage() {
      return `${self.progress}%`;
    },
    get formattedStartDate() {
      return new Date(self.startDate).toLocaleDateString();
    },
    get formattedEndDate() {
      return new Date(self.endDate).toLocaleDateString();
    },
  }))
  .actions((self) => ({
    updateProgress(progress: number) {
      self.progress = Math.max(0, Math.min(100, progress));
    },
    updateStatus(status: typeof ProjectStatus[keyof typeof ProjectStatus]) {
      self.status = status;
    },
    updatePriority(priority: typeof ProjectPriority[keyof typeof ProjectPriority]) {
      self.priority = priority;
    },
    addTag(tag: string) {
      if (!self.tags.includes(tag)) {
        self.tags.push(tag);
      }
    },
    removeTag(tag: string) {
      const index = self.tags.indexOf(tag);
      if (index > -1) {
        self.tags.splice(index, 1);
      }
    },
    addTeamMember(member: string) {
      if (!self.teamMembers.includes(member)) {
        self.teamMembers.push(member);
      }
    },
    removeTeamMember(member: string) {
      const index = self.teamMembers.indexOf(member);
      if (index > -1) {
        self.teamMembers.splice(index, 1);
      }
    },
  }));

// Project Store
 const ProjectStore = types
  .model('ProjectStore', {
    projects: types.array(ProjectModel),
    stats: types.maybe(
      types.model({
        total: types.number,
        planning: types.number,
        inProgress: types.number,
        completed: types.number,
        onHold: types.number,
        cancelled: types.number,
      })
    ),
    loading: types.boolean,
    error: types.maybe(types.string),
    searchQuery: types.optional(types.string, ''),
    selectedStatus: types.optional(types.string, ''),
  })

  .views((self) => ({
    get projectsList() {
      return Array.from(self.projects);
    },
  }))
  .views((self) => ({
    get projectsByStatus() {
      return (status: typeof ProjectStatus[keyof typeof ProjectStatus]) =>
        self.projectsList.filter((project: any) => project.status === status);
    },
  })) 
  .views((self) => ({
   
    get filteredProjects() {
      let filtered = self.projectsList;
      
      if (self.selectedStatus) {
        filtered = filtered.filter((project: any) => project.status === self.selectedStatus);
      }
      
      if (self.searchQuery) {
        const query = self.searchQuery.toLowerCase();
        filtered = filtered.filter((project: any) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.tags.some((tag: string) => tag.toLowerCase().includes(query))
        );
      }
      
      return filtered;
    },
    get projectById() {
      return (id: string) => self.projects.find((project: any) => project._id === id);
    },
    get totalProjects() {
      return self.projects.length;
    },
    get completedProjects() {
      // @ts-ignore
      return self.projectsByStatus()(ProjectStatus.COMPLETED).length;
    },
    get inProgressProjects() {
      // @ts-ignore
      return self.projectsByStatus()(ProjectStatus.IN_PROGRESS).length;
    },
  }))
  .actions((self) => ({
    setLoading(loading: boolean) {
      self.loading = loading;
    },
    setError(error: string | null) {
      self.error = error || undefined;
    },
    setSearchQuery(query: string) {
      self.searchQuery = query;
    },
    setSelectedStatus(status: string) {
      self.selectedStatus = status;
    },
    clearFilters() {
      self.searchQuery = '';
      self.selectedStatus = '';
    },
    addProject(project: IProject) {
      // Check if project already exists
      const existingIndex = self.projects.findIndex(p => p._id === project._id);
      if (existingIndex >= 0) {
        // Update existing project
        self.projects.splice(existingIndex, 1, cast(project));
      } else {
        // Add new project
        self.projects.push(cast(project));
      }
    },
    updateProject(projectId: string, updates: Partial<IProject>) {
      const project = self.projects.find(p => p._id === projectId);
      if (project) {
        Object.assign(project, updates);
      }
    },
    removeProject(projectId: string) {
      const index = self.projects.findIndex(p => p._id === projectId);
      if (index >= 0) {
        self.projects.splice(index, 1);
      }
    },
    setStats(stats: IProjectStats) {
      self.stats = stats;
    },
    clearProjects() {
      self.projects.clear();
    },
  }))
  .actions((self) => ({
    // Flow functions for API calls
        fetchProjects: flow(function* () {
      // Prevent multiple simultaneous requests
      if (self.loading) {
        console.log('⏸️ Already loading, skipping fetch');
        return;
      }
      
      try {
        console.log('🚀 Starting fetchProjects...');
        self.setLoading(true);
        self.setError(null);
        
        const response = yield apiClient.get(API_ENDPOINTS.PROJECTS.BASE);
        console.log('🔍 Full Axios Response:', response);
        console.log('🔍 Response.data:', response.data);
        console.log('🔍 Response.data.success:', response.data.success);
        console.log('🔍 Response.data.data:', response.data.data);
        
        if (response.data.success && response.data.data) {
          self.clearProjects();
          response.data.data.forEach((project: IProject) => self.addProject(project));
          console.log('✅ Projects added:', response.data.data.length);
        } else {
          console.log('❌ No data found in response or request failed');
        }
        
        console.log('🔍 Projects in store after fetch:', self.projects.length);
      } catch (error) {
        self.setError(error instanceof Error ? error.message : 'Failed to fetch projects');
        console.error('Error fetching projects:', error);
      } finally {
        self.setLoading(false);
        console.log('✅ fetchProjects completed');
      }
    }),

    fetchProjectById: flow(function* (projectId: string) {
      try {
        self.setLoading(true);
        self.setError(null);
        
        const response = yield apiClient.get(API_ENDPOINTS.PROJECTS.BY_ID(projectId));
        
        if (response.data.success && response.data.data) {
          self.addProject(response.data.data);
        }
      } catch (error) {
        self.setError(error instanceof Error ? error.message : 'Failed to fetch project');
        console.error('Error fetching project:', error);
      } finally {
        self.setLoading(false);
      }
    }),

    createProject: flow(function* (projectData: Omit<IProject, '_id' | 'createdAt' | 'updatedAt'>) {
      try {
        self.setLoading(true);
        self.setError(null);
        
        const response = yield apiClient.post(API_ENDPOINTS.PROJECTS.BASE, projectData);
        
        if (response.data.success && response.data.data) {
          self.addProject(response.data.data);
          // Fetch updated stats after creating a project
          try {
            const statsResponse = yield apiClient.get(API_ENDPOINTS.PROJECTS.STATS);
            if (statsResponse.data.success && statsResponse.data.data) {
              self.setStats(statsResponse.data.data);
            }
          } catch (statsError) {
            console.error('Error fetching stats after project creation:', statsError);
          }
          return response.data.data;
        }
      } catch (error) {
        self.setError(error instanceof Error ? error.message : 'Failed to create project');
        console.error('Error creating project:', error);
        throw error;
      } finally {
        self.setLoading(false);
      }
    }),

    updateProjectApi: flow(function* (projectId: string, updates: Partial<IProject>) {
      try {
        self.setLoading(true);
        self.setError(null);
        
        const response = yield apiClient.put(API_ENDPOINTS.PROJECTS.BY_ID(projectId), updates);
        
        if (response.data.success && response.data.data) {
          self.updateProject(projectId, response.data.data);
          // Fetch updated stats after updating a project
          try {
            const statsResponse = yield apiClient.get(API_ENDPOINTS.PROJECTS.STATS);
            if (statsResponse.data.success && statsResponse.data.data) {
              self.setStats(statsResponse.data.data);
            }
          } catch (statsError) {
            console.error('Error fetching stats after project update:', statsError);
          }
          return response.data.data;
        }
      } catch (error) {
        self.setError(error instanceof Error ? error.message : 'Failed to update project');
        console.error('Error updating project:', error);
        throw error;
      } finally {
        self.setLoading(false);
      }
    }),

    updateProjectProgress: flow(function* (projectId: string, progress: number) {
      try {
        self.setLoading(true);
        self.setError(null);
        
        const response = yield apiClient.patch(API_ENDPOINTS.PROJECTS.PROGRESS(projectId), { progress });
        
        if (response.data.success && response.data.data) {
          self.updateProject(projectId, response.data.data);
          return response.data.data;
        }
      } catch (error) {
        self.setError(error instanceof Error ? error.message : 'Failed to update project progress');
        console.error('Error updating project progress:', error);
        throw error;
      } finally {
        self.setLoading(false);
      }
    }),

    deleteProject: flow(function* (projectId: string) {
      try {
        self.setLoading(true);
        self.setError(null);
        
        yield apiClient.delete(API_ENDPOINTS.PROJECTS.BY_ID(projectId));
        
        self.removeProject(projectId);
        // Fetch updated stats after deleting a project
        try {
          const statsResponse = yield apiClient.get(API_ENDPOINTS.PROJECTS.STATS);
          if (statsResponse.data.success && statsResponse.data.data) {
            self.setStats(statsResponse.data.data);
          }
        } catch (statsError) {
          console.error('Error fetching stats after project deletion:', statsError);
        }
      } catch (error) {
        self.setError(error instanceof Error ? error.message : 'Failed to delete project');
        console.error('Error deleting project:', error);
        throw error;
      } finally {
        self.setLoading(false);
      }
    }),

    fetchProjectsByStatus: flow(function* (status: typeof ProjectStatus[keyof typeof ProjectStatus]) {
      try {
        self.setLoading(true);
        self.setError(null);
        
        const response = yield apiClient.get(API_ENDPOINTS.PROJECTS.BY_STATUS(status));
        
        if (response.data.success && response.data.data) {
          // Update only projects with this status
          response.data.data.forEach((project: IProject) => self.addProject(project));
        }
      } catch (error) {
        self.setError(error instanceof Error ? error.message : 'Failed to fetch projects by status');
        console.error('Error fetching projects by status:', error);
      } finally {
        self.setLoading(false);
      }
    }),

    searchProjects: flow(function* (query: string) {
      try {
        self.setLoading(true);
        self.setError(null);
        
        const response = yield apiClient.get(API_ENDPOINTS.PROJECTS.SEARCH, {
          params: { q: query }
        });
        
        if (response.data.success && response.data.data) {
          // Clear current projects and add search results
          self.clearProjects();
          response.data.data.forEach((project: IProject) => self.addProject(project));
        }
      } catch (error) {
        self.setError(error instanceof Error ? error.message : 'Failed to search projects');
        console.error('Error searching projects:', error);
      } finally {
        self.setLoading(false);
      }
    }),

    fetchProjectStats: flow(function* () {
      try {
        console.log('📊 Starting fetchProjectStats...');
        // Note: Not checking loading here as stats can be fetched independently
        
        const response = yield apiClient.get(API_ENDPOINTS.PROJECTS.STATS);
        console.log('📊 Stats response:', response.data);
        
        if (response.data.success && response.data.data) {
          self.setStats(response.data.data);
          console.log('✅ Stats updated:', response.data.data);
        }
      } catch (error) {
        self.setError(error instanceof Error ? error.message : 'Failed to fetch project stats');
        console.error('Error fetching project stats:', error);
      } finally {
        console.log('✅ fetchProjectStats completed');
      }
    }),
  }));

// Type exports
export type Project = Instance<typeof ProjectModel>;
export type ProjectSnapshotIn = SnapshotIn<typeof ProjectModel>;
export type ProjectSnapshotOut = SnapshotOut<typeof ProjectModel>;
export type ProjectStoreType = Instance<typeof ProjectStore>;

// Create a store instance
export const projectStore = ProjectStore.create({
  projects: [],
  loading: false,
  error: undefined,
  searchQuery: '',
  selectedStatus: '',
}); 