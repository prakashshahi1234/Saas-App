'use client';

import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, Clock, Target, BarChart3, PieChart as PieChartIcon, Activity, CheckCircle
} from 'lucide-react';
import { projectStore } from '@/models/Project';
import { useAuth } from '@/components/providers/AuthProvider';

// Color scheme for charts
const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6'
};

const STATUS_COLORS = {
  planning: COLORS.primary,
  'in-progress': COLORS.warning,
  completed: COLORS.secondary,
  'on-hold': COLORS.purple,
  cancelled: COLORS.danger
};

function AnalyticsPage() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      projectStore.fetchProjects();
      projectStore.fetchProjectStats();
    }
  }, [user?.uid]);

  useEffect(() => {
    if (projectStore.projectsList.length > 0) {
      generateAnalyticsData();
    }
  }, [projectStore.projectsList]);

  const generateAnalyticsData = () => {
    const projects = projectStore.projectsList;
    
    // Status distribution
    const statusData = [
      { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: STATUS_COLORS.planning },
      { name: 'In Progress', value: projects.filter(p => p.status === 'in-progress').length, color: STATUS_COLORS['in-progress'] },
      { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: STATUS_COLORS.completed },
      { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: STATUS_COLORS['on-hold'] },
      { name: 'Cancelled', value: projects.filter(p => p.status === 'cancelled').length, color: STATUS_COLORS.cancelled }
    ].filter(item => item.value > 0);

    // Priority distribution
    const priorityData = [
      { name: 'Low', value: projects.filter(p => p.priority === 'low').length },
      { name: 'Medium', value: projects.filter(p => p.priority === 'medium').length },
      { name: 'High', value: projects.filter(p => p.priority === 'high').length },
      { name: 'Urgent', value: projects.filter(p => p.priority === 'urgent').length }
    ].filter(item => item.value > 0);

    // Progress distribution
    const progressData = [
      { name: '0-25%', value: projects.filter(p => p.progress >= 0 && p.progress <= 25).length },
      { name: '26-50%', value: projects.filter(p => p.progress >= 26 && p.progress <= 50).length },
      { name: '51-75%', value: projects.filter(p => p.progress >= 51 && p.progress <= 75).length },
      { name: '76-100%', value: projects.filter(p => p.progress >= 76 && p.progress <= 100).length }
    ].filter(item => item.value > 0);

    // Monthly trend (sample data)
    const monthlyData = [
      { month: 'Jan', created: 5, completed: 3 },
      { month: 'Feb', created: 8, completed: 5 },
      { month: 'Mar', created: 12, completed: 8 },
      { month: 'Apr', created: 15, completed: 12 },
      { month: 'May', created: 10, completed: 15 },
      { month: 'Jun', created: 18, completed: 10 }
    ];

    // Performance metrics
    const completionRate = projects.length > 0 ? (projects.filter(p => p.status === 'completed').length / projects.length) * 100 : 0;
    const averageProgress = projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0;
    const overdueProjects = projects.filter(p => p.isOverdue).length;

    setAnalyticsData({
      statusData,
      priorityData,
      progressData,
      monthlyData,
      metrics: {
        completionRate,
        averageProgress,
        overdueProjects,
        totalProjects: projects.length
      }
    });
  };

  if (projectStore.loading && projectStore.projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your project performance</p>
        </div>
      </div>

      {/* Key Metrics */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.metrics.totalProjects}</div>
              <p className="text-xs text-muted-foreground">Active projects in system</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.metrics.completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Projects completed successfully</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.metrics.averageProgress.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Across all active projects</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Projects</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analyticsData.metrics.overdueProjects}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Grid */}
      {analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Project Status Distribution
              </CardTitle>
              <CardDescription>Current status breakdown of all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Priority Distribution
              </CardTitle>
              <CardDescription>Project priority levels breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Progress Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Progress Distribution
              </CardTitle>
              <CardDescription>Projects grouped by completion percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Project Trend
              </CardTitle>
              <CardDescription>Project creation vs completion over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="created" stroke={COLORS.primary} strokeWidth={2} name="Created" />
                  <Line type="monotone" dataKey="completed" stroke={COLORS.secondary} strokeWidth={2} name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Project Performance Overview</CardTitle>
          <CardDescription>Detailed view of all projects with key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectStore.projectsList.map((project) => (
              <div key={project._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex-1">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      project.status === 'planning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      project.status === 'on-hold' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {project.status.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      project.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {project.priority}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{project.progress}%</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  {project.isOverdue && (
                    <span className="text-xs text-red-600 font-medium">Overdue</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default observer(AnalyticsPage); 