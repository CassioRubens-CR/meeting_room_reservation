import type { RouteDef } from '..'

const path = '/reservations/:reservationId/edit'
const componentName = 'EditReservationPage'
const isProtected = true

export default { path, componentName, isProtected } satisfies RouteDef
