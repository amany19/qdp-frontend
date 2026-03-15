'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface WarningPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  /** Secondary (cancel) button label; when set, two-button layout is used */
  cancelButtonText?: string;
  /** Called when cancel button is clicked; onClose is still called after */
  onCancelClick?: () => void;
}

/**
 * Warning popup – same layout and styling as SuccessPopup, uses warning-icon.svg from public/icons.
 */
export default function WarningPopup({
  isOpen,
  onClose,
  title,
  description,
  buttonText = 'الصفحة الرئيسية',
  onButtonClick,
  cancelButtonText,
  onCancelClick,
}: WarningPopupProps) {
  const router = useRouter();
  const hasCancel = Boolean(cancelButtonText);

  const handlePrimaryClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      router.push('/home');
    }
    onClose();
  };

  const handleCancelClick = () => {
    onCancelClick?.();
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

        {/* Modal Container - same as SuccessPopup */}
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
                {/* Icon - same layout as SuccessPopup, warning icon from public/icons */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Image
                      src="/icons/warning-icon.svg"
                      alt="Warning"
                      width={150}
                      height={150}
                      className="text-white"
                    />
                  </div>
                </div>

                {/* Title */}
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-gray-900 mb-2 leading-relaxed max-w-xs mx-auto"
                  dir="rtl"
                >
                  {title}
                </Dialog.Title>

                {/* Description */}
                {description && (
                  <Dialog.Description
                    className="text-sm text-gray-600 mb-3 leading-relaxed max-w-xs mx-auto"
                    dir="rtl"
                  >
                    {description}
                  </Dialog.Description>
                )}

                {/* Actions */}
                {hasCancel ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCancelClick}
                      className="flex-1 rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-300 transition-colors duration-200"
                      dir="rtl"
                    >
                      {cancelButtonText}
                    </button>
                    <button
                      type="button"
                      onClick={handlePrimaryClick}
                      className="flex-1 rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors duration-200"
                      dir="rtl"
                    >
                      {buttonText}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePrimaryClick}
                    className="w-full rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors duration-200"
                    dir="rtl"
                  >
                    {buttonText}
                  </button>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
