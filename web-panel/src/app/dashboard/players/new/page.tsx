'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function NewPlayerPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        position: '',
        parentId: '',
        dob: '',
    });

    const { data: parents } = useQuery({
        queryKey: ['parents'],
        queryFn: async () => {
            const response = await api.get('/users?role=parent');
            return response.data;
        },
    });

    const createPlayer = useMutation({
        mutationFn: async (data: typeof formData) => {
            const payload = {
                fullName: `${data.firstName} ${data.lastName}`,
                email: data.email,
                password: data.password,
                role: 'player',
                playerProfile: {
                    position: data.position,
                    parent: data.parentId || undefined,
                },
                // Note: Academy ID should ideally be handled by the backend or context
            };
            return api.post('/users', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['players'] });
            router.push('/dashboard/players');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPlayer.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/players">
                    <Button variant="ghost">← Back</Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Add New Player</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Player Details</CardTitle>
                        <CardDescription>Enter basic information about the player.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="player@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={formData.password} onChange={handleChange} required placeholder="******" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" type="date" value={formData.dob} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="position">Position</Label>
                                <Input id="position" value={formData.position} onChange={handleChange} placeholder="Forward" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parentId">Parent (Optional)</Label>
                            <select
                                id="parentId"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.parentId}
                                onChange={handleChange}
                            >
                                <option value="">Select a Parent</option>
                                {parents?.map((parent: any) => (
                                    <option key={parent._id} value={parent._id}>
                                        {parent.fullName} ({parent.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <Link href="/dashboard/players">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={createPlayer.isPending}>
                            {createPlayer.isPending ? 'Saving...' : 'Save Player'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
