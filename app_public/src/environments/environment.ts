// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_URL: 'http://camv-d10dfdev1:8080/api/v0.1.0/', 
  SHORT_API_URL:  'http://camv-d10dfdev1:8080',
  API_LOCAL_URL:  'http://127.0.0.1:5002/api',
  API_PROXY_URL:  '/api',
  SOC_PROXY_URL:  '/soc',
  SOC_LOCAL_URL:  'http://127.0.0.1:8080',                                              // Proxy (for cores issue) for the socket calls?
  // Proxy (for cores issue) for the socket calls?
  GITLAB_API_URL: 'http://ccam-gitlab-01.ccam.ccam-va.com/api/v4/'
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

