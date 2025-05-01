// src/services/journal.js
import { apiCall } from '../utils/api';

export const journalService = {
    // Journal Management
    getJournals: async () => {
        return apiCall('unclutter/v1/journals', {
            method: 'GET'
        });
    },

    createJournal: async (data) => {
        return apiCall('unclutter/v1/journals', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    getJournal: async (journalSlug) => {
        return apiCall(`unclutter/v1/journals/${journalSlug}`, {
            method: 'GET'
        });
    },

    // Entry Management
    getEntries: async (journalSlug, { page = 1, perPage = 10, tag, isShared } = {}) => {
        const params = new URLSearchParams({
            page,
            per_page: perPage,
            ...(tag && { tag }),
            ...(isShared !== undefined && { is_shared: isShared })
        });

        return apiCall(`unclutter/v1/journals/${journalSlug}/entries?${params}`, {
            method: 'GET'
        });
    },

    createEntry: async (journalSlug, data) => {
        return apiCall(`unclutter/v1/journals/${journalSlug}/entries`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    getEntry: async (journalSlug, entrySlug) => {
        return apiCall(`unclutter/v1/journals/${journalSlug}/entries/${entrySlug}`, {
            method: 'GET'
        });
    },

    updateEntry: async (journalSlug, entrySlug, data) => {
        return apiCall(`unclutter/v1/journals/${journalSlug}/entries/${entrySlug}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteEntry: async (journalSlug, entrySlug) => {
        return apiCall(`unclutter/v1/journals/${journalSlug}/entries/${entrySlug}`, {
            method: 'DELETE'
        });
    },

    // Tags
    getTags: async () => {
        return apiCall('unclutter/v1/journals/tags', {
            method: 'GET'
        });
    },

    // Sharing
    getSharedEntries: async ({ page = 1, perPage = 10 } = {}) => {
        const params = new URLSearchParams({
            page,
            per_page: perPage
        });

        return apiCall(`unclutter/v1/journals/shared?${params}`, {
            method: 'GET'
        });
    },

    toggleShare: async (journalSlug, entrySlug, shareData) => {
        return apiCall(`unclutter/v1/journals/${journalSlug}/entries/${entrySlug}/share`, {
            method: 'POST',
            body: JSON.stringify(shareData)
        });
    },

    // Entry Locking
    lockEntry: async (journalSlug, entrySlug, lockUntil) => {
        return apiCall(`unclutter/v1/journals/${journalSlug}/entries/${entrySlug}/lock`, {
            method: 'POST',
            body: JSON.stringify({ lock_until: lockUntil })
        });
    }
};