# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Payment Proxy/Sharing System** (代付分享系统) - a simple Node.js web application that allows users to create payment orders and share links with others for payment assistance.

## Development Commands

```bash
npm install          # Install dependencies
npm start            # Start production server (node server.js)
npm dev              # Start development server with auto-reload (nodemon)
```

Server runs on `http://localhost:3000` by default.

## Architecture

**Monolithic web application** with a single entry point:
- **server.js** (~115 lines) - Complete Express server handling all logic
- **public/** - Static assets (index.html for landing page)

### Data Storage

Uses **in-memory object** (`orders = {}`) for order storage. Orders are lost on server restart. For production, this needs to be replaced with a database.

### Key Design Patterns

1. **Dynamic HTML Generation**: Payment pages are generated server-side via template strings in server.js (not separate HTML files)
2. **Timestamp-based Order IDs**: Order IDs are generated using `Date.now().toString()`
3. **15-minute Expiration**: Orders have `expiresAt` timestamp; countdown timer auto-redirects to `/cancel/:id` on expiry

### API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/create-order` | GET | Create order with amount and desc query params |
| `/pay/:orderId` | GET | Display payment page with countdown timer |
| `/success/:orderId` | GET | Mark order as paid (callback) |
| `/cancel/:orderId` | GET | Mark order as cancelled/expired |

### WeChat Integration

The payment page includes Open Graph meta tags for WeChat social sharing preview:
- `og:title`, `og:description`, `og:image`
- References `wechat-preview.jpg` in public/

## Important Notes

- **Payment Gateway Placeholder**: Currently uses `https://your-payment-gateway.com/pay` - needs real integration
- **No Authentication**: No user system or security controls
- **No Input Validation**: All query parameters are used directly without sanitization
- **Hardcoded URLs**: Contains `localhost:3000` URLs that won't work in production

## Code Style

- Chinese comments and variable names are acceptable (this is a Chinese-language project)
- Simple, straightforward code with minimal abstraction
- Single-file architecture for ease of understanding
