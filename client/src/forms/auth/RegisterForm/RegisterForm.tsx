import { EyeIcon } from "@heroicons/react/24/outline";
import useRegisterForm from "./useRegisterForm";
import TermsAndConditionsDialog from "@/components/dialogs/TermsAndConditionsDialog";
import FieldError from "@/components/core-ui/FieldError";
import Alert from "@/components/core-ui/Alert";

const RegisterForm = () => {
  const {
    form,
    registerSuccessMessage,
    registerErrorMessage,
    termsConditionsModalOpen,
    handleOnOpenTermsConditionsModal,
    handleOnCloseTermsConditionsModal,
  } = useRegisterForm();

  return (
    <>
      {registerSuccessMessage && (
        <div className="mb-4">
          <Alert type="success" message={registerSuccessMessage} />
        </div>
      )}
      {registerErrorMessage && (
        <div className="mb-4">
          <Alert type="error" message={registerErrorMessage} />
        </div>
      )}
      <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="user_type_name"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
          >
            Kayıt Rolü / Türü <span className="text-red-500">*</span>
          </label>
          <select
            id="user_type_name"
            name="user_type_name"
            className="block w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
            disabled={form.isSubmitting}
            value={form.values.user_type_name}
            onChange={(e) =>
              form.setFieldValue("user_type_name", e.target.value)
            }
          >
            <option value="job_seeker">İş Arayan (Job Seeker)</option>
            <option value="hr_recruiter">İş Veren / İK (HR Recruiter)</option>
          </select>
          {form.errors.user_type_name && (
            <FieldError error={form.errors.user_type_name} />
          )}
        </div>

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
              className="block w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
              value={form.values.email}
              disabled={form.isSubmitting}
              onChange={form.handleChange}
            />
            {form.errors.email && <FieldError error={form.errors.email} />}
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
          >
            Şifre <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="block w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
              value={form.values.password}
              onChange={form.handleChange}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <EyeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
          {form.errors.password && <FieldError error={form.errors.password} />}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
          >
            Şifre Tekrarı <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="block w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
              value={form.values.confirmPassword}
              disabled={form.isSubmitting}
              onChange={form.handleChange}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <EyeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
          {form.errors.confirmPassword && (
            <FieldError error={form.errors.confirmPassword} />
          )}
        </div>

        <div className="pt-1">
          <div className="flex items-start">
            <input
              id="termsConditions"
              name="termsConditions"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 mt-1"
              checked={form.values.termsConditions}
              onChange={(e) =>
                form.setFieldValue("termsConditions", e.target.checked)
              }
            />
            <label
              htmlFor="termsConditions"
              className="ml-2.5 block text-xs leading-5 text-gray-700 cursor-pointer"
            >
              <a
                href="#"
                className="font-bold text-indigo-600 hover:text-indigo-500"
                onClick={handleOnOpenTermsConditionsModal}
              >
                Kullanım Koşulları ve Gizlilik Sözleşmesini
              </a>{" "}
              okudum, kabul ediyorum.
            </label>
          </div>
          {form.errors.termsConditions && (
            <FieldError error={form.errors.termsConditions} />
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="flex w-full justify-center rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
            disabled={form.isSubmitting}
          >
            {form.isSubmitting ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </div>
      </form>
      <TermsAndConditionsDialog
        open={termsConditionsModalOpen}
        onClose={handleOnCloseTermsConditionsModal}
      />
    </>
  );
};

export default RegisterForm;
