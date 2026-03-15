'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: 'success' | 'warning' | 'info';
}

/**
 * Success Popup Modal - Reusable Component
 * Design References from SESSION 2.5:
 * - sucess-checkout-popup.png
 * - confirm-popup-to-view-the-property-with-the-agent.png
 * - Popup-result.png
 * - sucess-rent-Popup.png
 * - Popup-success-order.png
 *
 * Used across multiple flows for success/warning/info messages
 */
export default function SuccessPopup({
  isOpen,
  onClose,
  title,
  description,
  buttonText = 'الصفحة الرئيسية',
  onButtonClick,
  icon = 'success',
}: SuccessPopupProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      router.push('/home');
    }
    onClose();
  };

  // Background color configurations based on icon type
  const bgConfig = {
    success: {
      bg: 'bg-success-500',
      shadow: 'shadow-success-500/20',
    },
    warning: {
      bg: 'bg-warning-500',
      shadow: 'shadow-warning-500/20',
    },
    info: {
      bg: 'bg-blue-500',
      shadow: 'shadow-blue-500/20',
    },
  };

  const config = bgConfig[icon];

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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-sm bg-white pb-4 px-4 text-center align-middle shadow-2xl transition-all">
                {/* Icon Container */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Icon Circle */}
                      {/* SVG Image from public folder */}
                      <Image
                        src="/icons/success-icon.svg" // Adjust the path based on your actual file name
                        alt="Success"
                        width={150}
                        height={150}
                        className="text-white"
                      />
              
                  </div>
                </div>

                {/* Title */}
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-gray-900 mb-3 leading-relaxed max-w-xs mx-auto"
                  dir="rtl"
                >
                  {title}
                </Dialog.Title>

                {/* Description */}
                {description && (
                  <Dialog.Description
                    className="text-sm text-gray-600 mb-8 leading-relaxed max-w-xs mx-auto"
                    dir="rtl"
                  >
                    {description}
                  </Dialog.Description>
                )}

                {/* Action Button */}
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 transition-colors duration-200"
                  dir="rtl"
                >
                  {buttonText}
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}