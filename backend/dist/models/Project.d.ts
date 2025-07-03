import mongoose, { Document } from 'mongoose';
export interface IProject extends Document {
    title: string;
    description: string;
    status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    userId: string;
    startDate: Date;
    endDate: Date;
    progress: number;
    tags: string[];
    budget?: number;
    teamMembers: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    duration: number;
    daysRemaining: number;
    updateProgress(progress: number): Promise<IProject>;
}
declare const Project: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}> & IProject & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Project;
//# sourceMappingURL=Project.d.ts.map