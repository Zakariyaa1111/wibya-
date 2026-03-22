// src/middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // اللغات المدعومة في مشروع Wibya
  locales: ['ar', 'fr', 'en'],
 
  // اللغة الافتراضية إذا زار المستخدم الرابط الرئيسي مباشرة
  defaultLocale: 'ar',

  // لإظهار رمز اللغة في الرابط دائماً (مثل wibya.com/ar)
  localePrefix: 'always' 
});

export const config = {
  // تحديد الروابط التي سيتم تطبيق الميدل وير عليها
  // هذا الـ Matcher يتجاهل ملفات النظام والصور لضمان السرعة
  matcher: ['/', '/(ar|fr|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};