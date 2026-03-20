import { ChevronLeft, ChevronRight } from "lucide-react"


export function PaginationContainer({children, response, updateFilter, loading, filters}){

    const hasPrevious = response.meta?.hasPrevious ?? false
    const hasNext = response.meta?.hasNext ?? false

    return (
        <>
            {children}
            <footer className='pagination'>
                <button
                    disabled={!hasPrevious || loading}
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                >
                    <ChevronLeft size={16} />
                    Anterior
                </button>
                <span>
                    Pagina {response.meta?.page ?? 1} de {response.meta?.totalPages ?? 1}
                </span>
                <button disabled={!hasNext || loading} onClick={() => updateFilter('page', filters.page + 1)}>
                    Proxima
                    <ChevronRight size={16} />
                </button>
            </footer>
        </>
    )
}