import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

interface Props { projectId: string }

const STATUS_COLOURS = {
  current: 'bg-green-100 text-green-800',
  superseded: 'bg-gray-100 text-gray-500',
  void: 'bg-red-100 text-red-700',
}

export async function DocumentsTab({ projectId }: Props) {
  const supabase = await createClient()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  const current = documents?.filter(d => d.status === 'current') ?? []

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{current.length} current document{current.length !== 1 ? 's' : ''}</p>
          <p className="text-xs text-gray-400">Upload via Supabase Storage → project-documents bucket</p>
        </div>
        {!documents?.length ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No documents uploaded yet.</p>
            <p className="text-xs mt-1">Upload documents via the document register to track revisions and share with your team.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Discipline</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Rev</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map(doc => (
                  <tr key={doc.id} className={`hover:bg-gray-50 transition-colors ${doc.status !== 'current' ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{doc.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{DOCUMENT_TYPE_LABELS[doc.type as keyof typeof DOCUMENT_TYPE_LABELS] ?? doc.type}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{doc.discipline ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{doc.revision}</td>
                    <td className="px-4 py-3">
                      <Badge label={doc.status.charAt(0).toUpperCase() + doc.status.slice(1)} className={STATUS_COLOURS[doc.status as keyof typeof STATUS_COLOURS]} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{doc.shared_with_client ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(doc.uploaded_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
