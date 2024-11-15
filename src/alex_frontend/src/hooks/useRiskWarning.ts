import { useState, useEffect } from 'react';

export const useRiskWarning = () => {
    const [showRiskWarning, setShowRiskWarning] = useState(false);

    useEffect(() => {
        const lastShown = localStorage.getItem('riskWarningLastShown');
        
        if (!lastShown) {
            setShowRiskWarning(true);
        } else {
            const lastShownDate = new Date(lastShown);
            const daysSinceLastShown = (new Date().getTime() - lastShownDate.getTime()) / (1000 * 3600 * 24);
            
            if (daysSinceLastShown >= 7) {
                setShowRiskWarning(true);
            }
        }
    }, []);

    const handleCloseRiskWarning = () => {
        localStorage.setItem('riskWarningLastShown', new Date().toISOString());
        setShowRiskWarning(false);
    };

    return { showRiskWarning, handleCloseRiskWarning };
}; 