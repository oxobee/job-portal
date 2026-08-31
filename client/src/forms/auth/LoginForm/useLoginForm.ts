import { useAuth } from "@/providers";
import { supabase } from "@/core/supabase";
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

const FORM_INITIAL_VALUES = {
  email: "",
  password: "",
};

const useLoginForm = () => {
  const { login: setLogin } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("E-posta adresi zorunludur")
      .email("Geçerli bir e-posta adresi giriniz"),
    password: Yup.string()
      .required("Şifre alanı zorunludur")
      .min(6, "Şifre en az 6 karakter olmalıdır"),
  });

  const form = useFormik({
    initialValues: FORM_INITIAL_VALUES,
    validationSchema: validationSchema,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      setLoginError("");
      try {
        setSubmitting(true);

        // 1. Check Super Admin Hardcoded Fallback
        if (
          values.email.trim().toLowerCase() === "admin@oxonom.com" &&
          values.password === "Admin2026!"
        ) {
          const superAdminUser = {
            id: "super_admin_oxonom",
            email: "admin@oxonom.com",
            full_name: "Süper Yönetici (Oxonom)",
            role: "super_admin" as const,
            status: "active",
          };
          setLogin("mock_admin_token_" + Date.now(), superAdminUser);
          navigate("/admin");
          return;
        }

        // 2. Query Supabase profiles table
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", values.email.trim().toLowerCase())
          .eq("password", values.password)
          .single();

        if (error || !data) {
          setLoginError("E-posta adresi veya şifre hatalı.");
          return;
        }

        if (data.status === "banned") {
          setLoginError("Hesabınız yönetici tarafından askıya alınmıştır.");
          return;
        }

        const appUser = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role as any,
          status: data.status,
          phone: data.phone,
        };

        setLogin("token_" + data.id + "_" + Date.now(), appUser);

        if (appUser.role === "super_admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } catch (err: any) {
        console.error("Login error:", err);
        setLoginError("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return {
    form,
    loginError,
  };
};

export default useLoginForm;
