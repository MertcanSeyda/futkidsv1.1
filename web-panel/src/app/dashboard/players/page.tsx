'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function PlayersPage() {
    const { data: players, isLoading, error } = useQuery({
        queryKey: ['players'],
        queryFn: async () => {
            const response = await api.get('/users?role=player');
            return response.data;
        },
    });

    if (isLoading) return <div>Loading players...</div>;
    if (error) return <div>Error loading players</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Players</h1>
                <Link href="/dashboard/players/new">
                    <Button>Add Player</Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {players?.map((player: any) => (
                    <Card key={player._id}>
                        <CardHeader>
                            <CardTitle>{player.fullName}</CardTitle>
                            <CardDescription>
                                Position: {player.playerProfile?.position || 'N/A'} <br />
                                Team: {player.academy?.name || 'N/A'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/dashboard/players/${player._id}`}>
                                <Button variant="outline" className="w-full">View Profile</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {players?.length === 0 && (
                <div className="text-center text-gray-500 p-8">No players found.</div>
            )}
        </div>
    );
}
