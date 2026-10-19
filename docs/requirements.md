# FindSpace — Requirements

## 1. What is FindSpace?

FindSpace helps people find and book rooms in workspaces.

Customers find rooms and book a one-hour time slot. Workspace owners manage their workspaces, rooms, and bookings. Admins manage the platform.

## 2. Users

### Customer

A customer can find rooms, manage their account, and book rooms.

### Workspace Owner

A workspace owner can manage their workspace, rooms, availability, and bookings.

### Admin

An admin can manage users, workspaces, rooms, and bookings.

## 3. Customer requirements

### Find rooms

- As a customer, I want to see rooms in a selected country so I can find a room in the right place.
- As a customer, I want to search by location or workspace name.
- As a customer, I want to filter rooms by time, capacity, and features.
- As a customer, I want to sort rooms by price.
- As a customer, I want to view room details.

### Account

- As a customer, I want to sign up with email and password or Google.
- As a customer, I want to be logged in after I sign up.
- As a customer, I want to log in with email and password or Google.
- As a customer, I want to log out.
- As a customer, I want to edit my profile.
- As a customer, I want to upload a profile image.
- As a customer, I want to choose Arabic or English.

### Bookings

- As a customer, I want to book a room for a one-hour time slot.
- As a customer, I must give my phone number when I book.
- As a customer, I want to see my bookings.
- As a customer, I want to cancel a pending or confirmed booking.
- As a customer, I want to get a saved notification when my booking is confirmed or cancelled.
- As a customer, I want to get a saved reminder before my booking.

## 4. Workspace owner requirements

### Account

- As a workspace owner, I want to sign up and log in with email and password or Google.
- As a workspace owner, I want to log out.

### Workspace and rooms

- As a workspace owner, I want to create and edit a workspace.
- As a workspace owner, I want to upload images for my workspace.
- As a workspace owner, I want to set my workspace's usual opening times.
- As a workspace owner, I want to create and edit rooms.
- As a workspace owner, I want to set each room's capacity, features, price, size, and floor number.
- Room width and length are required.
- As a workspace owner, I want to choose existing room features or create new ones.
- As a workspace owner, I want to set room opening times that replace the workspace times when needed.
- If a room has no own opening times, it uses the workspace's opening times.
- As a workspace owner, I want to block times when a room cannot be booked.
- As a workspace owner, I want to remove a workspace or room from the platform.

### Bookings

- As a workspace owner, I want to see bookings for each room.
- As a workspace owner, I want to contact a customer by phone or WhatsApp before deciding on a booking.
- As a workspace owner, I want to confirm or cancel a booking in the app after contacting the customer.
- As a workspace owner, I must give a reason when I cancel a booking.
- As a workspace owner, I want to get a saved notification when a new booking is made.

## 5. Admin requirements

- As an admin, I want to see registered customers and workspace owners.
- As an admin, I want to manage user accounts.
- As an admin, I want to see and manage listed workspaces and rooms.
- As an admin, I want to see and manage bookings.

## 6. Booking rules

- Customers book rooms, not whole workspaces.
- Each booking is for one fixed, one-hour time slot.
- A new booking starts with the status `pending`.
- A pending booking holds the time slot until it is confirmed or cancelled.
- A pending booking expires at the earlier of:
  - 20 minutes after it was created; or
  - the booking's start time.
- When a pending booking expires, its status must change to `cancelled`.
- Workspace owners contact customers by phone or WhatsApp before confirming or cancelling a booking.
- The owner must update the booking status in the app after contacting the customer.
- An owner must provide a cancellation reason when cancelling a booking.
- A cancelled booking must not keep the time slot blocked.

## 7. Notifications

- Save notifications so users can see them later.
- Notifications do not need to appear in real time in v1.
- Customers get a notification when a booking is confirmed or cancelled.
- Customers get a reminder before an upcoming booking.
- Workspace owners get a notification when a new booking is made.

## 8. Out of scope for v1

- Payments
- Reviews and ratings
- Repeat bookings
- Messages between customers and workspace owners
- Discounts
- Real-time notifications
