import { useAuth } from "@/providers";
import { supabase } from "@/core/supabase";
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

const FORM_INITIAL_VALUES = {
  fullName: "",
  user_type_name: "job_seeker",
  email: "",
  password: "",
  confirmPassword: "",
  termsConditions: false,
};

const useRegisterForm = () => {
  const { login: setLogin } = useAuth();
  const navigate = useNavigate();
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState("");
  const [registerErrorMessage, setRegisterErrorMessage] = useState("");
  const [termsConditionsModalOpen, setTermsConditionsModalOpen] = useState(false);

  const validationSchema = Yup.object({
    fullName: Yup.string().required("Ad Soyad zorunludur"),
    user_type_name: Yup.string()
      .required("Kullanıcı türü zorunludur")
      .oneOf(["job_seeker", "hr_recruiter", "super_admin"]),
    email: Yup.string()
      .required("E-posta adresi zorunludur")
      .email("Geçerli bir e-posta adresi giriniz"),
    password: Yup.string()
      .required("Şifre alanı zorunludur")
      .min(6, "Şifre en az 6 karakter olmalıdır"),
    confirmPassword: Yup.string()
      .required("Şifre tekrarı zorunludur")
      .oneOf([Yup.ref("password")], "Şifreler birbiriyle eşleşmiyor"),
    termsConditions: Yup.boolean().oneOf(
      [true],
      "Kullanım koşullarını kabul etmelisiniz"
    ),
  });

  const form = useFormik({
    initialValues: FORM_INITIAL_VALUES,
    validationSchema: validationSchema,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      setRegisterSuccessMessage("");
      setRegisterErrorMessage("");
      try {
        setSubmitting(true);

        // Check if email already exists
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", values.email.trim().toLowerCase())
          .single();

        if (existing) {
          setRegisterErrorMessage("Bu e-posta adresiyle kayıtlı bir hesap zaten var.");
          return;
        }

        // Insert new user into Supabase profiles
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            email: values.email.trim().toLowerCase(),
            password: values.password,
            full_name: values.fullName,
            role: values.user_type_name,
            status: "active",
          })
          .select()
          .single();

        if (error) {
          setRegisterErrorMessage("Kayıt oluşturulurken bir hata oluştu: " + error.message);
          return;
        }

        setRegisterSuccessMessage("Hesabınız başarıyla oluşturuldu! Giriş yapılıyor...");

        if (data) {
          const appUser = {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            status: data.status,
          };
          setTimeout(() => {
            setLogin("token_" + data.id + "_" + Date.now(), appUser);
            navigate(appUser.role === "super_admin" ? "/admin" : "/");
          }, 1000);
        }
      } catch (err: any) {
        console.error("Registration error:", err);
        setRegisterErrorMessage("Kayıt sırasında bir hata oluştu.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return {
    form,
    registerSuccessMessage,
    registerErrorMessage,
    termsConditionsModalOpen,
    handleOnOpenTermsConditionsModal: () => setTermsConditionsModalOpen(true),
    handleOnCloseTermsConditionsModal: () => setTermsConditionsModalOpen(false),
  };
};

export default useRegisterForm;
