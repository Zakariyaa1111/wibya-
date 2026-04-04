import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { FollowButton } from '@/components/developer/FollowButton'
import { ProductCard } from '@/components/product/ProductCard'
import {
  BadgeCheck, Globe, Github, Twitter,
  Package, Download, Star, Users, Shield
} from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('store_name, full_name, bio')
    .eq('id', id)
    .single()

  return {
    title: data?.store_name || data?.full_name || 'مطور',
    description: data?.bio || 'صفحة المطور على Wibya',
  }
}

export default async function DeveloperProfilePage({ params }: Props) {
  const { id, locale } = await params
  const supabase = await createClient()

  const { data: developer } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'developer')
    .single()

  if (!developer) notFound()

  const { data: products } = await supabase
    .from('digital_products')
    .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles(full_name, store_name, is_verified)')
    .eq('developer_id', id)
    .eq('status', 'active')
    .order('sales_count', { ascending: false })

  // هل المستخدم الحالي يتابع هذا المطور؟
  const { data: { user } } = await supabase.auth.getUser()
  let isFollowing = false
  if (user && user.id !== id) {
    const { data: follow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('developer_id', id)
      .single()
    isFollowing = !!follow
  }

  const totalSales = products?.reduce((s, p) => s + (p.sales_count || 0), 0) ?? 0
  const avgRating = products?.length
    ? (products.reduce((s, p) => s + (p.average_rating || 0), 0) / products.length).toFixed(1)
    : '—'

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />

      <main className="pb-24 max-w-2xl mx-auto">

        {/* Cover + Avatar */}
        <div className="bg-neutral-900 h-28 relative">
          <div className="absolute -bottom-8 start-4">
            <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-neutral-950 bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center text-2xl font-bold text-neutral-500">
              {developer.store_image
                ? <Image src={developer.store_image} alt={developer.store_name || ''} width={64} height={64} className="object-cover w-full h-full" />
                : (developer.store_name || developer.full_name || 'D').charAt(0)
              }
            </div>
          </div>
        </div>

        <div className="px-4 pt-12 pb-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {developer.store_name || developer.full_name}
                </h1>
                {developer.is_verified && (
                  <BadgeCheck size={18} className="text-blue-500" aria-label="مطور موثق" />
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                مطور على Wibya منذ {new Date(developer.created_at).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long' })}
              </p>
            </div>

            {user && user.id !== id && (
              <FollowButton
                developerId={id}
                initialFollowing={isFollowing}
                userId={user.id}
              />
            )}
          </div>

          {/* Bio */}
          {developer.bio && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              {developer.bio}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: Package, value: products?.length ?? 0, label: 'منتج' },
              { icon: Download, value: totalSales, label: 'مبيعة' },
              { icon: Users, value: developer.followers_count ?? 0, label: 'متابع' },
              { icon: Star, value: avgRating, label: 'تقييم' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 text-center">
                <Icon size={14} className="text-neutral-400 mx-auto mb-1" aria-hidden="true" />
                <p className="font-bold text-sm text-neutral-900 dark:text-white">{value}</p>
                <p className="text-[10px] text-neutral-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          {developer.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {developer.skills.map((skill: string) => (
                <span key={skill} className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-3 py-1.5 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-3 mb-5">
            {developer.website && (
              <a href={developer.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
                <Globe size={14} aria-hidden="true" />
                <span>الموقع</span>
              </a>
            )}
            {developer.github && (
              <a href={`https://github.com/${developer.github}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
                <Github size={14} aria-hidden="true" />
                <span>GitHub</span>
              </a>
            )}
            {developer.twitter && (
              <a href={`https://twitter.com/${developer.twitter}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
                <Twitter size={14} aria-hidden="true" />
                <span>Twitter</span>
              </a>
            )}
          </div>

          {/* Products */}
          <div>
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <Package size={14} aria-hidden="true" />
              المنتجات ({products?.length ?? 0})
            </h2>

            {!products?.length ? (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-8 text-center">
                <Package size={32} className="text-neutral-300 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-neutral-400">لا توجد منتجات نشطة بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.map(product => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}