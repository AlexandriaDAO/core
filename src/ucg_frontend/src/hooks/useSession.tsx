import SessionContext from 'src/ucg_frontend/src/contexts/SessionContext';
import { useContext } from 'react';

const useSession = () => useContext(SessionContext);

export default useSession