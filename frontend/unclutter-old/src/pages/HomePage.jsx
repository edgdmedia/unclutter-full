import React from 'react';

const HomePage = () => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to Unclutter
            </h1>
            <p className="text-gray-600">
                Your mental wellness journey begins here.
            </p>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-2 gap-4">
                <button className="p-4 bg-[#FFDC5E] rounded-lg text-[#441913] hover:opacity-90">
                    New Journal Entry
                </button>
                <button className="p-4 bg-[#764330] rounded-lg text-white hover:opacity-90">
                    Track Mood
                </button>
            </div>

            {/* Today's Overview */}
            <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Overview</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">You haven't logged any entries today.</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;