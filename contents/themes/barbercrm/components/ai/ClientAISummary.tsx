'use client'

import { useState } from 'react'
import { Sparkles, MessageCircle, Lightbulb, Loader2 } from 'lucide-react'

interface AISummaryData {
  client: {
    id: string
    name: string
    totalVisits: number
    daysSinceLastVisit: number | null
  }
  ai: {
    summary: string
    suggestedMessage: string
    insight: string
  }
}

interface ClientAISummaryProps {
  clientId: string
  clientName: string
}

export function ClientAISummary({ clientId, clientName }: ClientAISummaryProps) {
  const [data, setData] = useState<AISummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function generateSummary() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/barber-ai/client-summary?clientId=${clientId}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate summary')
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function copyMessage() {
    if (!data?.ai.suggestedMessage) return
    await navigator.clipboard.writeText(data.ai.suggestedMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-sm">AI Client Summary</h3>
        </div>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="h-3 w-3" /> {data ? 'Regenerate' : 'Generate'}</>
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 rounded-lg p-3">{error}</p>
      )}

      {data && (
        <div className="space-y-3">
          {/* Stats */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{data.client.totalVisits}</strong> visits</span>
            {data.client.daysSinceLastVisit !== null && (
              <span><strong className="text-foreground">{data.client.daysSinceLastVisit}</strong> days since last visit</span>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{data.ai.summary}</p>
          </div>

          {/* Suggested WhatsApp message */}
          {data.ai.suggestedMessage && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                <MessageCircle className="h-3.5 w-3.5" />
                Suggested WhatsApp message
              </div>
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3 flex items-start justify-between gap-3">
                <p className="text-xs text-foreground leading-relaxed flex-1">{data.ai.suggestedMessage}</p>
                <button
                  onClick={copyMessage}
                  className="shrink-0 rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Insight */}
          {data.ai.insight && (
            <div className="flex gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed">{data.ai.insight}</p>
            </div>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <p className="text-xs text-muted-foreground">
          Click "Generate" to get an AI-powered summary of {clientName}'s visit history and a suggested message.
        </p>
      )}
    </div>
  )
}
