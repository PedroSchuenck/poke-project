import { useEffect, useMemo, useState } from "react"
import { formatName } from "../../utils/nameFormatter"
import { LIMIT_OPTIONS, ORDER_OPTIONS, REGION_OPTIONS, SORT_OPTIONS, loadFilters } from "../../api/services/filtersService"
import { Filter } from "lucide-react"
import { Dropdown } from "../Dropdown"
import { SlidersHorizontal, ArrowDownUp, ChevronsUpDown, Activity } from "lucide-react"

export function FilterSection({ filters, updateFilter }) {
    const [types, setTypes] = useState([])
    const [regions, setRegions] = useState([])

    useEffect(() => {
        loadFilters().then(({ types, regions }) => { 
            setTypes(types)
            setRegions(regions)
        }).catch((fetchError) => {
            setError(fetchError.message)
        })
    }, [])


    const regionCounts = useMemo(
        () => Object.fromEntries(regions.map((item) => [item.region, item.count])),
        [regions],
    )
    
    const typeDropdownOptions = useMemo(
        () => [
            { value: 'all', label: 'Todos os tipos' },
            ...types.map((item) => ({
            value: item.type,
            label: `${formatName(item.type)} (${item.count})`,
            })),
        ],
        [types],
    )

    const originDropdownOptions = useMemo(
        () => [
            { value: 'all', label: 'Todas as origens' },
            ...REGION_OPTIONS.map((item) => ({
            value: `region:${item.region}`,
            label: `${formatName(item.region)} (Gen ${item.generation})${
                regionCounts[item.region] ? ` (${regionCounts[item.region]})` : ''
            }`,
            })),
        ],
        [regionCounts],
    )
    
    return(
        <section className='control-panel'>
            <div className='filter-chip'>
                <div className='filter-chip-title'>
                    <Filter size={14} />
                    Tipo
                </div>
                <Dropdown options={typeDropdownOptions} value={filters.type} onChange={(value) => updateFilter('type', value)} />
            </div>
            <div className='filter-chip'>
                <div className='filter-chip-title'>
                    <SlidersHorizontal size={14} />
                    Regiao e Geracao
                </div>
                <Dropdown options={originDropdownOptions} value={filters.origin} onChange={(value) => updateFilter('origin', value)} />
            </div>
            <div className='filter-chip'>
                <div className='filter-chip-title'>
                    <ArrowDownUp size={14} />
                    Ordenar por
                </div>
                <Dropdown options={SORT_OPTIONS} value={filters.sortBy} onChange={(value) => updateFilter('sortBy', value)} />
            </div>
            <div className='filter-chip'>
                <div className='filter-chip-title'>
                    <ChevronsUpDown size={14} />
                    Ordem
                </div>
                <Dropdown options={ORDER_OPTIONS} value={filters.order} onChange={(value) => updateFilter('order', value)} />
            </div>
            <div className='filter-chip'>
                <div className='filter-chip-title'>
                    <Activity size={14} />
                    Itens por pagina
                </div>
                <Dropdown
                    options={LIMIT_OPTIONS.map((value) => ({ value: String(value), label: String(value) }))}
                    value={String(filters.limit)}
                    onChange={(value) => updateFilter('limit', value)}
                />
            </div>
        </section>
    )
}