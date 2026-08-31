import { ILoginPayload } from "@/interfaces/models";
import { useAuth } from "@/providers";
import useAuthStore from "@/stores/auth.store";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

const FORM_INITIAL_VALUES = {
  email: "",
  password: "",
};

const useLoginForm = () => {
  const { login: setLogin } = useAuth();
  const navigate = useNavigate();
  const { loginError, login, clearLoginError } = useAuthStore((state) => ({
    login: state.login,
    loginError: state.loginError,
    clearLoginError: state.clearLoginError,
  }));

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("E-posta adresi zorunludur")
      .email("Geçerli bir e-posta adresi giriniz"),
    password: Yup.string()
      .required("Şifre alanı zorunludur")
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .max(30, "Şifre en fazla 30 karakter olabilir"),
  });

  const form = useFormik({
    initialValues: FORM_INITIAL_VALUES,
    validationSchema: validationSchema,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const payload: ILoginPayload = {
          email: values.email,
          password: values.password,
        };
        const { token, user } = await login(payload);
        setLogin(token, user);
        form.resetForm();
        navigate("/");
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    return () => {
      clearLoginError();
    };
  }, [clearLoginError]);

  return {
    form,
    loginError,
  };
};

export default useLoginForm;
