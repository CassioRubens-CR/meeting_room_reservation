import Login from './Login'
import Register from './Register'
import Home from './Home'
import Dashboard from './Dashboard'
import Rooms from './Rooms'
import CreateReservation from './CreateReservation'
import MyReservations from './MyReservations'
import EditReservation from './EditReservation'
import AdminRooms from './AdminRooms'
import Profile from './Profile'
import AdminReservations from './AdminReservations'

export type PageComponentName =
  | 'LoginPage'
  | 'RegisterPage'
  | 'HomePage'
  | 'RoomsPage'
  | 'CreateReservationPage'
  | 'MyReservationsPage'
  | 'EditReservationPage'
  | 'AdminRoomsPage'
  | 'ProfilePage'
  | 'AdminReservationsPage'

export type RouteDef = {
  path: string
  componentName: PageComponentName
  isProtected?: boolean
}

const routes: RouteDef[] = [
  Login,
  Register,
  Home,
  Dashboard,
  Rooms,
  CreateReservation,
  MyReservations,
  EditReservation,
  AdminRooms,
  Profile,
  AdminReservations,
]

export default routes
export { routes }
