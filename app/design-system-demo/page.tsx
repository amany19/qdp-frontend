'use client';

export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-primary-50 p-8">
      <div className="container-qdp">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          QDP Design System Demo
        </h1>

        {/* Brand Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Brand Colors</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-qdp-cream rounded-lg">
              <p className="text-primary-500 font-medium">QDP Cream</p>
              <p className="text-sm text-primary-600">#D4C5B0</p>
            </div>
            <div className="p-6 bg-qdp-cream-dark rounded-lg">
              <p className="text-primary-500 font-medium">QDP Cream Dark</p>
              <p className="text-sm text-primary-600">#C4B5A0</p>
            </div>
          </div>
        </section>

        {/* Button Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Buttons</h2>
          <div className="space-y-4">
            <button className="w-full bg-primary-500 text-white hover:bg-primary-600 rounded-lg px-6 py-3 font-medium transition-colors">
              Primary Black Button (Login)
            </button>
            <button className="w-full bg-qdp-cream text-primary-500 hover:bg-qdp-cream-dark rounded-lg px-6 py-3 font-medium transition-colors">
              Cream Accent Button (Create Account)
            </button>
            <button className="w-full border-2 border-qdp-cream text-qdp-cream bg-transparent hover:bg-qdp-cream hover:text-primary-500 rounded-lg px-6 py-3 font-medium transition-colors">
              Outlined Cream Button
            </button>
          </div>
        </section>

        {/* Input Fields */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Form Inputs</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Phone number placeholder"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-lg px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="password"
              placeholder="Password placeholder"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-lg px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </section>

        {/* OTP Inputs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">OTP Input (5 boxes)</h2>
          <div className="flex gap-3 justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                className="w-16 h-16 text-center text-xl font-bold bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2"
                defaultValue={i <= 2 ? '5' : ''}
              />
            ))}
          </div>
        </section>

        {/* Semantic Colors - Success/Warning/Error */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Semantic Colors</h2>
          <div className="space-y-4">
            {/* Success */}
            <div className="flex items-center gap-4">
              <div className="bg-success-500 rounded-full w-20 h-20 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Success Green</p>
                <p className="text-sm text-gray-600">#10B981</p>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-center gap-4">
              <div className="bg-warning-500 rounded-full w-20 h-20 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Warning Amber</p>
                <p className="text-sm text-gray-600">#F59E0B</p>
              </div>
            </div>

            {/* Error */}
            <div className="bg-error-500 text-white px-4 py-3 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>Error Alert Banner - Contract Expiry Warning</p>
            </div>
          </div>
        </section>

        {/* Gray Scale */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gray Scale</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">Gray 50</p>
              <p className="text-sm text-gray-600">#F9F9F9</p>
              <p className="text-xs text-gray-400">Input backgrounds</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">Gray 100</p>
              <p className="text-sm text-gray-600">#F5F5F5</p>
              <p className="text-xs text-gray-400">Card backgrounds</p>
            </div>
            <div className="p-4 bg-gray-200 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">Gray 200</p>
              <p className="text-sm text-gray-600">#E5E7EB</p>
              <p className="text-xs text-gray-400">Borders</p>
            </div>
          </div>
        </section>

        {/* RTL Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">RTL Support (Arabic)</h2>
          <div dir="rtl" className="bg-white p-6 rounded-lg shadow-qdp">
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-arabic">
              تسجيل الدخول
            </h3>
            <input
              type="text"
              placeholder="أدخل رقم الهاتف"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-lg px-4 py-3 mb-4 font-arabic"
            />
            <button className="w-full bg-primary-500 text-white hover:bg-primary-600 rounded-lg px-6 py-3 font-medium font-arabic">
              تسجيل دخول
            </button>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Typography</h2>
          <div className="space-y-2">
            <p className="text-gray-900 font-bold">Primary Text (Gray 900) - #111827</p>
            <p className="text-gray-600">Secondary Text (Gray 600) - #6B7280</p>
            <p className="text-gray-400">Placeholder Text (Gray 400) - #9CA3AF</p>
          </div>
        </section>
      </div>
    </div>
  );
}
