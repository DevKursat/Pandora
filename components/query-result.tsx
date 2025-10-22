"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface QueryResultProps {
  data: any
  queryType: string | null
}

function cleanData(data: any): any {
  if (typeof data === "string") {
    return data
      .replace(/[,;:]\s*$/g, "")
      .replace(/^\s*[,;:]/g, "")
      .replace(/\s+/g, " ")
      .replace(/,\s*,/g, ",")
      .replace(/;\s*;/g, ";")
      .trim()
  }
  if (Array.isArray(data)) {
    return data.map(cleanData).filter((item) => item !== "" && item !== null && item !== undefined)
  }
  if (typeof data === "object" && data !== null) {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(data)) {
      const cleanedValue = cleanData(value)
      if (cleanedValue !== "" && cleanedValue !== null && cleanedValue !== undefined) {
        cleaned[key] = cleanedValue
      }
    }
    return cleaned
  }
  return data
}

export function QueryResult({ data, queryType }: QueryResultProps) {
  const [copied, setCopied] = useState(false)

  const cleanedData = cleanData(data)

  const isError = cleanedData.error || cleanedData.status === "error"
  const isSuccess = cleanedData.status === "success" || (cleanedData.result && !isError)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(cleanedData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isSuccess && <CheckCircle2 className="h-6 w-6 text-accent" />}
          {isError && <XCircle className="h-6 w-6 text-destructive" />}
          {!isSuccess && !isError && <AlertCircle className="h-6 w-6 text-primary" />}
          <h3 className="text-lg font-semibold text-foreground">Sorgu Sonucu</h3>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy} className="hover:bg-slate-800 bg-transparent">
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "Kopyalandı" : "Kopyala"}
        </Button>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4 overflow-auto max-h-[500px] border border-slate-700">
        <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
          {JSON.stringify(cleanedData, null, 2)}
        </pre>
      </div>

      {cleanedData.message && (
        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground">{cleanedData.message}</p>
        </div>
      )}
    </Card>
  )
}
