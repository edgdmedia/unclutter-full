// src/components/journal/JournalList.jsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./../ui/card";
import { Badge } from "./../ui/badge";
import { Button } from "./../ui/button";
import { formatDistanceToNow } from 'date-fns';
import { journalService } from '../../services/journal';

export default function JournalList({ journalSlug }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadEntries = async () => {
        try {
            const response = await journalService.getEntries(journalSlug, { page });
            setEntries(page === 1 ? response.entries : [...entries, ...response.entries]);
            setHasMore(page < response.pages);
        } catch (error) {
            console.error('Failed to load entries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEntries();
    }, [journalSlug, page]);

    return (
        <div className="space-y-4">
            {entries.map((entry) => (
                <Card key={entry.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                                {entry.title || 'Untitled Entry'}
                            </CardTitle>
                            <div className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(entry.created_at))} ago
                            </div>
                        </div>
                        {entry.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {entry.tags.map(tag => (
                                    <Badge key={tag.slug} variant="secondary">
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="line-clamp-3 text-gray-600">{entry.content}</p>
                    </CardContent>
                </Card>
            ))}

            {hasMore && (
                <div className="text-center">
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                    >
                        Load More
                    </Button>
                </div>
            )}
        </div>
    );
}