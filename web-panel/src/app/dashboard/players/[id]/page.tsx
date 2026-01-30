'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function EditPlayerPage({ params }: { params: { id: string } }) {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/players">
                    <Button variant="ghost">← Back</Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Edit Player</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Player Details</CardTitle>
                    <CardDescription>Update information for player ID: {params.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue="John" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue="Doe" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input id="dob" type="date" defaultValue="2014-05-15" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="team">Team / Group</Label>
                            <Input id="team" defaultValue="U11 A" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button variant="outline">Discard Changes</Button>
                    <Button>Update Player</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Performance Stats</CardTitle>
                    <CardDescription>Manage latest statistics.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">Stats editor form would go here (Speed, Shooting, etc).</p>
                </CardContent>
                <CardFooter>
                    <Button variant="secondary" className="w-full">Open Stats Editor</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
