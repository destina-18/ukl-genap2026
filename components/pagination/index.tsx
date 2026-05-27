"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination"

type Props = {
    count: number
    perPage: number
    currentPage: number
}

export default function SimplePagination({
    count,
    perPage,
    currentPage,
}: Props) {
    const totalPage = Math.ceil(count / perPage)
    const isFirstPage = currentPage <= 1
    const isLastPage = currentPage >= totalPage

    const router = useRouter()
    const searchParams = useSearchParams()

    const changePage = (page: number) => {
        // Memastikan page tidak kurang dari 1 dan tidak lebih dari totalPage
        const safePage = Math.min(Math.max(page, 1), totalPage)

        const params = new URLSearchParams(searchParams.toString())
        params.set("page", safePage.toString())
        router.push(`?${params.toString()}`)
    }

    const generatePages = () => {
        const pages = []
        let start = Math.max(currentPage - 1, 1)
        let end = Math.min(currentPage + 1, totalPage)

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        return pages
    }

    // Jika total halaman hanya 1 atau 0, tidak perlu tampilkan pagination
    if (totalPage <= 1) return null

    return (
        <Pagination>
            <PaginationContent>
                {/* Tombol Sebelumnya */}
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => !isFirstPage && changePage(currentPage - 1)}
                        className={isFirstPage ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    />
                </PaginationItem>

                {/* Halaman Pertama & Ellipsis Awal */}
                {currentPage > 2 && (
                    <>
                        <PaginationItem>
                            <PaginationLink className="cursor-pointer" onClick={() => changePage(1)}>1</PaginationLink>
                        </PaginationItem>
                        {currentPage > 3 && <PaginationEllipsis />}
                    </>
                )}

                {/* Angka Halaman Dinamis */}
                {generatePages().map((page) => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            className="cursor-pointer"
                            isActive={page === currentPage}
                            onClick={() => changePage(page)}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {/* Ellipsis Akhir & Halaman Terakhir */}
                {currentPage < totalPage - 1 && (
                    <>
                        {currentPage < totalPage - 2 && <PaginationEllipsis />}
                        <PaginationItem>
                            <PaginationLink className="cursor-pointer" onClick={() => changePage(totalPage)}>
                                {totalPage}
                            </PaginationLink>
                        </PaginationItem>
                    </>
                )}

                {/* Tombol Selanjutnya */}
                <PaginationItem>
                    <PaginationNext
                        onClick={() => !isLastPage && changePage(currentPage + 1)}
                        className={isLastPage ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}