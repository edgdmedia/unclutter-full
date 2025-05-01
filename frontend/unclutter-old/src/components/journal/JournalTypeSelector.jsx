// src/components/journal/JournalTypeSelector.jsx
import { Card, CardContent } from "@/components/ui/card";
import { PenLine, HeartHandshake, Sticky } from "lucide-react";

const journalTypes = [
    {
        id: 'reflection',
        name: 'Reflection',
        description: 'Write about your thoughts and experiences',
        icon: PenLine
    },
    {
        id: 'gratitude',
        name: 'Gratitude',
        description: 'Document what you\'re thankful for',
        icon: HeartHandshake
    },
    {
        id: 'notes',
        name: 'Notes',
        description: 'Quick thoughts and reminders',
        icon: Sticky
    }
];

export default function JournalTypeSelector({ onSelect }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {journalTypes.map((type) => (
                <Card
                    key={type.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => onSelect(type.id)}
                >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <type.icon className="w-12 h-12 mb-4 text-primary" />
                        <h3 className="font-semibold mb-2">{type.name}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// src/components/journal/EntryEditor.jsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Image, Share2, X } from "lucide-react";

export default function EntryEditor({ journalSlug, onSave }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: [],
        currentTag: '',
        isShared: false,
        isAnonymous: false
    });

    const handleAddTag = (e) => {
        e.preventDefault();
        if (formData.currentTag.trim() && !formData.tags.includes(formData.currentTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, prev.currentTag.trim()],
                currentTag: ''
            }));
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSave = async () => {
        if (!formData.content.trim()) return;

        const entryData = {
            title: formData.title.trim() || null,
            content: formData.content,
            tags: formData.tags,
            is_shared: formData.isShared,
            is_anonymous: formData.isAnonymous
        };

        try {
            await onSave(journalSlug, entryData);
            // Clear form after successful save
            setFormData({
                title: '',
                content: '',
                tags: [],
                currentTag: '',
                isShared: false,
                isAnonymous: false
            });
        } catch (error) {
            console.error('Failed to save journal entry:', error);
            // Handle error (show notification, etc.)
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>
                    <Input
                        type="text"
                        placeholder="Entry Title (Optional)"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Start writing..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[300px]"
                />

                {/* Tags Section */}
                <div>
                    <form onSubmit={handleAddTag} className="flex gap-2 mb-2">
                        <Input
                            type="text"
                            placeholder="Add a tag"
                            value={formData.currentTag}
                            onChange={(e) => setFormData(prev => ({ ...prev, currentTag: e.target.value }))}
                        />
                        <Button type="submit">Add</Button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="px-2 py-1">
                                {tag}
                                <X
                                    className="w-3 h-3 ml-1 cursor-pointer"
                                    onClick={() => handleRemoveTag(tag)}
                                />
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setFormData(prev => ({ ...prev, isShared: !prev.isShared }))}
                            className={formData.isShared ? 'bg-primary text-primary-foreground' : ''}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            {formData.isShared ? 'Shared' : 'Share'}
                        </Button>
                        {formData.isShared && (
                            <Button
                                variant="outline"
                                onClick={() => setFormData(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                                className={formData.isAnonymous ? 'bg-primary text-primary-foreground' : ''}
                            >
                                Anonymous
                            </Button>
                        )}
                    </div>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Entry
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// src/components/journal/EntryList.jsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { journalService } from '../../services/journal';

export default function EntryList({ journalSlug }) {
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

    if (loading && page === 1) {
        return <div>Loading entries...</div>;
    }

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
                        {loading ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}
        </div>
    );
}