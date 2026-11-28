export const PATHS = {
  signup: '/api/auth/signup',
  login: '/api/auth/login',
  refresh: '/api/auth/refresh',
  logout: '/api/auth/logout',
  google: '/api/auth/google',

  me: '/api/me',
  avatar: '/api/me/avatar',
  profile: '/api/me/profile',

  countries: '/api/countries',
  features: '/api/features',

  workspace: '/api/owner/workspace',
  workspaceAvailability: '/api/owner/workspace/availability',

  rooms: '/api/owner/rooms',
  room: (id: string) => `/api/owner/rooms/${id}`,
  roomAvailability: (id: string) => `/api/owner/rooms/${id}/availability`,
  roomFeatures: (id: string) => `/api/owner/rooms/${id}/features`,
  roomUnavailability: (roomId: string) => `/api/owner/rooms/${roomId}/unavailability`,
  roomUnavailabilityItem: (roomId: string, id: string) =>
    `/api/owner/rooms/${roomId}/unavailability/${id}`,
};
