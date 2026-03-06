# Kuber Panel

## Current State
Full-stack financial platform with admin/user dashboards, fund management, live transactions, commission tracking, and withdrawal system. React + TypeScript frontend with Motoko backend for cross-device sync.

## Requested Changes (Diff)

### Add
- **Fund-specific activation codes**: Admin's "Generate Activation Codes" panel gets fund-type selector: Gaming Fund, Stock Fund, Political Fund, Mix Fund, All Fund. Each generated code is tagged with which fund(s) it activates.
- **Fund-based user activation**: When user enters a code, only the fund(s) that code was generated for get activated (e.g. gaming code → only Gaming Fund unlocks). All Fund code → all 4 funds unlock. User can enter multiple codes to unlock multiple funds.
- **Direct fund activation in User Management**: Admin can directly activate specific fund(s) for a user — dropdown/buttons per fund (Gaming / Stock / Political / Mix / All), not just blanket "Activate Panel".
- **Live activity PDF bank statement download**: In admin's Live Fund Activity, add "Download Statement" button that generates a PDF-style bank statement HTML file with all transactions (like a real bank statement — header with bank/account details, table of all CR/DR entries, total, date range).
- **Withdrawal receipt download fix**: Make receipt download work in all browsers and WebView/APK. Use anchor download instead of window.open+print, generate a properly formatted HTML receipt file that can be saved as PDF.

### Modify
- **Admin Live Fund Activity auto-always-ON**: When Admin opens Live Fund Activity module, transactions start automatically as long as any bank account has transaction ON (no manual toggle needed for admin view). Admin's live activity always shows the active fund transactions; it never shows "Inactive" unless no fund is actually active.
- **Hide syncing indicator**: Any "Syncing..." loading text/spinner visible in the UI should be hidden from users. Backend sync happens silently.
- **Fund-specific activation in User object**: User data now has `activatedFunds` field: `{ gaming: boolean, stock: boolean, political: boolean, mix: boolean }`. A user's fund modules show locked/unlocked based on their individual fund activation state.
- **Module visibility based on fund activation**: In Dashboard, each fund card (Gaming/Stock/Political/Mix) is locked unless that specific fund is activated for the user. `isActivated` overall still unlocks Commission, Withdrawal, Live Activity, History. Fund cards individually need fund-specific unlock.
- **Real withdrawal transaction IDs**: Ensure all 3 methods (UPI/Bank/USDT) produce realistic-looking transaction reference numbers already in place — verify and enhance if needed.
- **Commission balance withdrawal for admin**: Admin's existing commission balance gets auto-withdrawn at app load (one-time action if balance > 0) — actually this should be a button "Withdraw All" in commission view, not auto. Add "Withdraw All" button in admin My Commission that fills withdrawal form with full balance.

### Remove
- Any visible "Syncing..." / loading indicators that show backend sync status to the user.

## Implementation Plan

1. **storage.ts**: Add `activatedFunds` field to User interface. Add `fundType` field to ActivationCode interface. Update `generateActivationCode` to accept fundType param.

2. **GenerateCode.tsx**: Replace simple "Generate New Code" button with fund-type selector (Gaming Fund / Stock Fund / Political Fund / Mix Fund / All Fund) + generate button. Store fundType in activation code. Show fund type column in codes table.

3. **ActivationPanel.tsx**: On code submission, check code's fundType. Update user's `activatedFunds` accordingly. If fundType = "all", set all 4 funds to true. If fundType = "gaming", set gaming=true (others unchanged). Show which funds are activated/locked in the features list.

4. **Dashboard.tsx**: 
   - Fund cards (gaming/stock/political/mix) are locked based on `user.activatedFunds[fundType]` not global `isActivated`.
   - Pass per-fund activated state to FundModule.
   - Keep global isActivated for Commission/Withdrawal/History/Live Activity.
   - Add `activatedFunds` state and refresh logic.

5. **UserManagement.tsx**: In activate button, show fund selection dialog — Admin can choose Gaming/Stock/Political/Mix/All to activate for the user. Direct activation sets the specific `activatedFunds` flags.

6. **LiveActivity.tsx**: Admin mode — when isAdmin=true, auto-start transactions immediately, always show live feed. Remove any "need to turn on" messaging for admin. The component reads active fund and shows it directly.

7. **WithdrawalHistory.tsx `downloadReceipt`**: Replace `window.open` + `print` approach with a Blob download link (`<a download="receipt.html">`) that works in all browsers and WebViews. The receipt HTML should be self-contained and printable.

8. **AdminLiveFunds.tsx**: Add "Download Statement" button that generates a complete bank statement HTML with all transaction history, formatted like a real bank passbook statement (Kuber Panel letterhead, account details, transaction table with SR No / Date / Description / CR / DR / Balance, footer).

9. **backend-sync.ts**: Hide any visible syncing UI — ensure initBackendSync and other sync calls don't show any loading state to user.

10. **App.tsx / main components**: Remove/hide any "Syncing..." text or loading spinners related to backend sync that are visible to users.
