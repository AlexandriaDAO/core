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
        <div className="flex-grow bg-background p-4 md:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-center mb-6">
                    <div className="inline-flex bg-balancebox rounded-lg p-1">
                        <button
                            onClick={() => handleTabChange('faq')}
                            className={`px-4 py-2 rounded-md transition-all duration-200 text-tabsheading font-roboto-condensed ${
                                activeTab === 'faq'
                                    ? 'bg-gray-800 text-brightyellow'
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            FAQ
                        </button>
                        <button
                            onClick={() => handleTabChange('whitepaper')}
                            className={`px-4 py-2 rounded-md transition-all duration-200 text-tabsheading font-roboto-condensed ${
                                activeTab === 'whitepaper'
                                    ? 'bg-gray-800 text-brightyellow'
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            WHITEPAPER
                        </button>
                    </div>
                </div>
                
                <div className="bg-balancebox rounded-lg p-6">
                    {activeTab === 'faq' ? <FAQPage /> : <WhitepaperPage />}
                </div>
            </div>
        </div>
    );
}

export default InfoPage; 