const { Link } = ReactRouterDOM

export function UserList({ users, onRemoveUser,  }) {

    if (!users) return <div>Loading...</div>
    return (
        <table className="user-list">
            {users.map((user) => (
                <tr className="user-preview" key={user._id}>
                    <td>
                        {user.fullname}
                    </td>
                    <td>
                        <button onClick={() => onRemoveUser(user._id)}>x</button>
                    </td>
                </tr>
            ))
            }
        </table >
    )
}
