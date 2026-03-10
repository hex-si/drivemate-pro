# Memory: index.md
Updated: now

# DeliverPro Agent App

## Design System
- Dark theme: bg `#0A0A0F`, surface `#141419`, green `#00C851`, amber `#FFB800`, danger `#FF4757`
- Font: DM Sans + Inter
- Border radius: 16px cards, 12px buttons
- All colors via HSL CSS variables in index.css
- Glass utility classes: `.glass`, `.glass-strong`
- PWA manifest at `/manifest.json`

## Database Tables
- `user_roles` - role enum: admin, moderator, agent, user
- `delivery_agents` - agent profiles with vehicle type, stats
- `agent_availability` - online/offline/busy status
- `delivery_orders` - full order lifecycle with fees (agents can INSERT own orders)
- `agent_order_responses` - accept/reject/negotiate
- `delivery_tracking` - GPS coordinates
- `order_status_timeline` - delivery stage history
- `notifications` - in-app notifications (realtime enabled)
- `partner_api_keys` - API keys + HMAC secrets for external app integration
- Storage: `avatars`, `delivery-proofs` buckets

## Routes
- `/agent/dashboard` - main dashboard
- `/agent/orders` - tabbed orders list
- `/agent/new-order` - create new order (quick/full mode)
- `/agent/history` - completed delivery archive with photos
- `/agent/active-delivery` - stepper + map
- `/agent/complete-delivery` - photo + fee summary
- `/agent/earnings` - charts + history
- `/agent/profile` - editable profile
- `/agent/notifications` - notification center
- `/agent/receipt/:orderId` - printable receipt with WhatsApp share

## Edge Functions
- `hub-auth` - hub authentication
- `hub-config` - hub configuration
- `hub-update-status` - update order status on hub
- `hub-payment-webhook` - payment webhook
- `partner-api` - external API (create-order, order-status)

## Currency: GHS (₵)

## Push Notifications
- Realtime via Supabase postgres_changes on notifications table
- Browser Notification API + ServiceWorker fallback
- Audio beep on new notification
