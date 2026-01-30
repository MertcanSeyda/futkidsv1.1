import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
    title: string;
    value: number;
    max?: number;
}

export function StatCard({ title, value, max = 100 }: StatCardProps) {
    const percentage = Math.round((value / max) * 100);

    return (
        <Card>
            <CardHeader className="uppercase tracking-wide text-xs font-semibold text-gray-500 pb-2">
                {title}
            </CardHeader>
            <CardContent>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">{value}</span>
                    <span className="text-sm text-gray-400 mb-1">/{max}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 mt-3 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
