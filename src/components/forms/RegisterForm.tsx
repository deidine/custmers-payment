"use client";
import { useState } from "react";
import { Check, User, MapPin, Phone, Mail, Lock, Shield, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const [error, setError] = useState("");
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          address,
          phoneNumber,
          username: email,
          password,
          role,
        }),
      });

      if (response.ok) {
        setIsSubmitSuccess(true);
      } else {
        const { error } = await response.json();
        setError(error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred!");
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneNumberValid = () => /^\d{10}$/.test(phoneNumber);
  const isPasswordValid = () => password.length >= 5;
  const isPasswordMatch = () => password === retypePassword;

  const isDisableSubmit = () =>
    !fullName ||
    !address ||
    !phoneNumber ||
    !email ||
    !password ||
    !retypePassword ||
    !isEmailValid() ||
    !isPhoneNumberValid() ||
    !isPasswordMatch();

  const getFieldValidationStyle = (isValid, hasValue) => {
    if (!hasValue) return "ring-gray-200 border-gray-200";
    return isValid 
      ? "ring-emerald-200 border-emerald-300 bg-emerald-50/30" 
      : "ring-red-200 border-red-300 bg-red-50/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isSubmitSuccess ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-700 delay-200">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-4">
              Bienvenue à bord ! 🎉
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
            Votre compte a été créé avec succès. Connectons-vous !
            </p>
            <button className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 w-full">
              Continuer vers la connexion
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
               Créer un compte
              </h1>
              <p className="text-gray-600 mt-2">Join us and start your journey</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                 Rejoignez-nous et commencez votre aventure
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none ${getFieldValidationStyle(true, fullName)}`}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none ${getFieldValidationStyle(true, address)}`}
                  placeholder="Enter your address"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                   Le numéro de téléphone  
                </label>
                <input
                  type="text"
                  // pattern="^\d{10}$"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none`}
                  placeholder="Enter 10-digit phone number"
                />
                {/* {phoneNumber && !isPhoneNumberValid() && (
                  <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top duration-200">
                   Numéro de téléphone
                  </p>
                )} */}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                 Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 transition-all duration-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none bg-white"
                >
                  <option value="ADMIN">Rôle</option>
                  <option value="MANAGER">Admin</option>
                  <option value="STAFF">Manager</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Employé
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none ${getFieldValidationStyle(isEmailValid(), email)}`}
                  placeholder="Enter your email address"
                />
                {email && !isEmailValid() && (
                  <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top duration-200">
                    Veuillez entrer une adresse e-mail valide
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setIsPasswordTouched(true);
                    }}
                    className={`w-full px-4 py-4 pr-12 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none ${getFieldValidationStyle(isPasswordValid(), password)}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && !isPasswordValid() && (
                  <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top duration-200">
                    Le mot de passe doit comporter au moins 5 caractères
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showRetypePassword ? "text" : "password"}
                    required
                    value={retypePassword}
                    onChange={(e) => setRetypePassword(e.target.value)}
                    className={`w-full px-4 py-4 pr-12 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none ${getFieldValidationStyle(isPasswordMatch(), retypePassword)}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRetypePassword(!showRetypePassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showRetypePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="h-5">
                  {isPasswordTouched && retypePassword && !isPasswordMatch() && (
                    <p className="text-red-500 text-sm animate-in slide-in-from-top duration-200">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isDisableSubmit() || isLoading}
                className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Création du compte...
                  </>
                ) : (
                  <>
                    Créer un compte
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
              Vous avez déjà un compte ?{" "}
                <button className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-200 underline decoration-2 underline-offset-2">
                  Connectez-vous ici
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




























