# Kuber Panel

## Current State
- React/TypeScript frontend, localStorage-based data
- Live fund transactions: credit every 1.5s, debit every 50s–90s
- Withdrawal approval: auto after 5–10 minutes via setTimeout
- Withdrawal: does NOT auto-deduct from commission when submitted
- Dashboard home: shows module cards grid, no Kuber logo
- APK sync: localStorage only (device-specific, no cross-device sync)

## Requested Changes (Diff)

### Add
- Backend (Motoko) data layer for full cross-device / APK sync: users, bank accounts, activation codes, withdrawals, live transactions, support link, session
- Kuber Panel logo on Dashboard Home (both user and admin) prominently shown above the welcome section
- "Instant" auto-approval notice in withdrawal UI (text updated)

### Modify
- **Debit timing** in App.tsx: change from `50000 + Math.random() * 40000` (50–90s) to `6000 + Math.random() * 4000` (6–10 seconds)
- **Withdrawal**: on submission, instantly set status to `"transfer_successful"` (no delay) AND automatically deduct the amount from admin's accumulated commission
- **Withdrawal auto-approve notice** text: update from "5-10 minutes" to "Instantly"

### Remove
- `useAutoApproveWithdrawals` hook (no longer needed — instant approval on submit)
- 5–10 minute pending timer logic in Withdrawal.tsx

## Implementation Plan
1. Fix debit timer in App.tsx: `6000 + Math.random() * 4000`
2. Update Withdrawal.tsx: set status to `transfer_successful` immediately on submit; deduct amount from admin commission (setAccumulatedCommission); remove useAutoApproveWithdrawals hook; update UI notice text to "Instantly"
3. Add KuberLogo to Dashboard Home (HomeView) and AdminHomeView — displayed prominently at top
4. Implement Motoko backend with full data sync API for all entities (users, bank accounts, activation codes, withdrawals, live transactions, support link)
5. Update frontend storage layer to use backend canister instead of localStorage for all shared data
