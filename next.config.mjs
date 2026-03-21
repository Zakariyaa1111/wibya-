import createNextIntlPlugin from 'next-intl/plugin';

// نحن هنا نخبر النظام أن الملف موجود داخل مجلد src الذي أنشأته
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // يمكنك إضافة إعدادات أخرى هنا لاحقاً
};

export default withNextIntl(nextConfig);