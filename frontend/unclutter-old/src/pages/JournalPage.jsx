// src/pages/JournalPage.jsx

import { Routes, Route } from 'react-router-dom';
import JournalsListView from '@/components/journal/JournalsListView';
import SingleJournalView from '@/components/journal/SingleJournalView';
import JournalEntryView from '@/components/journal/JournalEntryView';
import NewEntryView from '@/components/journal/NewEntryView';

export default function JournalPage() {
    return (
        <Routes>
            <Route index element={<JournalsListView showDefaultTypes={true} />} />
            <Route path="/new" element={<NewEntryView />} />
            <Route path="/:journalSlug" element={<SingleJournalView />} />
            <Route path="/:journalSlug/entries/:entrySlug" element={<JournalEntryView />} />
        </Routes>
    );
}





