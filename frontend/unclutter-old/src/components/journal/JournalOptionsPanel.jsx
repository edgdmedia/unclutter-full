// src/components/journal/JournalOptionsPanel.jsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tag, Share2, X } from "lucide-react";

const JournalOptionsPanel = ({
    open,
    onOpenChange,
    tags,
    currentTag,
    shareType,
    onAddTag,
    onRemoveTag,
    onTagInputChange,
    onShareTypeChange,
    hasUnsavedChanges
}) => {
    const handleAddTag = (e) => {
        e.preventDefault();
        onAddTag(currentTag);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange} side="right">
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Journal Options</SheetTitle>
                </SheetHeader>

                {hasUnsavedChanges && (
                    <Alert className="my-4">
                        <AlertDescription>
                            You have unsaved changes that will be automatically saved.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-6 mt-6">
                    {/* Tags Section */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            <Label>Tags</Label>
                        </div>

                        <form onSubmit={handleAddTag} className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Add a tag"
                                value={currentTag}
                                onChange={(e) => onTagInputChange(e.target.value)}
                            />
                            <Button type="submit" size="sm">Add</Button>
                        </form>

                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="px-2 py-1">
                                    {tag}
                                    <X
                                        className="w-3 h-3 ml-1 cursor-pointer"
                                        onClick={() => onRemoveTag(tag)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Sharing Options */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Share2 className="w-4 h-4 mr-2" />
                            <Label>Sharing Options</Label>
                        </div>

                        <RadioGroup value={shareType} onValueChange={onShareTypeChange}>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="private" id="private" />
                                    <Label htmlFor="private">Private</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="anonymous" id="anonymous" />
                                    <Label htmlFor="anonymous">Share Anonymously</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="public" id="public" />
                                    <Label htmlFor="public">Share Publicly</Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default JournalOptionsPanel;