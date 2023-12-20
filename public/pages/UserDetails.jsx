const { useState, useEffect } = React
const { Link, useParams } = ReactRouterDOM
import { userService } from '../services/user.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'


export function UserDetails(){
        const [user, setuser] = useState(userService.getLoggedinUser())
    useEffect(() => {          
    }, [])

  


    if (!user) return <h1>loadings....</h1>
    return (<section className='user-details'>
        <h1>{user.fullname}</h1>
       
    </section>

    )

  

  
}