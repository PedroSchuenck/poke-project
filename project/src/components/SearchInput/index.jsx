import { Search } from "lucide-react";

export function SearchInput({ searchValue, setSearchValue }) {
    function handleChange(value){
        setSearchValue(value)
    }

    return (
        <form className='hero-search' onSubmit={(event) => event.preventDefault()}>
            <Search size={18} />
            <input
                value={searchValue}
                onChange={(event) => handleChange(event.target.value)}
                placeholder='Busque por nome, numero ou #id...'
            />
            <button type='submit'>Buscar</button>
        </form>
    )
}