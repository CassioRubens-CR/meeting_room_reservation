import type { RouteDef } from '..'

const path = '/rooms/:roomId/reserve'
const componentName = 'CreateReservationPage'
const isProtected = true

export default { path, componentName, isProtected } satisfies RouteDef
