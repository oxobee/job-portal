import Logo from "@/components/core-ui/Logo";
import PublicLayout from "@/components/layouts/public/PublicLayout";
import ForgotPasswordForm from "@/forms/auth/ForgotPasswordForm";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  return (
    <PublicLayout title="Şifremi Unuttum">
      <div className="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <Logo />
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 mt-4">
            Şifrenizi mi Unuttunuz?
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Endişelenmeyin! Kayıtlı e-posta adresinizi girin, şifrenizi sıfırlamanız için size bir bağlantı gönderelim.{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Giriş Yap
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </PublicLayout>
  );
};

export default ForgotPasswordPage;
