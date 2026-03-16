'use client';

import Image from 'next/image';

const PAYMENT_METHODS = [
  { id: 'mastercard', name: 'ماستر كارد', logo: '/logos/masterCard.svg' },
  { id: 'apple_pay', name: 'ابل باي', logo: '/logos/applePay.svg' },
  { id: 'google_pay', name: 'جوجل باي', logo: '/logos/googlePay.svg' },
  { id: 'visa', name: 'فيزا', logo: '/logos/visaPay.svg' },
  { id: 'paypal', name: 'باي بال', logo: '/logos/payPal.svg' },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];

interface PaymentMethodSelectProps {
  selectedMethod: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
}

export function PaymentMethodSelect({ selectedMethod, onSelect }: PaymentMethodSelectProps) {
  return (
    <div className="space-y-3">
      {PAYMENT_METHODS.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onSelect(method.id)}
          className={`w-full flex items-center justify-between px-4 py-4 rounded-lg border-2 transition-colors ${
            selectedMethod === method.id ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Image src={method.logo} alt={method.name} width={50} height={50} />
            <span className="font-medium text-gray-900">{method.name}</span>
          </div>
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === method.id ? 'border-black' : 'border-gray-300'
            }`}
          >
            {selectedMethod === method.id && <div className="w-3 h-3 rounded-full bg-black" />}
          </div>
        </button>
      ))}
    </div>
  );
}

export { PAYMENT_METHODS };
