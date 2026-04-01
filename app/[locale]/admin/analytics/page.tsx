'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { Users, Package, ShoppingBag, Megaphone, TrendingUp, Star } from 'lucide-react'

const COLORS = ['#171717', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [ordersChart, setOrdersChart] = useState<any[]>([])
  const [usersChart, setUsersChart] = useState<any[]>([])
  const [rolesData, setRolesData] = useState<any[]>([])
  const [categoriesData, setCategoriesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [
        { count: usersCount },
        { count: sellersCount },
        { count: buyersCount },
        { count: productsCount },
        { count: ordersCount },
        { count: adsCount },
        { count: premiumCount },
        { data: recentOrders },
        { data: recentUsers },
        { data: categories },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('tier', 'premium'),
        supabase.from('orders').select('created_at, total, status').order('created_at', { ascending: true }).limit(30),
        supabase.from('profiles').select('created_at, role').order('created_at', { ascending: true }).limit(50),
        supabase.from('products').select('category').eq('status', 'active'),
      ])

      setStats({ usersCount, sellersCount, buyersCount, productsCount, ordersCount, adsCount, premiumCount })

      // مخطط الطلبات حسب اليوم
      const ordersByDay: Record<string, number> = {}
      recentOrders?.forEach(o => {
        const day = new Date(o.created_at).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })
        ordersByDay[day] = (ordersByDay[day] || 0) + 1
      })
      setOrdersChart(Object.entries(ordersByDay).slice(-7).map(([date, count]) => ({ date, طلبات: count })))

      // مخطط المستخدمين حسب اليوم
      const usersByDay: Record<string, number> = {}
      recentUsers?.forEach(u => {
        const day = new Date(u.created_at).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })
        usersByDay[day] = (usersByDay[day] || 0) + 1
      })
      setUsersChart(Object.entries(usersByDay).slice(-7).map(([date, count]) => ({ date, مستخدمون: count })))

      // مخطط الأدوار
      setRolesData([
        { name: 'بائع', value: sellersCount ?? 0 },
        { name: 'مشتري', value: buyersCount ?? 0 },
      ])

      // مخطط الفئات
      const catCount: Record<string, number> = {}
      categories?.forEach((p: any) => {
        if (p.category) catCount[p.category] = (catCount[p.category] || 0) + 1
      })
      setCategoriesData(
        Object.entries(catCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value]) => ({ name, منتجات: value }))
      )

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  const cardCls = "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4"

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-20">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white">الإحصائيات</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'المستخدمون', value: stats.usersCount, icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { label: 'المنتجات', value: stats.productsCount, icon: Package, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          { label: 'الطلبات', value: stats.ordersCount, icon: ShoppingBag, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
          { label: 'الإعلانات', value: stats.adsCount, icon: Megaphone, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
          { label: 'البائعون', value: stats.sellersCount, icon: TrendingUp, color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' },
          { label: 'المشترون', value: stats.buyersCount, icon: Users, color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400' },
          { label: 'Premium', value: stats.premiumCount, icon: Star, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={cardCls}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon size={16} /></div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{value?.toLocaleString()}</div>
            <div className="text-xs text-neutral-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Orders chart */}
      <div className={cardCls}>
        <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-4">الطلبات (آخر 7 أيام)</h2>
        {ordersChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ordersChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="طلبات" fill="#171717" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-neutral-400 text-sm py-8">لا توجد بيانات</p>}
      </div>

      {/* Users chart */}
      <div className={cardCls}>
        <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-4">التسجيلات الجديدة</h2>
        {usersChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={usersChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="مستخدمون" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-neutral-400 text-sm py-8">لا توجد بيانات</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Roles pie */}
        <div className={cardCls}>
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-4">توزيع المستخدمين</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={rolesData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {rolesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Categories */}
        <div className={cardCls}>
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-4">أكثر الفئات منتجات</h2>
          {categoriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoriesData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip />
                <Bar dataKey="منتجات" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-neutral-400 text-sm py-8">لا توجد بيانات</p>}
        </div>
      </div>
    </div>
  )
}