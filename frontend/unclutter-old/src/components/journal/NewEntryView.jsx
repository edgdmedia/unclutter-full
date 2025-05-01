
// src/components/journal/NewEntryView.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { journalService } from '@/services/journal';

export default function NewEntryView() {
    const { journalSlug } = useParams();
    const navigate = useNavigate();
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [content, setContent] = useState('');

    const DEFAULT_JOURNALS = [
        { slug: 'reflection', name: 'Daily Reflection' },
        { slug: 'gratitude', name: 'Gratitude' },
        { slug: 'notes', name: 'Notes' }
    ];

    const handleSave = async () => {
        try {
            const entryData = {
                content,
                title: '', // Optional
            };

            const response = await journalService.createEntry(
                journalSlug || selectedJournal.slug,
                entryData
            );

            navigate(`/journal/${journalSlug || selectedJournal.slug}`);
        } catch (error) {
            console.error('Failed to save entry:', error);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                    >
                        ←
                    </Button>

                    {journalSlug ? (
                        <h1 className="text-2xl font-bold">
                            {DEFAULT_JOURNALS.find(j => j.slug === journalSlug)?.name || 'New Entry'}
                        </h1>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="text-2xl font-bold">
                                    {selectedJournal?.name || 'Select Journal'}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {DEFAULT_JOURNALS.map(journal => (
                                    <DropdownMenuItem
                                        key={journal.slug}
                                        onClick={() => setSelectedJournal(journal)}
                                    >
                                        {journal.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <Button
                    onClick={handleSave}
                    disabled={!content.trim() || (!journalSlug && !selectedJournal)}
                >
                    Save Entry
                </Button>
            </div>

            <Card className="min-h-[calc(100vh-12rem)] p-6">
                <textarea
                    className="w-full h-full min-h-[calc(100vh-16rem)] resize-none border-none focus:outline-none bg-transparent"
                    placeholder="Start writing..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </Card>
        </div>
    );
}
