
const { useState, useEffect } = React


export function BugFilter({ filterBy, onSetFilter }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
        onSetFilter(filterByToEdit)
    }, [filterByToEdit])

    function onSetFilterBy(ev) {
        ev.preventDefault()
        onSetFilter(filterByToEdit)
    }

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value
                break;

            case 'checkbox':
                if (target.checked) value = -1
                else value = 1
                break

            default:
                break;
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }



    const { title, minSeverity, sortBy, sortDir, label } = filterByToEdit
    return (
        <section className="car-filter main-layout full">
            <form onSubmit={onSetFilterBy} >

                <label htmlFor="title">search by title: </label>
                <input value={title} onChange={handleChange} type="text" id="title" name="title" />

                <label htmlFor="label">search by label: </label>
                <select value={label} onChange={handleChange} id="label" name="label" >
                    <option value="">select</option>
                    <option value="dev-branch">dev-branch</option>
                    <option value="critical">critical</option>
                    <option value="need-CR">need-CR</option>
                </select>

                <label htmlFor="minSeverity">Severity: </label>
                <input value={minSeverity || ''} onChange={handleChange} type="number" id="minSeverity" name="minSeverity" />

                <label htmlFor="sortDir">Descending: </label>
                <input type="checkbox" onChange={handleChange} id="sortDir" name="sortDir" />

                <select value={sortBy} onChange={handleChange} id="sortBy" name="sortBy" >
                    <option value="">select</option>
                    <option value="title">title</option>
                    <option value="severity">severity</option>
                    <option value="createdAt">date</option>
                </select>

            </form>
        </section >
    )
}