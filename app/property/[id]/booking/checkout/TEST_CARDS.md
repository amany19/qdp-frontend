# Test Credit Cards for Checkout Testing

Use these test card numbers to test the payment checkout flow without making real transactions.

## Valid Test Cards

### Visa
- **Card Number**: `4111 1111 1111 1111`
- **Expiry Date**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **Cardholder Name**: Any name (e.g., `JOHN DOE`)

### Visa (Alternative)
- **Card Number**: `4242 4242 4242 4242`
- **Expiry Date**: Any future date (e.g., `12/26`)
- **CVV**: Any 3 digits (e.g., `456`)
- **Cardholder Name**: Any name

### Mastercard
- **Card Number**: `5555 5555 5555 4444`
- **Expiry Date**: Any future date (e.g., `01/27`)
- **CVV**: Any 3 digits (e.g., `789`)
- **Cardholder Name**: Any name

### Mastercard (Alternative)
- **Card Number**: `5200 8282 8282 8210`
- **Expiry Date**: Any future date (e.g., `03/28`)
- **CVV**: Any 3 digits (e.g., `321`)
- **Cardholder Name**: Any name

## Test Scenarios

### Successful Payment
Use any of the cards above with:
- Valid expiry date (MM/YY format, future date)
- Any 3-digit CVV
- Any cardholder name (letters only)

### Card Validation Errors
To test validation errors, try:
- **Invalid Card Number**: `1234 5678 9012 3456` (will fail validation)
- **Expired Card**: Use expiry date in the past (e.g., `01/20`)
- **Invalid CVV**: Use less than 3 digits or non-numeric characters

## Quick Copy Test Card

For quick testing, use this Visa card:
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Name: JOHN DOE
```

## Notes
- All test cards will be processed successfully by the mock payment gateway
- Real payment gateways (Stripe, PayPal, etc.) have their own test card numbers
- These cards are for development/testing purposes only
- In production, replace with real payment gateway integration
