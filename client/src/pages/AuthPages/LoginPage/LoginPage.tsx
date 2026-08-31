import Logo from "@/components/core-ui/Logo";
import PublicLayout from "@/components/layouts/public/PublicLayout";
import LoginForm from "@/forms/auth/LoginForm";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <PublicLayout title="Giriş Yap">
      <div className="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <Logo />
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 mt-4">
            Hesabınıza Giriş Yapın
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Hesabınız yok mu?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Hemen Kayıt Olun
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;
