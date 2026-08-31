import Dialog from "@/components/core-ui/Dialog";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const TermsAndConditionsDialog: FC<Props> = ({ open, onClose }) => {
  const renderLeftIcon = () => {
    return (
      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
        <ShieldCheckIcon
          className="h-6 w-6 text-indigo-600"
          aria-hidden="true"
        />
      </div>
    );
  };

  return (
    <Dialog
      title="Kullanım Koşulları ve Gizlilik Sözleşmesi"
      acceptLabel="Anladım"
      enableCancel={false}
      {...{ open, onClose, renderLeftIcon }}
    >
      <div className="space-y-3 text-xs text-gray-600 max-h-60 overflow-y-auto pr-2">
        <p>
          Job Portal platformuna hoş geldiniz. Bu platform üzerinden iş arayanlar
          ve iş verenler güvenli ve şeffaf bir şekilde iletişime geçebilir.
        </p>
        <p>
          <strong>1. Gizlilik:</strong> Kişisel verileriniz KVKK ve ilgili veri
          koruma mevzuatına uygun olarak yalnızca iş başvuruları ve platform
          hizmetleri kapsamında işlenmektedir.
        </p>
        <p>
          <strong>2. İlan Güvenliği:</strong> Platformda yayınlanan tüm iş ilanları
          gerçeklik ve yasal uygunluk denetiminden geçmektedir.
        </p>
        <p>
          <strong>3. Kullanıcı Hakları:</strong> Dilediğiniz zaman hesabınızı silebilir,
          kayıtlı bilgilerinizi güncelleyebilir veya başvurularınızı geri çekebilirsiniz.
        </p>
      </div>
    </Dialog>
  );
};

export default TermsAndConditionsDialog;
