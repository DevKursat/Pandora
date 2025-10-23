"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle, Copy, Check, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useMemo, useEffect, useRef } from "react"
import React from "react"

interface QueryResultProps {
  data: any
  queryType: string | null
}

export function QueryResult({ data, queryType }: QueryResultProps) {
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [matches, setMatches] = useState<HTMLElement[]>([])
  const [currentMatch, setCurrentMatch] = useState(0)
  const contentRef = useRef<HTMLPreElement>(null)

  const cleanedData = useMemo(() => data, [data])

  const isError = cleanedData.error || cleanedData.status === "error"
  const isSuccess = cleanedData.status === "success" || (cleanedData.result && !isError)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(cleanedData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderedJson = useMemo(() => {
    const jsonString = JSON.stringify(cleanedData, null, 2)
    if (!searchTerm) {
      return jsonString
    }
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return jsonString.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-primary/70 text-primary-foreground p-0.5 rounded-sm search-match">
          {part}
        </mark>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    )
  }, [cleanedData, searchTerm])

  useEffect(() => {
    if (contentRef.current && searchTerm) {
      const marks = Array.from(contentRef.current.querySelectorAll<HTMLElement>(".search-match"))
      setMatches(marks)
      setCurrentMatch(0)
    } else {
      setMatches([])
    }
  }, [searchTerm, renderedJson])

  useEffect(() => {
    matches.forEach((match, index) => {
      if (index === currentMatch) {
        match.style.backgroundColor = "#FDE047" // A brighter yellow for the current match
        match.scrollIntoView({ behavior: "smooth", block: "center" })
      } else {
        match.style.backgroundColor = "" // Revert to default highlight color
      }
    })
  }, [currentMatch, matches])

  const handleNextMatch = () => {
    if (matches.length > 0) {
      setCurrentMatch((prev) => (prev + 1) % matches.length)
    }
  }

  const handlePrevMatch = () => {
    if (matches.length > 0) {
      setCurrentMatch((prev) => (prev - 1 + matches.length) % matches.length)
    }
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

      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-2 space-y-2">
        <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded">
          <Input
            placeholder="Sonuçlarda ara..."
            className="h-8 text-xs bg-slate-800/50 border-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMatch} disabled={matches.length === 0}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMatch} disabled={matches.length === 0}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {matches.length > 0 ? `${currentMatch + 1} / ${matches.length}` : `0 / 0`}
          </span>
        </div>
        <div className="overflow-auto max-h-[450px] p-2">
          <pre ref={contentRef} className="text-sm text-foreground font-mono whitespace-pre-wrap">
            {renderedJson}
          </pre>
        </div>
      </div>

      {cleanedData.message && (
        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground">{cleanedData.message}</p>
        </div>
      )}
    </Card>
  )
}
