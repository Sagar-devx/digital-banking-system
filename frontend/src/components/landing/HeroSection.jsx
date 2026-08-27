import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Lock, CheckCircle } from 'lucide-react';

export default function HeroSection({ onOpenAccessModal }) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-emerald-300 blur-[100px] rounded-full mix-blend-multiply" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
              Next-Gen Neobanking
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Modern Banking Built for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-400">Digital World</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
              Experience secure, lightning-fast banking powered by a distributed event-driven architecture. Real-time transactions with intelligent fraud protection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/accounts/create"
                className="inline-flex justify-center items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:shadow-xl hover:shadow-primary-500/20 hover:-translate-y-1"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                onClick={onOpenAccessModal}
                className="inline-flex justify-center items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:shadow-md"
              >
                Access Existing
              </button>
            </div>
          </div>

          {/* Floating Dashboard Mockup */}
          <div className="relative lg:ml-auto w-full max-w-lg perspective-1000">
            <div className="relative bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl p-6 transform rotate-y-[-10deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Balance</p>
                  <h3 className="text-3xl font-bold text-gray-900">$124,500.00</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <ArrowRight className="w-5 h-5 transform rotate-45" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Salary Deposit</p>
                      <p className="text-xs text-gray-500">Today, 09:00 AM</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600">+$5,400.00</span>
                </div>
                
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                      <ArrowRight className="w-5 h-5 transform -rotate-45" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Apple Store</p>
                      <p className="text-xs text-gray-500">Yesterday, 14:30 PM</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">-$1,299.00</span>
                </div>
                
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Suspicious Activity</p>
                      <p className="text-xs text-orange-600">Blocked by Fraud Engine</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-400 line-through">-$8,500.00</span>
                </div>
              </div>
              
              {/* Decorative floating elements */}
              <div className="absolute -right-12 -top-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Transfer Secure</p>
                    <p className="text-xs text-gray-500">0ms latency</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
