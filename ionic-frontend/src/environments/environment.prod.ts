// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  transcriptAPIBaseURL: 'https://eybjxm1imb.execute-api.us-east-1.amazonaws.com/Test/transcript/integration/',
  notificationAPIBaseURL: 'https://eybjxm1imb.execute-api.us-east-1.amazonaws.com/Test/notification/integration/',
  integrations: [
    {
      id: 'd2e5aacb-47b5-4b8d-9c8f-21b9e8f4de22',
      type: 'chat'
    },
    {
      id: 'd2e5aacb-47b5-4b8d-9c8f-21b9e8f4de22',
      type: 'offers'
    },
  ],
  userId: 'joe.demo@genesys.com',
  firstName: 'Joe',
  lastName: 'Demo',
  chatBranding: {
    faImageClass: 'fa fa-comments fa-3x',
    iconLabel: 'Connect'
  },
  notificationBranding: {
    faImageClass: 'fa fa-bell fa-3x',
    iconLabel: 'Offers'
  },
  homeBranding: {
    faImageClass: 'fa fa-home fa-3x',
    iconLabel: 'Shop'
  },
  headerIconUrl: '../assets/icon/PetMeLogo.svg',
  homePageTitle: 'Pet Me! Dog and Cat Petting Services',
  homePageSubTitle: 'Shop > Petters > Dog',
  homePageDetails: [
    'Consistent petting for 30 straight minutes',
    'Helps pet anxiety',
    'Basically a massage for your pet',
    'In home services available',
    'Emergency and after hours petting based on staff availability'
  ],
  homePageProductImageUrl: '../assets/icon/PetMe.svg',
  homePageProductLink: 'https://www.genesys.com/'
};
