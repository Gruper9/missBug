

export function BugPreview({bug}) {

    return <article>
        <h4>{bug.title}</h4>
        <h1>🐛</h1>
        <p>Severity: <span>{bug.severity}</span></p>
        {bug.owner._id && <h4>Owner: {bug.owner.fullname}</h4>}
        {!bug.owner._id && <h4>No Owner</h4>}
    </article>
}