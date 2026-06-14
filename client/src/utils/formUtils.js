export const inputCls = (err) =>
  `w-full border ${err ? 'border-red-400' : 'border-gray-200'} px-3 py-2.5 text-[15px] focus:outline-none focus:border-[#0A0A0A] transition-colors`

export const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)
