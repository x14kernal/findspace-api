# FindSpace — Requirements Brief

## 1. Problem

FindSpace helps customers find and book rooms in workspaces.

Workspace owners manage their workspaces, rooms, availability, and bookings. Admins manage users, workspaces, rooms, and bookings.

## 2. Must-have Features

### Customer

- Browse rooms in a selected country.
  - Use the country in the customer's profile by default, if it exists.
  - If no profile country exists, the customer must select a country.
  - Do not save this selection as the profile country.
- Search by location or workspace name.
- Filter rooms by time, capacity, and features.
- Sort rooms by price.
- View room details.
- Sign up with email/password or Google.
- Log in with email/password or Google.
- Log out.
- Edit profile and upload a profile image.
- Book a room for a fixed, one-hour time slot.
- Provide a phone number when booking.
- View and cancel their own pending or confirmed bookings.
- Choose Arabic or English.
- Receive saved notifications when a booking is confirmed or cancelled.
- Receive a saved reminder before an upcoming booking.

### Workspace Owner

- Sign up and log in with email/password or Google.
- Log out.
- Own one workspace.
- Create, edit, and remove their workspace.
- Upload workspace images.
- Set workspace opening times.
- Create, edit, and remove rooms.
- Set each room's price, capacity, features, floor number, width, and length.
- Require room width and length.
- Use workspace opening times by default, or set different opening times for a room.
- Block times when a room cannot be booked.
- View bookings for each room.
- Confirm or cancel bookings in the app after contacting customers by phone or WhatsApp.
- Provide a reason when cancelling a booking.
- Receive a saved notification when a new booking is made.

### Admin

- View and manage customers and workspace owners.
- View and manage workspaces and rooms.
- View and manage bookings.

### Booking Rules

- Customers book rooms, not whole workspaces.
- Each booking is for one fixed, one-hour time slot.
- A new booking starts with `pending` status.
- A pending booking holds its time slot.
- The owner contacts the customer by phone or WhatsApp before confirming or cancelling.
- The owner must update the booking status in the app.
- A pending booking expires at the earlier of:
  - 20 minutes after it was created; or
  - the booking's start time.
- An expired pending booking must change to `cancelled`.
- The owner must provide a cancellation reason.
- A cancelled booking no longer holds the time slot.
- A room cannot have two active bookings for the same time slot.
- Customers can view and cancel only their own bookings.
- Every API response follows one consistent response shape.

### Notifications

- Notifications are saved so users can view them later.
- Real-time notifications are not required in v1.
- Notifications must work even if the user is not online when they are created.

## 3. Nice-to-have Features

No additional nice-to-have features are defined yet.

## 4. Out of Scope for v1

- Payments
- Reviews and ratings
- Recurring bookings
- Customer-owner messaging inside the platform
- Discounts
- Real-time notifications

## 5. Definition of Done

FindSpace v1 is done when:

- All must-have customer, workspace owner, and admin requirements are implemented.
- Customers can find rooms by country, search, filter, and sort rooms.
- Customers can book fixed, one-hour time slots.
- A room cannot have two active bookings for the same time slot.
- Pending bookings hold their time slots until confirmed, cancelled, or expired.
- Pending bookings expire at the defined time and change to `cancelled`.
- Cancelled bookings no longer block time slots.
- Customers can access and cancel only their own bookings.
- Workspace owners can manage their workspaces, rooms, availability, and bookings.
- Owners must provide a reason when cancelling a booking.
- Saved notifications work without real-time updates.
- Every API response follows the same response shape.
- All out-of-scope features remain outside v1.

## 6. Hard Requirement — Preventing Double-booking

Each booking uses a fixed, one-hour time slot. Two customers must not be able to hold the same room and slot at the same time.

The system must check and create bookings safely, so two requests arriving at nearly the same time cannot both claim the same slot. A cancelled or expired booking must not keep the slot blocked.
