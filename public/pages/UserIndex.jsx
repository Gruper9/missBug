import { userService } from "../services/user.service.js"
import { UserList } from '../cmps/UserList.jsx'
const { useState, useEffect} = React

export function UserIndex() {
    const [users, setUsers] = useState(null)
    
    useEffect(() => {
        loadUsers()
    }, [])

    function loadUsers() {
        userService.query().then(setUsers)
    }

    function onRemoveUser(userId) {
        userService
            .remove(userId)
            .then(() => {
                console.log('Deleted Succesfully!')
                const usersToUpdate = users.filter((user) => user._id !== userId)
                setUsers(usersToUpdate)
                showSuccessMsg('user removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveUser ->', err)
                showErrorMsg('Cannot remove user')
            })
    }


    return (
        <main>
            <h3>manage users</h3>
            <main>
                <UserList users={users} onRemoveUser={onRemoveUser}  />
            </main>
        </main>
    )
}
