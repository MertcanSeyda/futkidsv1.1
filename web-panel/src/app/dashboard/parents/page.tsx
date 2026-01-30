'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function ParentsPage() {
    const { data: parents, isLoading, error } = useQuery({
        queryKey: ['parents'],
        queryFn: async () => {
            const response = await api.get('/users?role=parent');
            return response.data;
        },
    });

    if (isLoading) return <div>Loading parents...</div>;
    if (error) return <div>Error loading parents</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Parents</h1>
                <Link href="/dashboard/parents/new">
                    <Button>Add Parent</Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {parents?.map((parent: any) => (
                    <Card key={parent._id}>
                        <CardHeader>
                            <CardTitle>{parent.fullName}</CardTitle>
                            <CardDescription>{parent.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-500">
                                Phone: {parent.phone || 'N/A'}
                            </div>
                            <div className="mt-4">
                                <Link href={`/dashboard/parents/${parent._id}`}>
                                    <Button variant="outline" className="w-full">View Details</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {parents?.length === 0 && (
                <div className="text-center text-gray-500 p-8">No parents found.</div>
            )}
        </div>
    );
}
