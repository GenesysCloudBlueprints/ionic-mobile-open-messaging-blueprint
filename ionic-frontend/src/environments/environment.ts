// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
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
  userId: 'juaquim.demo@genesys.com',
  firstName: 'Juaquim',
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
  headerIconUrl: '../assets/icon/WalkMeIcon-BW.png',
  homePageTitle: 'Walk Me! Dog and Cat Walking Services',
  homePageSubTitle: 'Shop > Walkers > Dog',
  homePageDetails: [
    '30 minutes of pet walking',
    'Helps pet anxiety',
    'Exercises pet',
    'In home services available for that rainy day',
    'Emergency and after hours walking based on staff availability'
  ],
  homePageProductImageUrl: '../assets/icon/WalkMeIcon-Color.png',
  homePageProductLink: 'https://www.genesys.com/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
