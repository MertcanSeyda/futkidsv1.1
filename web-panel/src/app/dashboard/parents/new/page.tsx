'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function NewParentPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
    });

    const createParent = useMutation({
        mutationFn: async (newParent: any) => {
            return api.post('/users', { ...newParent, role: 'parent' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parents'] });
            router.push('/dashboard/parents');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createParent.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/parents">
                    <Button variant="ghost">← Back</Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Add New Parent</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Parent Details</CardTitle>
                        <CardDescription>Enter information about the parent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="jane@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="+90 555 ..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={formData.password} onChange={handleChange} required placeholder="******" />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <Link href="/dashboard/parents">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={createParent.isPending}>
                            {createParent.isPending ? 'Saving...' : 'Save Parent'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
