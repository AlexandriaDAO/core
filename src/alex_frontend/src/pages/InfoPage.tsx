import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FAQPage from './FAQPage';
import WhitepaperPage from './WhitepaperPage';

function InfoPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'faq' | 'whitepaper'>(
        location.pathname === '/info/whitepaper' ? 'whitepaper' : 'faq'
    );

    const handleTabChange = (tab: 'faq' | 'whitepaper') => {
        setActiveTab(tab);
        navigate(`/info/${tab}`);
    };

    return (
        <div className="flex-grow bg-[#0d1117] p-4 md:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-center mb-6">
                    <div className="inline-flex bg-[#161b22] rounded-lg p-1">
                        <button
                            onClick={() => handleTabChange('faq')}
                            className={`px-4 py-2 rounded-md transition-all duration-200 ${
                                activeTab === 'faq'
                                    ? 'bg-[#1f2937] text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            FAQ
                        </button>
                        <button
                            onClick={() => handleTabChange('whitepaper')}
                            className={`px-4 py-2 rounded-md transition-all duration-200 ${
                                activeTab === 'whitepaper'
                                    ? 'bg-[#1f2937] text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            WHITEPAPER
                        </button>
                    </div>
                </div>
                
                {activeTab === 'faq' ? <FAQPage /> : <WhitepaperPage />}
            </div>
        </div>
    );
}

export default InfoPage; 