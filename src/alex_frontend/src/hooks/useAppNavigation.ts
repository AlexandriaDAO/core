import { useNavigate, useLocation } from "react-router-dom";
import { buildRoutes } from "@/routes/routeConfig";
import { usePerpetuaNavigation } from "@/apps/app/Perpetua/routes";

/**
 * Custom hook for application-wide navigation
 * Provides navigation functions for all parts of the application
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const perpetuaNavigation = usePerpetuaNavigation();
  
  // Base navigation
  const goToHome = () => navigate(buildRoutes.home());
  const goToNft = (tokenId: string) => navigate(buildRoutes.nft(tokenId));
  const goToManager = () => navigate(buildRoutes.manager());
  const goToInfo = () => navigate(buildRoutes.info());
  const goToInfoFaq = () => navigate(buildRoutes.infoFaq());
  const goToInfoWhitepaper = () => navigate(buildRoutes.infoWhitepaper());
  const goToInfoAudit = () => navigate(buildRoutes.infoAudit());
  
  // App navigation
  const goToBibliotheca = () => navigate(buildRoutes.bibliotheca());
  const goToAlexandrian = () => navigate(buildRoutes.alexandrian());
  const goToSyllogos = () => navigate(buildRoutes.syllogos());
  const goToDialectica = () => navigate(buildRoutes.dialectica());
  const goToPermasearch = () => navigate(buildRoutes.permasearch());
  const goToEmporium = () => navigate(buildRoutes.emporium());
  const goToPinax = () => navigate(buildRoutes.pinax());
  
  // Swap navigation
  const goToSwap = () => navigate(buildRoutes.swap());
  const goToSwapBalance = () => navigate(buildRoutes.swapBalance());
  const goToSwapSwap = () => navigate(buildRoutes.swapSwap());
  const goToSwapTopup = () => navigate(buildRoutes.swapTopup());
  const goToSwapSend = () => navigate(buildRoutes.swapSend());
  const goToSwapReceive = () => navigate(buildRoutes.swapReceive());
  const goToSwapBurn = () => navigate(buildRoutes.swapBurn());
  const goToSwapStake = () => navigate(buildRoutes.swapStake());
  const goToSwapRedeem = () => navigate(buildRoutes.swapRedeem());
  const goToSwapHistory = () => navigate(buildRoutes.swapHistory());
  const goToSwapInsights = () => navigate(buildRoutes.swapInsights());
  const goToSwapTransaction = () => navigate(buildRoutes.swapTransaction());
  
  // Dashboard navigation
  const goToDashboard = () => navigate(buildRoutes.dashboard());
  const goToDashboardProfile = () => navigate(buildRoutes.dashboardProfile());
  const goToDashboardProfileUpgrade = () => navigate(buildRoutes.dashboardProfileUpgrade());
  const goToDashboardWallets = () => navigate(buildRoutes.dashboardWallets());
  
  return {
    // Current location info
    currentPath: location.pathname,
    
    // Base navigation
    goToHome,
    goToNft,
    goToManager,
    goToInfo,
    goToInfoFaq,
    goToInfoWhitepaper,
    goToInfoAudit,
    
    // App navigation
    goToBibliotheca,
    goToAlexandrian,
    goToSyllogos,
    goToDialectica,
    goToPermasearch,
    goToEmporium,
    goToPinax,
    
    // Perpetua navigation (re-exported from perpetuaNavigation)
    perpetua: perpetuaNavigation,
    
    // Swap navigation
    goToSwap,
    goToSwapBalance,
    goToSwapSwap,
    goToSwapTopup,
    goToSwapSend,
    goToSwapReceive,
    goToSwapBurn,
    goToSwapStake,
    goToSwapRedeem,
    goToSwapHistory,
    goToSwapInsights,
    goToSwapTransaction,
    
    // Dashboard navigation
    goToDashboard,
    goToDashboardProfile,
    goToDashboardProfileUpgrade,
    goToDashboardWallets,
    
    // General navigation
    navigate,
  };
}; 