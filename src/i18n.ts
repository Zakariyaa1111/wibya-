import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => ({
  // لاحظ النقطتين (..) لأننا الآن داخل src ومجلد messages خارجه
  messages: (await import(`../messages/${locale}.json`)).default
}));