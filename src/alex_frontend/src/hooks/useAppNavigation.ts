import { useNavigate, useLocation } from "@tanstack/react-router";
import { buildRoutes } from "@/react-router-routes/routeConfig";
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
  const goToHome = () => navigate({to: buildRoutes.home()});
  const goToNft = (tokenId: string) => navigate({to: buildRoutes.nft(tokenId)});
  const goToManager = () => navigate({to: buildRoutes.manager()});
  const goToInfo = () => navigate({to: buildRoutes.info()});
  const goToInfoFaq = () => navigate({to: buildRoutes.infoFaq()});
  const goToInfoWhitepaper = () => navigate({to: buildRoutes.infoWhitepaper()});
  const goToInfoAudit = () => navigate({to: buildRoutes.infoAudit()});
  
  // App navigation
  const goToBibliotheca = () => navigate({to: buildRoutes.bibliotheca()});
  const goToAlexandrian = () => navigate({to: buildRoutes.alexandrian()});
  const goToSyllogos = () => navigate({to: buildRoutes.syllogos()});
  const goToDialectica = () => navigate({to: buildRoutes.dialectica()});
  const goToPermasearch = () => navigate({to: buildRoutes.permasearch()});
  const goToEmporium = () => navigate({to: buildRoutes.emporium()});
  const goToPinax = () => navigate({to: buildRoutes.pinax()});
  
  // Swap navigation
  const goToSwap = () => navigate({to: buildRoutes.swap()});
  const goToSwapBalance = () => navigate({to: buildRoutes.swapBalance()});
  const goToSwapSwap = () => navigate({to: buildRoutes.swapSwap()});
  const goToSwapTopup = () => navigate({to: buildRoutes.swapTopup()});
  const goToSwapSend = () => navigate({to: buildRoutes.swapSend()});
  const goToSwapReceive = () => navigate({to: buildRoutes.swapReceive()});
  const goToSwapBurn = () => navigate({to: buildRoutes.swapBurn()});
  const goToSwapStake = () => navigate({to: buildRoutes.swapStake()});
  const goToSwapRedeem = () => navigate({to: buildRoutes.swapRedeem()});
  const goToSwapHistory = () => navigate({to: buildRoutes.swapHistory()});
  const goToSwapInsights = () => navigate({to: buildRoutes.swapInsights()});
  const goToSwapTransaction = () => navigate({to: buildRoutes.swapTransaction()});
  
  // Dashboard navigation
  const goToDashboard = () => navigate({to: buildRoutes.dashboard()});
  const goToDashboardProfile = () => navigate({to: buildRoutes.dashboardProfile()});
  const goToDashboardProfileUpgrade = () => navigate({to: buildRoutes.dashboardProfileUpgrade()});
  const goToDashboardWallets = () => navigate({to: buildRoutes.dashboardWallets()});
  
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