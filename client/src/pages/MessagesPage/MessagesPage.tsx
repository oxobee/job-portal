import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

const MessagesPage = () => {
  return (
    <PortalLayout title="Mesajlar">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden h-[75vh] flex flex-col md:flex-row">
        {/* Left Conversation List */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Mesajlar</h2>
            <input
              type="text"
              placeholder="Sohbetlerde ara..."
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-indigo-600"
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {[
              {
                name: "Google İK Ekibi",
                role: "Senior UX Designer İlanı",
                lastMsg: "Başvurunuz incelendi, ilk görüşme için...",
                time: "10:30",
                unread: true,
              },
              {
                name: "Meta Talent Team",
                role: "Full Stack Engineer İlanı",
                lastMsg: "Teknik mülakat tarihi hakkında bilgilendirme.",
                time: "Dün",
                unread: false,
              },
            ].map((c, i) => (
              <div
                key={i}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                  i === 0 ? "bg-indigo-50/40" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-gray-900">{c.name}</h4>
                  <span className="text-[11px] text-gray-400">{c.time}</span>
                </div>
                <p className="text-xs text-indigo-600 font-medium">{c.role}</p>
                <p className="text-xs text-gray-500 truncate mt-1">{c.lastMsg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50/40">
          <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Google İK Ekibi</h3>
              <p className="text-xs text-emerald-600 font-medium">● Çevrimiçi</p>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex justify-start">
              <div className="max-w-md bg-white border border-gray-200 rounded-2xl p-4 text-xs text-gray-800 shadow-xs">
                Merhaba, Senior UX/UI Designer pozisyonu için başvurunuz tarafımıza ulaştı ve profilinizi oldukça başarılı bulduk.
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-md bg-indigo-600 text-white rounded-2xl p-4 text-xs shadow-xs">
                Merhaba, geri dönüşünüz için teşekkür ederim! Görüşme detaylarını memnuniyetle konuşabiliriz.
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
            />
            <button
              type="button"
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition shadow-sm"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default MessagesPage;
