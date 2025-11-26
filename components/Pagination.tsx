'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getBrandColors } from '@/lib/brand'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const brandColors = getBrandColors()
  
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg transition-all ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 shadow-md'
        }`}
        onMouseEnter={(e) => {
          if (currentPage !== 1) {
            const hex = brandColors.primary || '#10B981'
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            if (result) {
              const r = parseInt(result[1], 16)
              const g = parseInt(result[2], 16)
              const b = parseInt(result[3], 16)
              e.currentTarget.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.1)`
            }
            e.currentTarget.style.color = brandColors.primary || '#10B981'
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== 1) {
            e.currentTarget.style.backgroundColor = 'white'
            e.currentTarget.style.color = '#374151'
          }
        }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                ...
              </span>
            )
          }

          const pageNum = page as number
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === pageNum
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-700 shadow-md'
              }`}
              style={currentPage === pageNum ? {
                background: `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
              } : {}}
              onMouseEnter={(e) => {
                if (currentPage !== pageNum) {
                  const hex = brandColors.primary || '#10B981'
                  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
                  if (result) {
                    const r = parseInt(result[1], 16)
                    const g = parseInt(result[2], 16)
                    const b = parseInt(result[3], 16)
                    e.currentTarget.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.1)`
                  }
                  e.currentTarget.style.color = brandColors.primary || '#10B981'
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== pageNum) {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.color = '#374151'
                }
              }}
            >
              {pageNum}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg transition-all ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 shadow-md'
        }`}
        onMouseEnter={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = `${brandColors.primary}10`
            e.currentTarget.style.color = brandColors.primary || '#10B981'
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = 'white'
            e.currentTarget.style.color = '#374151'
          }
        }}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

