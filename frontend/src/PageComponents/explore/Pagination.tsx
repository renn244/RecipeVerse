import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

type PaginationProps = {
    page: number,
    totalPages: number,
    onPageChange: (page: number) => void
}

const visiblePages = (page: number, totalPages: number): (number | '…')[] => {
  const pages = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))
  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | '…')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('…')
    result.push(p)
  })
  return result
}

const PaginationNav = ({
    page,
    totalPages,
    onPageChange
} : PaginationProps) => {

  if (totalPages <= 1) return null

  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return
    onPageChange(p)
  }

  return (
    <div>
      <Pagination>
        <PaginationContent>

          <PaginationPrevious
          aria-disabled={page <= 1}
          className={cn("cursor-pointer", page <= 1 && "pointer-events-none opacity-50")}
          onClick={() => go(page - 1)} />

          {visiblePages(page, totalPages).map((p, idx) => (
            <PaginationItem key={idx}>
              {p === '…' ? (
                <span className="px-2">…</span>
              ) : (
                <PaginationLink
                className="cursor-pointer"
                isActive={p === page}
                onClick={() => go(p)}>
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationNext
          aria-disabled={page >= totalPages}
          className={cn("cursor-pointer", page >= totalPages && "pointer-events-none opacity-50")}
          onClick={() => go(page + 1)} />

        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default PaginationNav
