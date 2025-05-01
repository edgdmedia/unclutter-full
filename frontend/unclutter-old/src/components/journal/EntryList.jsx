
// src/components/journal/EntryList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { journalService } from '@/services/journal';

export default function EntryList({ journalSlug }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadEntries = async () => {
            try {
                const response = await journalService.getEntries(journalSlug);
                setEntries(response.entries);
            } catch (error) {
                console.error('Failed to load entries:', error);
            } finally {
                setLoading(false);
            }
        };

        loadEntries();
    }, [journalSlug]);

    if (loading) {
        return <div>Loading entries...</div>;
    }

    return (
        <div className="space-y-4">
            {entries.map(entry => (
                <Card
                    key={entry.id}
                    className="hover:border-primary cursor-pointer transition-colors"
                    onClick={() => navigate(`/journal/${journalSlug}/entries/${entry.slug}`)}
                >
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">
                                {entry.title || 'Untitled Entry'}
                            </CardTitle>
                            <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(entry.created_at))} ago
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="line-clamp-2 text-muted-foreground">
                            {entry.content}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}