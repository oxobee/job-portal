import { Link } from "react-router-dom";
import useLoginForm from "./useLoginForm";
import FieldError from "@/components/core-ui/FieldError";
import Alert from "@/components/core-ui/Alert";

const LoginForm = () => {
  const { form, loginError } = useLoginForm();

  return (
    <>
      {loginError && (
        <div className="mb-4">
          <Alert type="error" message={loginError} />
        </div>
      )}
      <form className="space-y-5" onSubmit={form.handleSubmit} noValidate>
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
              readOnly={form.isSubmitting}
              value={form.values.email}
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
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="block w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
              readOnly={form.isSubmitting}
              value={form.values.password}
              onChange={form.handleChange}
            />
            {form.errors.password && (
              <FieldError error={form.errors.password} />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label
              htmlFor="remember-me"
              className="ml-2.5 block text-xs font-medium text-gray-700"
            >
              Beni Hatırla
            </label>
          </div>

          <div className="text-xs">
            <Link
              to="/forgot-password"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Şifremi Unuttum?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
            disabled={form.isSubmitting}
          >
            {form.isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
