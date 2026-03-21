import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // اللغات المدعومة
  locales: ['ar', 'fr', 'en'],
 
  // اللغة الافتراضية في حال عدم تحديد لغة
  defaultLocale: 'ar'
});
 
export const config = {
  // استثناء الروابط التي لا تحتاج لترجمة مثل الصور والملفات
  matcher: ['/', '/(ar|en|fr)/:path*']
};