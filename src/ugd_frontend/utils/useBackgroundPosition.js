import { useState, useEffect } from 'react';

const useBackgroundPosition = () => {
  const [backgroundPosition, setBackgroundPosition] = useState('center 0%');

  useEffect(() => {
    const handleScroll = () => {
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;
      const scrolledPercentage = scrollY / totalScrollHeight;
      setBackgroundPosition(`center ${scrolledPercentage * 100}%`);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return backgroundPosition;
};

export default useBackgroundPosition;
