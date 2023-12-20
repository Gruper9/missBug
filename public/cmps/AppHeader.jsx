import { UserMsg } from './UserMsg.jsx'
import { LoginSignup } from './LoginSignup.jsx'
import { userService } from '../services/user.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'

const { NavLink,Link,useNavigate } = ReactRouterDOM
const { useEffect,useState } = React



export function AppHeader() {
  const navigate = useNavigate()
  useEffect(() => {
    // component did mount when dependancy array is empty
  }, [])

  const [user, setUser] = useState(userService.getLoggedinUser())

  function onLogout() {
    userService.logout()
      .then(() => {
        onSetUser(null)
      })
      .catch((err) => {
        console.log("err:", err);
        showErrorMsg('OOPs try again')
      })
  }

  function onSetUser(user) {
    setUser(user)

    navigate('/')
  }

  return (
    <header>
      <UserMsg />
      <nav>
        <NavLink to="/">Home</NavLink> |<NavLink to="/bug">Bugs</NavLink> |
        <NavLink to="/about">About</NavLink>
      </nav>
      {user ? (
        < section >
          <Link to={`/user/${user._id}`}>Hello {user.fullname}</Link>
          <button onClick={onLogout}>Logout</button>
          {user.isAdmin && <Link to={`/users`}>manage users</Link>}
        </ section >
      ) : (
        <section>
          <LoginSignup onSetUser={onSetUser} />
        </section>
      )}
      <h1>Bugs are Forever</h1>
    </header>
  )
}
