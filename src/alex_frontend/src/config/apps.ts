// If App type isn't in @/types, define it here:
export interface App {
  name: string;
  description: string;
  path: string;
  logo?: string;
  comingSoon?: boolean;
  isThirdParty?: boolean;
}

export const appsData: App[] = [
  { name: 'Perpetua', description: 'Write', path: '/app/perpetua', logo: '/logos/Perpetua.svg', comingSoon: false },
  { name: 'Alexandrian', description: 'Library', path: '/app/alexandrian', logo: '/logos/Alexandrian.svg' },
  { name: 'Permasearch', description: 'Explore', path: '/app/permasearch', logo: '/logos/Permasearch.svg' },
  { name: 'Emporium', description: 'Trade', path: '/app/emporium', logo: '/logos/Emporium.svg' },
  { name: 'Pinax', description: 'Upload', path: '/app/pinax', logo: '/logos/Pinax.svg', comingSoon: false },
  { name: 'Syllogos', description: 'Aggregate', path: '/app/syllogos', logo: '/logos/Syllogos.svg', comingSoon: true },
  { name: 'Bibliotheca', description: 'Library', path: '/app/bibliotheca', comingSoon: true },
  { name: 'Dialectica', description: 'Debate', path: '/app/dialectica', comingSoon: true },
];

export const thirdPartyAppsData: App[] = [
  { name: 'lbry.fun', description: 'launchpad', path: 'https://lbry.fun', logo: '/logos/lbry.svg', comingSoon: true, isThirdParty: true },
  { name: 'fission.bridge', description: 'bridge', path: 'https://fission.bridge', logo: '/logos/fission.svg', comingSoon: true, isThirdParty: true },
  { name: 'lbry.finance', description: 'lend', path: 'https://lbry.finance', logo: '/logos/lbry.svg', comingSoon: true, isThirdParty: true },
  { name: '...', description: 'come build with us', path: '', logo: '', comingSoon: true, isThirdParty: true },
];

// Helper function to find an app by name
export const findApp = (name: string): App | undefined => {
    return appsData.find(app => app.name === name);
}; 