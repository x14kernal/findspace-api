# FindSpace API

Backend API for **FindSpace**, a workspace booking marketplace where customers can discover and book workspaces, while workspace owners manage their spaces and bookings.

## Domain

Workspace booking marketplace

### Actors

* **Customer** — discovers and books workspaces.
* **Workspace Owner** — creates and manages workspaces and bookings.
* **Admin** — oversees users, workspaces, and bookings.

## Core Booking Flow

1. Customer selects a workspace and time slot.
2. Customer submits a booking with their phone number.
3. Booking starts with `pending` status.
4. The requested time slot becomes unavailable to other customers.
5. Workspace Owner contacts the customer by phone or WhatsApp.
6. Owner confirms or cancels the booking.
7. If the booking is still pending 60 minutes before its start time, it is automatically cancelled.

## Current Status

🚧 **In development**

This project is being built as part of a full-stack learning roadmap, with a focus on applying system design and architecture concepts before implementation.

## Documentation

* [`Requirements`](docs/requirements.md) — Product requirements, user stories, booking rules, and v1 scope.

## Planned Scope

The v1 platform will support:

* Workspace discovery and search
* Location, time, capacity, and feature filtering
* Price sorting
* Workspace details
* Customer accounts
* Workspace Owner accounts
* Workspace management
* Booking management
* In-app notifications
* Arabic / English language support

### Out of Scope for v1

* Payments
* Reviews and ratings
* Recurring bookings
* Customer–owner messaging
* Discounts
* Real-time notifications
