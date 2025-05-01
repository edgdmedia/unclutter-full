// src/components/journal/JournalEntryView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalService } from '@/services/journal';

export default function JournalEntryView() {
    const { journalSlug, entrySlug } = useParams();
    const navigate = useNavigate();
    const [entry, setEntry] = useState(null);
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const loadEntry = async () => {
            try {
                const response = await journalService.getEntry(journalSlug, entrySlug);
                setEntry(response);
                setContent(response.content);
            } catch (error) {
                console.error('Failed to load entry:', error);
            }
        };

        loadEntry();
    }, [journalSlug, entrySlug]);

    const handleSave = async () => {
        try {
            await journalService.updateEntry(journalSlug, entrySlug, {
                content,
                title: entry.title
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update entry:', error);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/journal/${journalSlug}`)}
                    >
                        ←
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {entry?.title || 'Entry'}
                    </h1>
                </div>

                {isEditing ? (
                    <Button onClick={handleSave}>Save Changes</Button>
                ) : (
                    <Button variant="ghost" onClick={() => setIsEditing(true)}>
                        Edit
                    </Button>
                )}
            </div>

            <Card className="min-h-[calc(100vh-12rem)] p-6">
                {isEditing ? (
                    <textarea
                        className="w-full h-full min-h-[calc(100vh-16rem)] resize-none border-none focus:outline-none bg-transparent"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                ) : (
                    <div className="whitespace-pre-wrap">
                        {content}
                    </div>
                )}
            </Card>
        </div>
    );
}