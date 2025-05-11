import FormLogin from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h1 className="text-center text-4xl font-bold leading-9 tracking-tight text-green-600">
            V2H Pharmacy
          </h1>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Đăng nhập
          </h2>
        </div>

        <FormLogin />
      </div>
    </>
  );
}
