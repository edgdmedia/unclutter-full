
// src/components/journal/SingleJournalView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { journalService } from '@/services/journal';
import EntryList from './EntryList';

export default function SingleJournalView() {
    const { journalSlug } = useParams();
    const navigate = useNavigate();
    const [journal, setJournal] = useState(null);

    useEffect(() => {
        const loadJournal = async () => {
            try {
                const response = await journalService.getJournal(journalSlug);
                setJournal(response);
            } catch (error) {
                console.error('Failed to load journal:', error);
            }
        };

        loadJournal();
    }, [journalSlug]);

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/journal')}
                    >
                        ←
                    </Button>
                    <h1 className="text-2xl font-bold">{journal?.name || 'Loading...'}</h1>
                </div>
                <Button onClick={() => navigate(`/journal/${journalSlug}/new`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                </Button>
            </div>

            <EntryList journalSlug={journalSlug} />
        </div>
    );
}