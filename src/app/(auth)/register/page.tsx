import RegisterForm from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Đăng ký
        </h2>

        <RegisterForm />
      </div>
    </>
  );
}
