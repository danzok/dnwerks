"use client"

import { useState, useEffect } from "react"

interface PerformanceMetrics {
  authTime: number;
  apiTime: number;
  totalTime: number;
  renderTime: number;
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export function PerformanceMonitor({ onMetrics }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    const startTime = performance.now()
    let authComplete = 0

    // Measure auth time
    const checkAuthTime = () => {
      const authElement = document.querySelector('[data-auth-loaded="true"]')
      if (authElement && authComplete === 0) {
        authComplete = performance.now()
      }
    }

    const observer = new MutationObserver(checkAuthTime)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-auth-loaded']
    })

    // Check every 100ms for 5 seconds
    const interval = setInterval(() => {
      checkAuthTime()

      // If we have auth time, calculate final metrics
      if (authComplete > 0) {
        const currentTime = performance.now()
        const apiTime = authComplete - startTime
        const totalTime = currentTime - startTime
        const renderTime = totalTime - apiTime

        const newMetrics = {
          authTime: Math.round(authComplete - startTime),
          apiTime: Math.round(apiTime),
          totalTime: Math.round(totalTime),
          renderTime: Math.round(renderTime)
        }

        setMetrics(newMetrics)
        onMetrics?.(newMetrics)

        clearInterval(interval)
        observer.disconnect()
      }
    }, 100)

    // Cleanup after 5 seconds
    setTimeout(() => {
      clearInterval(interval)
      observer.disconnect()
    }, 5000)

    // Show monitor after 1 second
    setTimeout(() => setIsVisible(true), 1000)

    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [onMetrics])

  if (process.env.NODE_ENV !== 'development' || !isVisible || !metrics) {
    return null
  }

  const getStatusColor = (time: number) => {
    if (time < 500) return "text-green-600"
    if (time < 1000) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2 text-yellow-400">Performance Monitor</div>
      <div className="space-y-1">
        <div className={getStatusColor(metrics.authTime)}>
          Auth: {metrics.authTime}ms
        </div>
        <div className={getStatusColor(metrics.apiTime)}>
          API: {metrics.apiTime}ms
        </div>
        <div className={getStatusColor(metrics.renderTime)}>
          Render: {metrics.renderTime}ms
        </div>
        <div className={getStatusColor(metrics.totalTime)}>
          Total: {metrics.totalTime}ms
        </div>
      </div>
      {metrics.totalTime < 1000 && (
        <div className="text-green-400 mt-2">✅ Fast loading</div>
      )}
      {metrics.totalTime >= 1000 && metrics.totalTime < 2000 && (
        <div className="text-yellow-400 mt-2">⚠️ Moderate loading</div>
      )}
      {metrics.totalTime >= 2000 && (
        <div className="text-red-400 mt-2">❌ Slow loading</div>
      )}
    </div>
  )
}