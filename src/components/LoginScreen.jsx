import React from 'react';

const LoginScreen = ({ email, setEmail, password, setPassword, loginAttempts, lockoutUntil, handleLogin, setIsDemo }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-sm border border-slate-100 dark:border-slate-700/60">
        <div className="text-center mb-8">
          <div className="bg-blue-50 dark:bg-slate-900 p-3 rounded-xl w-24 h-24 mx-auto flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Bel Ajar Logo" 
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/3429/3429149.png'; }} 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-[14pt] font-bold text-slate-900 dark:text-slate-100 tracking-tight">Bel Ajar</h1>
          <p className="text-[10.5pt] text-slate-500 dark:text-slate-400 font-medium mt-1">Jurnal Mengajar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[10.5pt] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Email / Username</label>
            <input 
              type="email" placeholder="guru@smp.sch.id" 
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10.5pt] font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={email} onChange={e => setEmail(e.target.value)} required 
            />
          </div>
          <div>
            <label className="text-[10.5pt] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Password</label>
            <input 
              type="password" placeholder="••••••••" 
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10.5pt] font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={password} onChange={e => setPassword(e.target.value)} required 
            />
          </div>

          {loginAttempts > 0 && loginAttempts < 3 && (
            <p className="text-[10.5pt] text-amber-600 font-semibold text-center">⚠️ Sisa Login: {3 - loginAttempts}x</p>
          )}

          <button 
            type="submit" 
            disabled={!!lockoutUntil}
            className={`w-full text-white py-3 rounded-xl font-bold text-[10.5pt] transition-all ${
              lockoutUntil ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {lockoutUntil ? 'Akses Diblokir (24 Jam)' : 'Masuk'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsDemo(true)} className="text-[10.5pt] text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors">
            Mode Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
