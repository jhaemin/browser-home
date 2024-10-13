import { version } from '../package.json'

export const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: 'Browser Home',
  description: 'A browser home extension for Minimalists',
  version,
  permissions: [
    'bookmarks',
    'clipboardRead',
    'clipboardWrite',
    'favicon',
    'management',
    'notifications',
    'scripting',
    'storage',
    'unlimitedStorage',
  ],
  host_permissions: ['<all_urls>'],
  icons: {
    16: 'icons/icon16.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
  action: {
    default_icon: {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
  },
  chrome_url_overrides: {
    newtab: 'index.html',
  },
}
