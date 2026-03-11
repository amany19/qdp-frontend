type Props = {
  activeTab: string
  setActiveTab: (tab: any) => void
  showAds: boolean
}

export default function ProfileTabs({
  activeTab,
  setActiveTab,
  showAds,
}: Props) {
  return (
    <div className="bg-white px-5 py-4 border-b border-gray-100">
      <div className="flex bg-[#F3F1EB] p-1 rounded-xl gap-2">

        <Tab label="حسابي" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
        <Tab label="وحدتي" active={activeTab === 'units'} onClick={() => setActiveTab('units')} />

        {showAds && (
          <Tab label="إعلاناتي" active={activeTab === 'ads'} onClick={() => setActiveTab('ads')} />
        )}
      </div>
    </div>
  )
}

function Tab({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
        active
          ? 'bg-black text-white'
          : 'text-gray-700'
      }`}
    >
      {label}
    </button>
  )
}