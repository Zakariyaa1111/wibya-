import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('digital_products')
    .select('id, title, status, price, preview_images, profiles!developer_id(full_name, store_name)')
    .eq('status', 'active')
    .limit(5)

  const { data: simple, error: simpleError } = await supabase
    .from('digital_products')
    .select('id, title, status')
    .eq('status', 'active')
    .limit(5)

  return (
    <div className="p-8 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">Debug Page</h1>

      <h2 className="font-bold mt-4 mb-2">Simple Query:</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify({ data: simple, error: simpleError }, null, 2)}
      </pre>

      <h2 className="font-bold mt-4 mb-2">With Profiles Join:</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </div>
  )
}