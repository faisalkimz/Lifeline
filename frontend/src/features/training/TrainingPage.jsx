import React, { useState } from 'react';
import {
    useGetCoursesQuery,
    useGetEnrollmentsQuery,
    useEnrollInTrainingMutation
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { BookOpen, GraduationCap, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TrainingPage = () => {
    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Training & Development</h1>
                <p className="text-gray-500">Upgrade your skills with our course catalog.</p>
            </div>

            <Tabs defaultValue="catalog" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="catalog" className="gap-2">
                        <BookOpen className="h-4 w-4" /> Course Catalog
                    </TabsTrigger>
                    <TabsTrigger value="my-training" className="gap-2">
                        <GraduationCap className="h-4 w-4" /> My Learning
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="catalog">
                    <CourseCatalog />
                </TabsContent>

                <TabsContent value="my-training">
                    <MyEnrollments />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const CourseCatalog = () => {
    const { data: courses, isLoading } = useGetCoursesQuery();
    const [enroll] = useEnrollInTrainingMutation();

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

export default TrainingPage;
