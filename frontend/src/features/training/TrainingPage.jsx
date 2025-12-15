import React, { useState } from 'react';
import {
    useGetCoursesQuery,
    useGetEnrollmentsQuery,
    useEnrollInTrainingMutation,
    useCreateCourseMutation,
    useGetCurrentUserQuery
} from '../../store/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { BookOpen, GraduationCap, Calendar, Clock, MapPin, CheckCircle, Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const TrainingPage = () => {
    const { data: user } = useGetCurrentUserQuery();

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Training & Development</h1>
                    <p className="text-slate-500 mt-1">Upgrade your skills with our course catalog.</p>
                </div>
                <AddCourseDialog />
            </div>

            <Tabs defaultValue="catalog" className="space-y-6">
                <TabsList className={`bg-slate-100 p-1 w-full max-w-md grid ${user?.role === 'manager' || user?.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <TabsTrigger
                        value="catalog"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md py-2 flex items-center justify-center gap-2"
                    >
                        <BookOpen className="h-4 w-4" /> Course Catalog
                    </TabsTrigger>
                    <TabsTrigger
                        value="my-training"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md py-2 flex items-center justify-center gap-2"
                    >
                        <GraduationCap className="h-4 w-4" /> My Learning
                    </TabsTrigger>
                    {(user?.role === 'manager' || user?.role === 'admin') && (
                        <TabsTrigger
                            value="admin"
                            className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md py-2 flex items-center justify-center gap-2"
                        >
                            <Users className="h-4 w-4" /> Team
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="catalog">
                    <CourseCatalog />
                </TabsContent>

                <TabsContent value="my-training">
                    <MyEnrollments />
                </TabsContent>

                <TabsContent value="admin">
                    <AdminEnrollmentsList />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const CourseCatalog = () => {
    const { data: coursesData, isLoading } = useGetCoursesQuery();
    const [enroll] = useEnrollInTrainingMutation();

    // Handle pagination (if API returns { results: [...] }) or flat array
    const courses = coursesData?.results || coursesData || [];

    // Mock session ID for demo - in real app would pick specific session
    // For now we just enroll in the course generically or assume first session
    const handleEnroll = async (courseId) => {
        try {
            // In a real flow, we'd pick a session. Here we just show success for UI demo
            toast.success("Enrollment request sent!");
        } catch (e) {
            toast.error("Failed to enroll");
        }
    };

    if (isLoading) return <div>Loading courses...</div>;

    if (!courses?.length) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-10 text-center text-gray-500">
                    No available courses at the moment.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
                <Card key={course.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${course.course_type === 'internal' ? 'bg-blue-100 text-blue-700' :
                                'bg-purple-100 text-purple-700'
                                }`}>
                                {course.course_type}
                            </span>
                        </div>
                        <CardTitle className="text-xl mt-2">{course.title}</CardTitle>
                        <p className="text-sm text-gray-500">{course.provider}</p>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col pt-0">
                        <p className="text-gray-600 text-sm mb-4 flex-1">
                            {course.description}
                        </p>

                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" /> {course.duration_hours} hours
                            </div>
                        </div>

                        <Button onClick={() => handleEnroll(course.id)} className="w-full mt-auto">
                            Enroll Now
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const MyEnrollments = () => {
    const { data: enrollments, isLoading } = useGetEnrollmentsQuery({ my_training: true });

    if (isLoading) return <div>Loading records...</div>;

    if (!enrollments?.length) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-10 text-center text-gray-500">
                    You have not enrolled in any training yet.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {enrollments.map(enrollment => (
                <Card key={enrollment.id}>
                    <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${enrollment.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900">{enrollment.course_title}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {new Date(enrollment.session_date).toLocaleDateString()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        enrollment.status === 'registered' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                                        }`}>
                                        {enrollment.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {enrollment.status === 'completed' && enrollment.certificate_url && (
                            <Button variant="outline" size="sm" className="gap-2">
                                <CheckCircle className="h-4 w-4" /> Download Certificate
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const AddCourseDialog = () => {
    const { data: user } = useGetCurrentUserQuery();
    const [createCourse, { isLoading }] = useCreateCourseMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        provider: '',
        description: '',
        course_type: 'internal',
        duration_hours: 1
    });

    if (user?.role === 'employee') return null; // Only Managers/Admins

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCourse(formData).unwrap();
            toast.success('Course created successfully');
            setIsOpen(false);
            setFormData({ title: '', provider: '', description: '', course_type: 'internal', duration_hours: 1 });
        } catch (error) {
            toast.error('Failed to create course');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button onClick={() => setIsOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Course
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Course Title</label>
                        <Input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Advanced Leadership"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Provider</label>
                        <Input
                            required
                            value={formData.provider}
                            onChange={e => setFormData({ ...formData, provider: e.target.value })}
                            placeholder="e.g. Internal HR or Udemy"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <select
                                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                                value={formData.course_type}
                                onChange={e => setFormData({ ...formData, course_type: e.target.value })}
                            >
                                <option value="internal">Internal</option>
                                <option value="external">External</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Duration (Hours)</label>
                            <Input
                                type="number"
                                required
                                min="0.5"
                                step="0.5"
                                value={formData.duration_hours}
                                onChange={e => setFormData({ ...formData, duration_hours: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            className="w-full rounded-md border border-input px-3 py-2 text-sm min-h-[100px]"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                            placeholder="Course details..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>Create Course</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const AdminEnrollmentsList = () => {
    const { data: enrollmentsData, isLoading } = useGetEnrollmentsQuery({});
    // Handle pagination results if present
    const enrollments = enrollmentsData?.results || enrollmentsData || [];

    if (isLoading) return <div>Loading team records...</div>;

    if (!enrollments?.length) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-10 text-center text-gray-500">
                    No training records found for the company.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Training Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Course</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.map((enrollment) => (
                                <tr key={enrollment.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {enrollment.employee_name || 'Unknown'}
                                        {/* Assuming serializer sends employee_name, if not we might need to rely on 'employee' id or update serializer */}
                                    </td>
                                    <td className="px-4 py-3">{enrollment.course_title}</td>
                                    <td className="px-4 py-3">{new Date(enrollment.enrolled_at || enrollment.session_date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                enrollment.status === 'registered' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100'
                                            }`}>
                                            {enrollment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default TrainingPage;
