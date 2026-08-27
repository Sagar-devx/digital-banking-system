import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function TransferOtpStep({
  otpValues,
  otpRefs,
  handleOtpChange,
  handleOtpKeyDown,
  handleVerifyOtp,
  error
}) {
  return (
    <form onSubmit={handleVerifyOtp} className="p-8 text-center space-y-8">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-10 h-10" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Security Verification</h3>
        <p className="text-gray-500 leading-relaxed">
          Our security system flagged this transfer. Please enter the 6-digit code sent to your email to authorize.
        </p>
      </div>
      
      <div className="flex justify-center gap-2 sm:gap-4">
        {otpValues.map((v, i) => (
          <input
            key={i}
            ref={el => {
              if (otpRefs && otpRefs.current) {
                otpRefs.current[i] = el;
              }
            }}
            type="text"
            maxLength={1}
            value={v}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => handleOtpKeyDown(i, e)}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 focus:bg-white"
          />
        ))}
      </div>

      {error && <p className="text-red-500 font-medium text-sm">{error}</p>}

      <button
        type="submit"
        disabled={otpValues.join('').length !== 6}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
      >
        Verify & Send
      </button>
    </form>
  );
}
