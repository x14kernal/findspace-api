# FindSpace — Requirements Brief

## 1. Problem

FindSpace is a workspace booking marketplace where customers can discover suitable workspaces and request bookings for specific time slots.

Workspace owners can list and manage their space and handle booking requests, while admins oversee users, spaces, and bookings.

## 2. Must-have Features

### Customer

- Explore available spaces.
- Search by location and space name.
- Filter by time slot, capacity, and features.
- Sort spaces by price.
- View space details.
- Create an account with email/password or Google.
- Log in with email/password or Google.
- Log out.
- Manage profile and profile image.
- Book a space for a specific time slot.
- View and cancel own bookings.
- Change language between Arabic and English.
- Receive booking confirmation, cancellation, and upcoming-booking notifications.

### Workspace Owner

- Create an account with email/password or Google.
- Log in with email/password or Google.
- Log out.
- Each workspace owner can have only one space.
- The owner can create, edit, and remove their space.
- The owner can define the space's capacity, features, and available time slots.
- The owner can view and manage bookings for their space.
- Receive notifications for new bookings and pending-booking cancellation warnings.

### Admin

- View and manage customers and workspace owners.
- View and manage listed spaces.
- View bookings.

### Booking Rules

- A booking starts as `pending`.
- A pending booking holds its time slot.
- The workspace owner can confirm or cancel the booking.
- Pending bookings are automatically cancelled 60 minutes before their start time if not confirmed.
- A workspace cannot be double-booked for an overlapping time slot.
- Customers can view and cancel only their own bookings.
- Every API response follows one consistent response shape.

## 3. Nice-to-have Features

No additional nice-to-have features are defined yet.

## 4. Definition of Done

FindSpace v1 is done when:

- All must-have customer, workspace owner, and admin requirements are implemented.
- Overlapping bookings for the same workspace cannot both be valid.
- A pending booking holds its time slot.
- Pending bookings are automatically cancelled according to the defined rule.
- Customers can access only their own bookings.
- Workspace owners can manage their spaces and their bookings.
- Every API response follows the same response shape.
- All explicitly defined out-of-scope features remain out of v1.

## 5. Hard Requirement — Preventing Double-booking

Preventing double-booking is harder than simply checking availability before creating a booking. Two booking requests can arrive almost simultaneously, and both could see the same time slot as available before either booking is created.

The system must guarantee that overlapping bookings for the same workspace cannot both become valid bookings.
