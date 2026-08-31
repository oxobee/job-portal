import Logo from "@/components/core-ui/Logo";
import PublicLayout from "@/components/layouts/public/PublicLayout";
import RegisterForm from "@/forms/auth/RegisterForm";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  return (
    <PublicLayout title="Kayıt Ol">
      <div className="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <Logo />
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 mt-4">
            Yeni Hesap Oluşturun
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Zaten bir hesabınız var mı?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Giriş Yapın
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </PublicLayout>
  );
};

export default RegisterPage;
