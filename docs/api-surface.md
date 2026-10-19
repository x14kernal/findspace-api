# API Surface

| Method | Path                                                                         | Authentication               | Purpose                                                                       |
| ------ | ---------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| POST   | `/auth/signup`                                                               | Public                       | Create an account with email and password.                                    |
| POST   | `/auth/login`                                                                | Public                       | Log in with email and password.                                               |
| POST   | `/auth/google`                                                               | Public                       | Sign up or log in with Google.                                                |
| POST   | `/auth/logout`                                                               | Required                     | Log out the current user.                                                     |
| GET    | `/me`                                                                        | Required                     | Get the current user's profile.                                               |
| PATCH  | `/me`                                                                        | Required                     | Update the current user's profile.                                            |
| DELETE | `/me`                                                                        | Required                     | Delete the current user's account.                                            |
| PUT    | `/me/avatar`                                                                 | Required                     | Upload or replace the profile image.                                          |
| GET    | `/me/notifications`                                                          | Required                     | List the current user's notifications.                                        |
| PATCH  | `/me/notifications/{notificationId}/read`                                    | Required                     | Mark a notification as read.                                                  |
| GET    | `/countries`                                                                 | Public                       | List available countries.                                                     |
| GET    | `/rooms`                                                                     | Public                       | List rooms.                                                                   |
| GET    | `/rooms?search={query}`                                                      | Public                       | Search rooms by query.                                                        |
| GET    | `/rooms?date={date}&start_at={time}&capacity={capacity}&features={features}` | Public                       | Filter rooms by date, start time, capacity, and features.                     |
| GET    | `/rooms?country={countryCode}`                                               | Public                       | Filter rooms by country.                                                      |
| GET    | `/rooms?sort=price_asc`                                                      | Public                       | Sort rooms by price from low to high.                                         |
| GET    | `/rooms/{roomId}`                                                            | Public                       | View room details.                                                            |
| POST   | `/bookings`                                                                  | Required (Customer)          | Create a booking.                                                             |
| GET    | `/me/bookings`                                                               | Required (Customer)          | List the current customer's bookings.                                         |
| GET    | `/bookings/{bookingId}`                                                      | Required (Customer or Owner) | View a booking the user is allowed to access.                                 |
| PATCH  | `/bookings/{bookingId}/cancel`                                               | Required (Customer or Owner) | Cancel a booking the user is allowed to cancel. Owners must provide a reason. |
| POST   | `/owner/workspace`                                                           | Required (Owner)             | Create the owner's workspace.                                                 |
| GET    | `/owner/workspace`                                                           | Required (Owner)             | View the owner's workspace.                                                   |
| PATCH  | `/owner/workspace`                                                           | Required (Owner)             | Update the owner's workspace.                                                 |
| DELETE | `/owner/workspace`                                                           | Required (Owner)             | Delete the owner's workspace.                                                 |
| POST   | `/owner/workspace/images`                                                    | Required (Owner)             | Upload workspace images.                                                      |
| DELETE | `/owner/workspace/images/{imageId}`                                          | Required (Owner)             | Delete a workspace image.                                                     |
| PATCH  | `/owner/workspace/images/{imageId}/primary`                                  | Required (Owner)             | Set the primary workspace image.                                              |
| POST   | `/owner/rooms`                                                               | Required (Owner)             | Create a room.                                                                |
| GET    | `/owner/rooms`                                                               | Required (Owner)             | List the owner's rooms.                                                       |
| GET    | `/owner/rooms/{roomId}`                                                      | Required (Owner)             | View a room owned by the current user.                                        |
| PATCH  | `/owner/rooms/{roomId}`                                                      | Required (Owner)             | Update a room owned by the current user.                                      |
| DELETE | `/owner/rooms/{roomId}`                                                      | Required (Owner)             | Delete a room owned by the current user.                                      |
| GET    | `/owner/workspace/availability`                                              | Required (Owner)             | View workspace availability.                                                  |
| PUT    | `/owner/workspace/availability`                                              | Required (Owner)             | Replace workspace availability.                                               |
| GET    | `/owner/rooms/{roomId}/availability`                                         | Required (Owner)             | View room availability.                                                       |
| PUT    | `/owner/rooms/{roomId}/availability`                                         | Required (Owner)             | Replace room availability.                                                    |
| GET    | `/owner/rooms/{roomId}/unavailability`                                       | Required (Owner)             | List blocked room times.                                                      |
| POST   | `/owner/rooms/{roomId}/unavailability`                                       | Required (Owner)             | Block a room time.                                                            |
| DELETE | `/owner/rooms/{roomId}/unavailability/{id}`                                  | Required (Owner)             | Remove a blocked room time.                                                   |
| GET    | `/features`                                                                  | Public                       | List available room features.                                                 |
| PUT    | `/owner/rooms/{roomId}/features`                                             | Required (Owner)             | Sync the features assigned to a room.                                         |
| GET    | `/owner/bookings`                                                            | Required (Owner)             | List bookings for the owner's workspace.                                      |
| GET    | `/owner/bookings/{bookingId}`                                                | Required (Owner)             | View a booking for the owner's workspace.                                     |
| PATCH  | `/owner/bookings/{bookingId}/confirm`                                        | Required (Owner)             | Confirm a pending booking for the owner's workspace.                          |
| GET    | `/admin/users`                                                               | Required (Admin)             | List users.                                                                   |
| GET    | `/admin/users/{userId}`                                                      | Required (Admin)             | View a user's details.                                                        |
| PATCH  | `/admin/users/{userId}`                                                      | Required (Admin)             | Update a user's details.                                                      |
| DELETE | `/admin/users/{userId}`                                                      | Required (Admin)             | Delete a user.                                                                |
| GET    | `/admin/workspaces`                                                          | Required (Admin)             | List workspaces.                                                              |
| GET    | `/admin/workspaces/{workspaceId}`                                            | Required (Admin)             | View workspace details.                                                       |
| PATCH  | `/admin/workspaces/{workspaceId}`                                            | Required (Admin)             | Update a workspace.                                                           |
| DELETE | `/admin/workspaces/{workspaceId}`                                            | Required (Admin)             | Delete a workspace.                                                           |
| GET    | `/admin/rooms`                                                               | Required (Admin)             | List rooms.                                                                   |
| GET    | `/admin/rooms/{roomId}`                                                      | Required (Admin)             | View room details.                                                            |
| PATCH  | `/admin/rooms/{roomId}`                                                      | Required (Admin)             | Update a room.                                                                |
| DELETE | `/admin/rooms/{roomId}`                                                      | Required (Admin)             | Delete a room.                                                                |
| GET    | `/admin/bookings`                                                            | Required (Admin)             | List bookings.                                                                |
| GET    | `/admin/bookings/{bookingId}`                                                | Required (Admin)             | View booking details.                                                         |