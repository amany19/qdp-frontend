'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';

interface BookingChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}

/**
 * Booking Choice Modal - Screen 11
 * Design: popup-for-booking-button-from-unit-details.png
 *
 * Allows user to choose between buying or renting the property
 */
export default function BookingChoiceModal({
  isOpen,
  onClose,
  propertyId,
}: BookingChoiceModalProps) {
  const router = useRouter();

  const handleBuyUnit = () => {
    router.push(`/property/booking/sign-contract?propertyId=${propertyId}&type=sale`);
    onClose();
  };

  const handleRentUnit = () => {
    router.push(`/property/booking/sign-contract?propertyId=${propertyId}&type=rent`);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-full"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-t-2xl bg-white p-6 text-right align-middle shadow-xl transition-all">
                {/* Title */}
                <Dialog.Title
                  as="h3"
                  className="text-center text-lg font-bold text-gray-900 mb-6"
                  dir="rtl"
                >
                  اختر بين شراء الوحدة او ايجارها
                </Dialog.Title>

                {/* Buttons */}
                <div className="space-y-3">
                  {/* Buy Unit Button */}
                  <button
                    type="button"
                    onClick={handleBuyUnit}
                    className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 transition-colors duration-200"
                    dir="rtl"
                  >
                    شراء الوحدة
                  </button>

                  {/* Rent Unit Button */}
                  <button
                    type="button"
                    onClick={handleRentUnit}
                    className="w-full rounded-lg bg-gray-100 border border-gray-200 px-6 py-4 text-base font-medium text-black hover:bg-gray-200 transition-colors duration-200"
                    dir="rtl"
                  >
                    إيجار الوحدة
                  </button>
                </div>

                {/* Bottom indicator (home indicator for iOS) */}
                <div className="mt-6 flex justify-center">
                  <div className="h-1 w-32 rounded-full bg-gray-300"></div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
