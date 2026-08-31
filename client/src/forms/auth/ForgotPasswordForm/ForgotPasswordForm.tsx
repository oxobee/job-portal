import { useState } from "react";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center text-sm text-emerald-800">
        <p className="font-bold">Sıfırlama Bağlantısı Gönderildi!</p>
        <p className="mt-1 text-xs text-emerald-600">
          <strong>{email}</strong> adresine şifre yenileme bağlantısı başarıyla iletildi.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
        >
          E-posta Adresi <span className="text-red-500">*</span>
        </label>
        <div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="ornek@alanadi.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95"
        >
          Şifre Sıfırlama Bağlantısı Gönder
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
