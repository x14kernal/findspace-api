# FindSpace — Requirements

## 1. Domain

Workspace booking marketplace.

## 2. Actors

- **Customer** — discovers and books spaces.
- **Workspace Owner** — creates and manages spaces and bookings.
- **Admin** — oversees users, spaces, and bookings.

## 3. User Stories

### Customer

- As a customer, I want to `explore` all available `spaces`, so that I can select from them.
- As a customer, I want to `search` by `location`, so that I can find spaces near me or at a specific location.
- As a customer, I want to `search` by `space name`, so that I can find a specific space.
- As a customer, I want to `filter` by `time slot`, so that I can find a space available at a specific time.
- As a customer, I want to `filter` by `capacity`, so that I can find an appropriate space for my team.
- As a customer, I want to `filter` by `features`, such as air conditioning and Wi-Fi, so that I can find spaces with the features I need.
- As a customer, I want to `sort` spaces by `price`, low-to-high or high-to-low, so that I can find a space within my budget.
- As a customer, I want to `view` the details of a specific space, so that I can decide whether it meets my needs.
- As a customer, I want to `create` an account with email and password, so that I can use features that require an account.
- As a customer, I want to `create` an account with Google, so that I can create an account quickly.
- As a customer, I want to `log in` with my email and password, so that I can access my account and book spaces.
- As a customer, I want to `log in` with Google, so that I can access my account quickly.
- As a customer, I want to `log out`, so that I can end my current session.
- As a customer, I want to `manage` my profile, so that I can keep my personal information up to date.
- As a customer, I want to `upload` a profile image, so that I can personalize my profile.
- As a customer, I want to `book` a space for a specific time slot, so that I can use it at the time I need.
- As a customer, I want to `view` all my bookings, so that I can check and manage my reservations.
- As a customer, I want to `cancel` a booking, so that the time slot becomes available again.
- As a customer, I want to `change` the app's language `Arabic/English`, so that I can use it in my native language
- As a customer, I want to receive a notification when my booking is confirmed, so that I know the workspace is confirmed for me.
- As a customer, I want to receive a notification when my booking is cancelled, so that I know I can no longer use the workspace.
- As a customer, I want to receive a reminder about an upcoming booking, so that I don't forget about it.

### Workspace Owner

- As a workspace owner, I want to `create` an account with email and password, so that I can manage my spaces.
- As a workspace owner, I want to `create` an account with Google, so that I can create an account quickly.
- As a workspace owner, I want to `log in` with my email and password, so that I can manage my spaces.
- As a workspace owner, I want to `log in` with Google, so that I can access my account quickly.
- As a workspace owner, I want to `log out`, so that I can end my current session.
- As a workspace owner, I want to `create` a space, so that I can make it available for booking.
- As a workspace owner, I want to `edit` my space's details, so that I can keep its information accurate.
- As a workspace owner, I want to `remove` my space from the platform, so that it is no longer available for booking.
- As a workspace owner, I want to `define` my space's capacity and features, so that customers can find a suitable space.
- As a workspace owner, I want to `define` the available time slots for my space, so that customers know when they can book it.
- As a workspace owner, I want to `view` bookings for my spaces, so that I can manage upcoming reservations.
- As a workspace owner, I want to `manage` a booking, so that I can handle reservations for my space.
- As a workspace owner, I want to receive a notification when a customer creates a booking, so that I know I have a booking request to handle.
- As a workspace owner, I want to receive a notification before a pending booking is automatically cancelled, so that I have an opportunity to contact the customer.

### Admin

- As an admin, I want to `view` registered customers and workspace owners, so that I can manage platform users.
- As an admin, I want to `manage` user accounts, so that I can handle problematic or invalid accounts.
- As an admin, I want to `view` listed spaces, so that I can oversee spaces on the platform.
- As an admin, I want to `manage` spaces, so that I can remove spaces that violate platform rules.
- As an admin, I want to `view` bookings, so that I can oversee activity on the platform.

## 4. Booking Rules

- A customer can request a workspace for a specific time slot.
- A booking starts with `pending` status.
- A pending booking holds the time slot and makes it unavailable to other customers.
- The workspace owner contacts the customer by phone/WhatsApp.
- The owner can confirm or cancel the booking.
- A pending booking is automatically cancelled 60 minutes before its start time if it has not been confirmed.

## 5. Out of Scope for v1

- Payments
- Reviews/ratings
- Recurring booking
- Messaging between customer and owner
- Discounts
- Realtime Notification
