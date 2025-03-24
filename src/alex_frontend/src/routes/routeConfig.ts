// Central route configuration for the application
import { ROUTES as PERPETUA_ROUTES } from "@/apps/app/Perpetua/routes";

// Base routes
export const BASE_ROUTES = {
  HOME: '/',
  NFT: '/nft/:tokenId',
  MANAGER: '/manager',
  INFO: '/info',
  INFO_FAQ: '/info/faq',
  INFO_WHITEPAPER: '/info/whitepaper',
  INFO_AUDIT: '/info/audit',
  UNAUTHORIZED: '/401',
  NOT_FOUND: '*',
};

// App routes
export const APP_ROUTES = {
  BASE: '/app',
  BIBLIOTHECA: '/app/bibliotheca',
  ALEXANDRIAN: '/app/alexandrian',
  SYLLOGOS: '/app/syllogos',
  DIALECTICA: '/app/dialectica',
  PERMASEARCH: '/app/permasearch',
  EMPORIUM: '/app/emporium',
  PINAX: '/app/pinax',
  // Include Perpetua routes
  PERPETUA: PERPETUA_ROUTES,
};

// Swap routes
export const SWAP_ROUTES = {
  BASE: '/swap',
  BALANCE: '/swap/balance',
  SWAP: '/swap/swap',
  TOPUP: '/swap/topup',
  SEND: '/swap/send',
  RECEIVE: '/swap/receive',
  BURN: '/swap/burn',
  STAKE: '/swap/stake',
  REDEEM: '/swap/redeem',
  HISTORY: '/swap/history',
  INSIGHTS: '/swap/insights',
  TRANSACTION: '/swap/transaction',
};

// Dashboard routes
export const DASHBOARD_ROUTES = {
  BASE: '/dashboard',
  PROFILE: '/dashboard/profile',
  PROFILE_UPGRADE: '/dashboard/profile/upgrade',
  WALLETS: '/dashboard/wallets',
  ASSET_SYNC: '/dashboard/asset-sync',
};

// Combine all routes
export const ROUTES = {
  ...BASE_ROUTES,
  ...APP_ROUTES,
  ...SWAP_ROUTES,
  ...DASHBOARD_ROUTES,
  DASHBOARD_ROUTES,
  APP_ROUTES,
  SWAP_ROUTES,
  BASE_ROUTES
};

// Route builder functions
export const buildRoutes = {
  // Base routes
  home: () => BASE_ROUTES.HOME,
  nft: (tokenId: string) => `/nft/${tokenId}`,
  manager: () => BASE_ROUTES.MANAGER,
  info: () => BASE_ROUTES.INFO,
  infoFaq: () => BASE_ROUTES.INFO_FAQ,
  infoWhitepaper: () => BASE_ROUTES.INFO_WHITEPAPER,
  infoAudit: () => BASE_ROUTES.INFO_AUDIT,
  
  // App routes
  app: () => APP_ROUTES.BASE,
  bibliotheca: () => APP_ROUTES.BIBLIOTHECA,
  alexandrian: () => APP_ROUTES.ALEXANDRIAN,
  syllogos: () => APP_ROUTES.SYLLOGOS,
  dialectica: () => APP_ROUTES.DIALECTICA,
  permasearch: () => APP_ROUTES.PERMASEARCH,
  emporium: () => APP_ROUTES.EMPORIUM,
  pinax: () => APP_ROUTES.PINAX,
  
  // Swap routes
  swap: () => SWAP_ROUTES.BASE,
  swapBalance: () => SWAP_ROUTES.BALANCE,
  swapSwap: () => SWAP_ROUTES.SWAP,
  swapTopup: () => SWAP_ROUTES.TOPUP,
  swapSend: () => SWAP_ROUTES.SEND,
  swapReceive: () => SWAP_ROUTES.RECEIVE,
  swapBurn: () => SWAP_ROUTES.BURN,
  swapStake: () => SWAP_ROUTES.STAKE,
  swapRedeem: () => SWAP_ROUTES.REDEEM,
  swapHistory: () => SWAP_ROUTES.HISTORY,
  swapInsights: () => SWAP_ROUTES.INSIGHTS,
  swapTransaction: () => SWAP_ROUTES.TRANSACTION,
  
  // Dashboard routes
  dashboard: () => DASHBOARD_ROUTES.BASE,
  dashboardProfile: () => DASHBOARD_ROUTES.PROFILE,
  dashboardProfileUpgrade: () => DASHBOARD_ROUTES.PROFILE_UPGRADE,
  dashboardWallets: () => DASHBOARD_ROUTES.WALLETS,
  dashboardAssetSync: () => DASHBOARD_ROUTES.ASSET_SYNC,
};

export default ROUTES; 