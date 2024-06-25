import SessionContext from '@/contexts/SessionContext';
import { useContext } from 'react';

const useSession = () => useContext(SessionContext);

export default useSession