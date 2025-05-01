// src/components/journal/JournalsListView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { journalService } from '@/services/journal';
import { useToast } from "@/components/ui/use-toast"

const DEFAULT_JOURNAL_TYPES = [
    { id: 'daily', name: 'Daily Journal', slug: 'daily', entry_count: 0 },
    { id: 'gratitude', name: 'Gratitude Journal', slug: 'gratitude', entry_count: 0 },
    { id: 'reflection', name: 'Reflection Journal', slug: 'reflection', entry_count: 0 },
];

export default function JournalsListView({ showDefaultTypes = false }) {
    const { toast } = useToast()
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadJournals = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await journalService.getJournals();

                // If API call succeeds, merge with default types
                if (showDefaultTypes) {
                    const existingSlugs = (response || []).map(j => j.slug);
                    const defaultsToAdd = DEFAULT_JOURNAL_TYPES.filter(
                        dt => !existingSlugs.includes(dt.slug)
                    );
                    setJournals([...(response || []), ...defaultsToAdd]);
                } else {
                    setJournals(response || []);
                }
            } catch (error) {
                console.error('Failed to load journals:', error);
                setError(error.message);

                // Always show default types on error if showDefaultTypes is true
                if (showDefaultTypes) {
                    setJournals(DEFAULT_JOURNAL_TYPES);
                    toast({
                        title: "Using default journals",
                        description: "Couldn't load custom journals. Showing default types instead.",
                        variant: "default"
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        loadJournals();
    }, [showDefaultTypes]); // Removed toast from dependencies to prevent re-runs

    if (loading) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex justify-center items-center h-32">
                    <span className="text-muted-foreground">Loading journals...</span>
                </div>
            </div>
        );
    }

    // Only show error state if we're not showing default types
    if (error && !showDefaultTypes) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex flex-col items-center gap-4 h-32">
                    <p className="text-destructive">Unable to load journals</p>
                </div>
            </div>
        );
    }

    // If we have no journals and no error, show empty state
    if (!journals.length) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex flex-col items-center gap-4 h-32">
                    <p className="text-muted-foreground">No journals available</p>
                </div>
            </div>
        );
    }

    const handleAddJournal = () => {
        toast({
            title: "Coming Soon",
            description: "This feature is under development."
        });
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Button className="p-1 bordered"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddJournal}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                        </Button>
                        <h1 className="text-2xl font-bold">Journals</h1>
                    </div>
                    <Button onClick={() => navigate('/journal/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Write New Entry
                    </Button>
                </div>

                <div className="grid gap-4">
                    {journals.map(journal => (
                        <Card
                            key={journal.id}
                            className="hover:border-primary cursor-pointer transition-colors"
                            onClick={() => navigate(`/journal/${journal.slug}`)}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>{journal.name}</CardTitle>
                                    <span className="text-sm text-muted-foreground">
                                        {journal.entry_count} {journal.entry_count === 1 ? 'entry' : 'entries'}
                                    </span>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}