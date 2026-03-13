// ── data ─────────────────────────────────────────────────────
const UPDATES = [
  {id:1,title:'Child Rescued in Chennai',location:'Chennai, Tamil Nadu',time:'2 hrs ago',status:'Rescued',ashram:'Sneha Orphanage, Anna Nagar'},
  {id:2,title:'Team Dispatched to Madurai',location:'Madurai, Tamil Nadu',time:'5 hrs ago',status:'Active',ashram:null},
  {id:3,title:'Support Received – Coimbatore',location:'Coimbatore',time:'1 day ago',status:'Rescued',ashram:'Bala Mandir, RS Puram'},
  {id:4,title:'Report Under Review',location:'Trichy',time:'2 days ago',status:'Pending',ashram:null},
];
const ASHRAMS = [
  {id:1,name:'Sneha Orphanage',type:'Orphanage',dist:'1.2 km',address:'Anna Nagar, Chennai',phone:'+91 98400 12345',capacity:'45 children'},
  {id:2,name:'ChildLine India',type:'NGO',dist:'2.8 km',address:'T. Nagar, Chennai',phone:'1098',capacity:'Support only'},
  {id:3,name:'Rainbow Home',type:'Care Center',dist:'4.1 km',address:'Velachery, Chennai',phone:'+91 98765 43210',capacity:'32 children'},
  {id:4,name:'Bala Mandir',type:'Orphanage',dist:'5.5 km',address:'Kodambakkam, Chennai',phone:'+91 94440 55566',capacity:'60 children'},
];
const STATUS_BAR  = {Rescued:'#10b981',Active:'#f59e0b',Pending:'#ef4444'};
const STATUS_CHIP = {Rescued:'chip-rescued',Active:'chip-active',Pending:'chip-pending'};

// ── state ────────────────────────────────────────────────────
let S = {
  screen: localStorage.getItem('rc_user') ? 'home' : 'login',
  donateTab:'money',
  amount:null,
  step:1,
  photo:false,
  loc:'',
  desc:'',
  contact:'',
  gps:false,
  submitting:false,
  done:false,
  rid:Math.floor(Math.random()*9000+1000),
  filter:'All',
  // login state
  loginTab:'email',
  loginEmail:'',
  loginPass:'',
  loginPhone:'',
  loginOtp:'',
  otpSent:false,
  otpCode:'',
  loginError:'',
  loginLoading:false,
  user: JSON.parse(localStorage.getItem('rc_user')||'null'),
};

// ── helpers ──────────────────────────────────────────────────
const go = screen => { S.screen=screen; draw(); };
const e  = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function chip(status){
  return `<span class="chip ${STATUS_CHIP[status]||''}">${e(status)}</span>`;
}
function header(title,sub,back){
  return `<div class="page-header">
    <button class="back-btn" onclick="go('${back}')">←</button>
    <div>
      <div class="page-title">${e(title)}</div>
      ${sub?`<div class="page-sub">${e(sub)}</div>`:''}
    </div>
  </div>`;
}
function label(t){return `<div class="section-label">${e(t)}</div>`;}
function smallBtn(label,bg,color,extra=''){
  return `<button style="background:${bg};border:none;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:700;color:${color};flex-shrink:0;${extra}">${label}</button>`;
}

// ── LOGIN ────────────────────────────────────────────────────
function login(){
  const t=S.loginTab;
  return `<div class="fade-in" style="height:100%;display:flex;flex-direction:column">
    <div class="login-hero">
      <div class="hero-glow"></div>
      <div style="text-align:center;position:relative;z-index:1">
        <div style="font-size:48px;margin-bottom:10px">🌟</div>
        <div class="app-name" style="font-size:26px;margin-bottom:4px">RescueChild</div>
        <div class="app-sub" style="font-size:10px">Every child matters</div>
      </div>
    </div>
    <div class="content" style="flex:1;padding:20px 22px">
      <div style="font-size:20px;font-weight:700;color:#1c1917;margin-bottom:4px">Welcome</div>
      <div style="font-size:12px;color:#78716c;margin-bottom:18px">Sign in to continue protecting children</div>

      <div class="login-tabs">
        ${[['email','✉️','Email'],['phone','📱','Phone'],['google','G','Google']].map(([id,icon,lbl])=>`
          <button class="login-tab${t===id?' active':''}" onclick="S.loginTab='${id}';S.loginError='';draw()">
            <span class="login-tab-icon${id==='google'?' google-icon':''}">${icon}</span>
            <span>${lbl}</span>
          </button>`).join('')}
      </div>

      ${S.loginError?`<div class="login-error">⚠️ ${e(S.loginError)}</div>`:''}

      ${t==='email'?`
        <div style="margin-bottom:12px">
          <label class="login-label">Email Address</label>
          <input class="field" type="email" placeholder="you@example.com"
            value="${e(S.loginEmail)}" oninput="S.loginEmail=this.value;S.loginError=''"/>
        </div>
        <div style="margin-bottom:16px">
          <label class="login-label">Password</label>
          <input class="field" type="password" placeholder="Enter your password"
            value="${e(S.loginPass)}" oninput="S.loginPass=this.value;S.loginError=''"
            onkeydown="if(event.key==='Enter')doLogin('email')"/>
        </div>
        <button class="primary-btn" onclick="doLogin('email')" ${S.loginLoading?'disabled':''}>
          ${S.loginLoading?'Signing in…':'Sign In with Email ✉️'}
        </button>
        <div style="text-align:center;margin-top:12px">
          <span style="font-size:12px;color:#78716c">Don't have an account? </span>
          <button style="background:none;border:none;color:#f59e0b;font-size:12px;font-weight:700;text-decoration:underline" onclick="doLogin('email')">Sign Up</button>
        </div>
      `:''}

      ${t==='phone'?`
        <div style="margin-bottom:12px">
          <label class="login-label">Phone Number</label>
          <div style="display:flex;gap:8px">
            <div style="background:#f5f5f4;border:1.5px solid #e7e5e4;border-radius:12px;padding:12px 10px;font-size:14px;color:#1c1917;flex-shrink:0">🇮🇳 +91</div>
            <input class="field" type="tel" placeholder="Enter phone number" maxlength="10"
              value="${e(S.loginPhone)}" oninput="this.value=this.value.replace(/\\D/g,'');S.loginPhone=this.value;S.loginError='';var b=this.closest('.content').querySelector('.primary-btn');if(b)b.disabled=this.value.length<10"
              ${S.otpSent?'disabled':''}style="flex:1"/>
          </div>
        </div>
        ${!S.otpSent?`
          <button class="primary-btn" onclick="sendOtp()" ${S.loginLoading||S.loginPhone.length<10?'disabled':''}>
            ${S.loginLoading?'Sending…':'Send OTP 📱'}
          </button>
        `:`
          <div class="otp-sent-badge">✅ OTP sent to +91 ${e(S.loginPhone)}</div>
          <label class="login-label">Enter OTP</label>
          <input class="field" type="text" placeholder="Enter 4-digit OTP" maxlength="4"
            style="margin-bottom:14px;text-align:center;font-size:20px;letter-spacing:12px;font-weight:700"
            value="${e(S.loginOtp)}" oninput="this.value=this.value.replace(/\\D/g,'');S.loginOtp=this.value;S.loginError='';var b=this.closest('.content').querySelector('.primary-btn');if(b)b.disabled=this.value.length<4"
            onkeydown="if(event.key==='Enter')doLogin('phone')"/>
          <button class="primary-btn" onclick="doLogin('phone')" ${S.loginLoading||S.loginOtp.length<4?'disabled':''}>
            ${S.loginLoading?'Verifying…':'Verify & Sign In 🔐'}
          </button>
          <button class="ghost-btn" style="margin-top:8px;padding:10px" onclick="S.otpSent=false;S.loginOtp='';S.loginError='';draw()">← Change Number</button>
        `}
      `:''}

      ${t==='google'?`
        <div class="google-signin-wrap">
          <div style="font-size:56px;margin-bottom:14px">🔒</div>
          <div style="font-size:14px;color:#1c1917;font-weight:600;margin-bottom:6px">Quick & Secure</div>
          <div style="font-size:12px;color:#78716c;margin-bottom:20px;line-height:1.6">Sign in with your Google account for a faster, more secure experience</div>
          <button class="google-btn" onclick="doLogin('google')" ${S.loginLoading?'disabled':''}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            ${S.loginLoading?'Connecting…':'Continue with Google'}
          </button>
        </div>
      `:''}
    </div>
  </div>`;
}

// ── LOGIN ACTIONS ────────────────────────────────────────────
function sendOtp(){
  if(S.loginPhone.length<10){S.loginError='Enter a valid 10-digit number';draw();return;}
  S.loginLoading=true;draw();
  S.otpCode=String(Math.floor(1000+Math.random()*9000));
  setTimeout(()=>{
    S.loginLoading=false;
    S.otpSent=true;
    S.loginError='';
    draw();
    alert('Your OTP is: '+S.otpCode+' (demo only)');
  },1200);
}

function doLogin(method){
  S.loginError='';
  if(method==='email'){
    if(!S.loginEmail||!S.loginEmail.includes('@')){S.loginError='Please enter a valid email address';draw();return;}
    if(S.loginPass.length<6){S.loginError='Password must be at least 6 characters';draw();return;}
    S.loginLoading=true;draw();
    setTimeout(()=>{
      S.user={name:S.loginEmail.split('@')[0],email:S.loginEmail,method:'email'};
      finishLogin();
    },1000);
  } else if(method==='phone'){
    if(S.loginOtp!==S.otpCode){S.loginError='Invalid OTP. Please try again.';draw();return;}
    S.loginLoading=true;draw();
    setTimeout(()=>{
      S.user={name:'User',phone:'+91 '+S.loginPhone,method:'phone'};
      finishLogin();
    },800);
  } else if(method==='google'){
    S.loginLoading=true;draw();
    setTimeout(()=>{
      S.user={name:'Sanjeem',email:'sanjeem@gmail.com',method:'google',avatar:'🧑'};
      finishLogin();
    },1500);
  }
}

function finishLogin(){
  localStorage.setItem('rc_user',JSON.stringify(S.user));
  S.loginLoading=false;
  S.screen='home';
  draw();
}

function doLogout(){
  localStorage.removeItem('rc_user');
  S.user=null;
  S.screen='login';
  S.loginTab='email';S.loginEmail='';S.loginPass='';S.loginPhone='';S.loginOtp='';S.otpSent=false;S.loginError='';
  draw();
}

// ── HOME ─────────────────────────────────────────────────────
function home(){
  const u=S.user;
  return `<div class="fade-in">
    <div class="hero">
      <div class="hero-glow"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="font-size:28px">🌟</span>
        <div style="flex:1"><div class="app-name">RescueChild</div><div class="app-sub">Every child matters</div></div>
        ${u?`<button onclick="doLogout()" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.15);color:#fef3c7;border-radius:10px;padding:6px 10px;font-size:10px;font-family:monospace;display:flex;align-items:center;gap:5px;flex-shrink:0">
          <span style="font-size:14px">${u.avatar||'👤'}</span> Logout
        </button>`:''}
      </div>
      ${u?`<div style="background:rgba(245,158,11,0.13);border-radius:10px;padding:8px 12px;margin-bottom:10px;display:flex;align-items:center;gap:8px">
        <span style="font-size:20px">${u.avatar||'👤'}</span>
        <div>
          <div style="color:#fef3c7;font-size:13px;font-weight:600">Hello, ${e(u.name)}!</div>
          <div style="color:#a8956e;font-size:10px">${e(u.email||u.phone||'')} · via ${e(u.method)}</div>
        </div>
      </div>`:''}
      <div class="hero-title">Protect.<br>Rescue.<br><span>Restore.</span></div>
      <div class="hero-desc">Connecting communities to safeguard vulnerable children across India.</div>
      <div class="alert-banner"><span>🔔</span><span>3 active rescue operations nearby — Chennai region</span></div>
    </div>
    <div class="content">
      ${label('Emergency Actions')}
      <button class="action-btn" style="background:#ef4444;color:#fff;box-shadow:0 4px 18px rgba(239,68,68,0.35)" onclick="go('report')">
        <span style="font-size:24px">🚨</span>
        <div style="flex:1"><div>Report a Child</div><div style="font-size:11px;font-weight:400;opacity:0.82;margin-top:2px">Spotted a child in danger? Act now</div></div>
        <span style="opacity:0.6">→</span>
      </button>
      ${label('Support & Explore')}
      <button class="action-btn" style="background:#f59e0b;color:#1c1917;box-shadow:0 4px 18px rgba(245,158,11,0.35)" onclick="go('donate')">
        <span style="font-size:24px">💛</span>
        <div style="flex:1"><div>Donate</div><div style="font-size:11px;font-weight:400;opacity:0.82;margin-top:2px">Money, food, clothes, books</div></div>
        <span style="opacity:0.6">→</span>
      </button>
      <button class="action-btn" style="background:#a3e635;color:#1c1917;box-shadow:0 4px 18px rgba(163,230,53,0.35)" onclick="go('ashrams')">
        <span style="font-size:24px">🏛️</span>
        <div style="flex:1"><div>Nearby Ashrams</div><div style="font-size:11px;font-weight:400;opacity:0.82;margin-top:2px">NGOs, orphanages, care centers</div></div>
        <span style="opacity:0.6">→</span>
      </button>
      ${label('Recent Rescue Updates')}
      ${UPDATES.slice(0,2).map(u=>`
        <div class="update-card" style="border-left:4px solid ${STATUS_BAR[u.status]};cursor:pointer" onclick="go('updates')">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px">
            <div style="font-weight:700;font-size:13px;color:#1c1917;flex:1">${e(u.title)}</div>
            ${chip(u.status)}
          </div>
          <div style="font-size:11px;color:#78716c">📍 ${e(u.location)} · ${e(u.time)}</div>
        </div>`).join('')}
      <button class="ghost-btn" style="margin-top:4px" onclick="go('updates')">View All Updates →</button>
    </div>
  </div>`;
}

// ── REPORT ───────────────────────────────────────────────────
function report(){
  if(S.done) return `<div class="fade-in">
    ${header('Report a Child','Your report can save a life','home')}
    <div class="success-wrap">
      <div style="font-size:64px;margin-bottom:16px">✅</div>
      <div style="font-size:20px;font-weight:700;color:#065f46;margin-bottom:8px">Report Submitted!</div>
      <div style="font-size:13px;color:#78716c;line-height:1.7;margin-bottom:24px">
        Report <strong>#RC-${S.rid}</strong> has been received.<br>Our team will respond within 30 minutes.
      </div>
      <div class="next-steps">
        <div style="font-size:12px;font-weight:700;color:#d97706;margin-bottom:8px">What happens next?</div>
        ${['Team reviews your report','Field rescue team dispatched','Child moved to safe shelter','You receive status updates'].map((s,i)=>`<div style="font-size:12px;color:#92400e;line-height:1.9">${i+1}. ${e(s)}</div>`).join('')}
      </div>
      <button class="primary-btn" onclick="resetReport()">← Back to Home</button>
    </div>
  </div>`;

  if(S.submitting) return `<div class="fade-in">
    ${header('Report a Child','Your report can save a life','home')}
    <div style="padding:50px 24px;text-align:center">
      <div style="font-size:56px;margin-bottom:16px">⏳</div>
      <div style="font-size:16px;font-weight:700;color:#1c1917">Submitting your report…</div>
      <div style="font-size:12px;color:#78716c;margin-top:8px">Please wait a moment</div>
    </div>
  </div>`;

  return `<div class="fade-in">
    ${header('Report a Child','Your report can save a life','home')}
    <div class="content">
      <div class="progress-bar">
        <div class="progress-seg" style="background:${S.step>=1?'#f59e0b':'#e7e5e4'}"></div>
        <div class="progress-seg" style="background:${S.step>=2?'#f59e0b':'#e7e5e4'}"></div>
      </div>
      ${S.step===1 ? `
        ${label('Step 1 — Photo & Location')}
        <div class="upload-box" onclick="S.photo=true;draw()">
          ${S.photo
            ?`<div style="font-size:40px;margin-bottom:8px">✅</div><div style="font-size:14px;color:#f59e0b;font-weight:700">Photo Ready</div>`
            :`<div style="font-size:40px;margin-bottom:8px">📷</div>
              <div style="font-size:14px;color:#78716c">Tap to upload photo</div>
              <div style="font-size:11px;color:#a8a29e;margin-top:4px">JPG, PNG up to 10MB</div>`}
        </div>
        ${label('Location')}
        <div style="position:relative;margin-bottom:12px">
          <input class="field" style="padding-right:110px" placeholder="Auto-detect or type location"
            value="${e(S.loc)}" oninput="S.loc=this.value"/>
          <button onclick="detectGPS()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:#f59e0b;border:none;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;color:#1c1917">
            ${S.gps?'⏳':'📍 GPS'}
          </button>
        </div>
        ${S.loc?`<div class="gps-success">✅ ${e(S.loc)}</div>`:''}
        <button class="primary-btn" onclick="S.step=2;draw()">Next →</button>
      ` : `
        ${label('Step 2 — Description & Contact')}
        <textarea class="field" style="resize:none;height:88px;margin-bottom:12px"
          placeholder="📝 Describe the child's condition, approximate age, clothing and other details…"
          oninput="S.desc=this.value">${e(S.desc)}</textarea>
        <input class="field" style="margin-bottom:10px" placeholder="📞 Your contact number (optional)"
          value="${e(S.contact)}" oninput="S.contact=this.value"/>
        <div style="font-size:11px;color:#78716c;line-height:1.6;margin-bottom:16px">
          🔒 Your identity is kept confidential. Contact used only for follow-up.
        </div>
        <div style="display:flex;gap:8px">
          <button class="ghost-btn" style="flex:1;padding:14px" onclick="S.step=1;draw()">← Back</button>
          <button class="primary-btn" style="flex:2;margin-top:0" onclick="submitReport()">Submit Report 🚨</button>
        </div>
      `}
    </div>
  </div>`;
}

// ── DONATE ───────────────────────────────────────────────────
function donate(){
  const t=S.donateTab;
  return `<div class="fade-in">
    ${header('Donate','Every contribution changes a life','home')}
    <div class="content">
      <div class="stats-grid" style="margin-bottom:16px">
        <div class="card" style="text-align:center">
          <div style="font-size:20px;font-weight:800;color:#f59e0b">₹5,000</div>
          <div style="font-size:10px;color:#78716c;margin-top:3px">Total Donated</div>
        </div>
        <div class="card" style="text-align:center">
          <div style="font-size:20px;font-weight:800;color:#10b981">312</div>
          <div style="font-size:10px;color:#78716c;margin-top:3px">Lives Touched</div>
        </div>
      </div>
      <div class="donate-tabs">
        ${[['money','💰','Money'],['food','🍱','Food'],['clothes','👕','Clothes'],['books','📚','Books']].map(([id,icon,lbl])=>`
          <button class="donate-tab${t===id?' active':''}" onclick="S.donateTab='${id}';draw()">
            <div style="font-size:18px">${icon}</div>
            <div style="margin-top:2px">${lbl}</div>
          </button>`).join('')}
      </div>

      ${t==='money'?`
        ${label('Choose Amount')}
        <div class="amount-grid">
          ${[100,500,1000].map(n=>`<button class="amount-btn${S.amount===n?' sel':''}" onclick="S.amount=${n};draw()">₹${n}</button>`).join('')}
        </div>
        <input class="field" type="number" placeholder="₹ Custom amount" style="margin-bottom:12px"/>
        <div class="tip-box">💡 ₹500 feeds a child for a month · ₹1000 covers a month of education</div>
        <button class="primary-btn">💛 Donate ${S.amount?'₹'+S.amount:'Now'}</button>
        <button class="outline-btn" onclick="go('tracking')">📊 View Donation Tracking</button>
      `:''}

      ${t==='food'?[
        ['Daily Meal Kit','Rice, dal, vegetables for 1 day','₹80'],
        ['Weekly Supply','Nutritious meals for 7 days','₹500'],
        ['Monthly Package','Complete nutrition for a month','₹1800'],
      ].map(([lbl,desc,price])=>`
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
            <div style="flex:1">
              <div style="font-weight:700;font-size:14px;color:#1c1917">🍱 ${e(lbl)}</div>
              <div style="font-size:11px;color:#78716c;margin-top:3px">${e(desc)}</div>
            </div>
            ${smallBtn(price,'#f59e0b','#1c1917')}
          </div>
        </div>`).join(''):''}

      ${t==='clothes'?`
        ${[['👶','0–5 years','Infant & toddler clothing sets'],
           ['🧒','6–12 years','School uniform & casual wear'],
           ['👦','13–17 years','Teen clothing & accessories']].map(([icon,age,desc])=>`
          <div class="card">
            <div style="display:flex;gap:12px;align-items:center">
              <span style="font-size:28px">${icon}</span>
              <div style="flex:1">
                <div style="font-weight:700;font-size:14px;color:#1c1917">Age ${e(age)}</div>
                <div style="font-size:11px;color:#78716c;margin-top:2px">${e(desc)}</div>
              </div>
              ${smallBtn('Add','#f59e0b','#1c1917')}
            </div>
          </div>`).join('')}
        <button class="primary-btn" style="margin-top:4px">Schedule Pickup 👕</button>
      `:''}

      ${t==='books'?[
        ['📗','Primary School Set','Textbooks Grade 1–5 + notebooks'],
        ['📘','Middle School Set','Textbooks Grade 6–8 + stationery'],
        ['✏️','Stationery Pack','Pens, pencils, erasers, ruler'],
      ].map(([icon,lbl,desc])=>`
        <div class="card">
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:28px">${icon}</span>
            <div style="flex:1">
              <div style="font-weight:700;font-size:14px;color:#1c1917">${e(lbl)}</div>
              <div style="font-size:11px;color:#78716c;margin-top:2px">${e(desc)}</div>
            </div>
            ${smallBtn('Donate','#f59e0b','#1c1917')}
          </div>
        </div>`).join(''):''}
    </div>
  </div>`;
}

// ── ASHRAMS ──────────────────────────────────────────────────
function ashrams(){
  const pins=[{top:'28%',left:'32%',lbl:'Sneha'},{top:'52%',left:'58%',lbl:'ChildLine'},{top:'18%',left:'62%',lbl:'Rainbow'},{top:'62%',left:'22%',lbl:'Bala'}];
  return `<div class="fade-in">
    ${header('Nearby Ashrams','Orphanages, NGOs & Care Centers','home')}
    <div class="content">
      <div class="map-box">
        <div class="map-grid"></div>
        ${pins.map(p=>`
          <div class="map-pin-wrap" style="top:${p.top};left:${p.left}">
            <div class="map-pin"><span>📍</span></div>
            <div class="map-label">${e(p.lbl)}</div>
          </div>`).join('')}
        <div class="map-loc">📍 Chennai, Tamil Nadu</div>
        <div class="map-count">4 nearby</div>
      </div>
      ${label('Centers Near You')}
      ${ASHRAMS.map(a=>`
        <div class="card">
          <div style="display:flex;gap:12px">
            <div style="background:rgba(245,158,11,0.15);border-radius:12px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">
              ${a.type==='NGO'?'🏢':a.type==='Orphanage'?'🏠':'🌿'}
            </div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div style="font-weight:700;font-size:14px;color:#1c1917">${e(a.name)}</div>
                <div style="font-size:11px;color:#f59e0b;font-weight:700">${e(a.dist)}</div>
              </div>
              <div class="ashram-type">${e(a.type)}</div>
              <div style="font-size:11px;color:#78716c;margin-top:6px">📍 ${e(a.address)}</div>
              <div style="font-size:11px;color:#78716c;margin-top:2px">📞 ${e(a.phone)} · 👶 ${e(a.capacity)}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button style="flex:1;background:#f5f5f4;border:none;border-radius:10px;padding:9px;font-size:12px;font-weight:600">📞 Call</button>
            <button style="flex:1;background:#f59e0b;border:none;border-radius:10px;padding:9px;font-size:12px;font-weight:700;color:#1c1917">🗺️ Directions</button>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

// ── UPDATES ──────────────────────────────────────────────────
function updates(){
  const f=S.filter;
  const list=f==='All'?UPDATES:UPDATES.filter(u=>u.status===f);
  return `<div class="fade-in">
    ${header('Rescue Updates','Live status from the field','home')}
    <div class="content">
      <div class="filter-row">
        ${['All','Rescued','Active','Pending'].map(v=>`
          <button class="filter-btn${f===v?' active':''}" onclick="S.filter='${v}';draw()">${v}</button>`).join('')}
      </div>
      ${list.length===0
        ?`<div style="text-align:center;padding:32px;color:#78716c;font-size:14px">No updates for this filter.</div>`
        :list.map(u=>{
          const bar=STATUS_BAR[u.status]||'#ccc';
          const fills=[0,1,2].map(i=>{
            const on=u.status==='Rescued'?true:u.status==='Active'?i<2:i<1;
            return `<div class="prog-fill" style="background:${on?bar:'#e7e5e4'}"></div>`;
          }).join('');
          return `<div class="update-card" style="border-left:4px solid ${bar}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px">
              <div style="font-weight:700;font-size:14px;color:#1c1917;flex:1">${e(u.title)}</div>
              ${chip(u.status)}
            </div>
            <div style="font-size:11px;color:#78716c;margin-bottom:4px">📍 ${e(u.location)}</div>
            <div style="font-size:11px;color:#78716c">🕐 ${e(u.time)}</div>
            ${u.ashram?`<div style="background:#d1fae5;border-radius:10px;padding:8px 12px;margin-top:10px;font-size:11px;color:#065f46">🏠 Moved to: ${e(u.ashram)}</div>`:''}
            <div class="prog-track">${fills}</div>
            <div class="prog-labels"><span>REPORTED</span><span>DISPATCHED</span><span>RESCUED</span></div>
          </div>`;
        }).join('')}
    </div>
  </div>`;
}

// ── TRACKING ─────────────────────────────────────────────────
function tracking(){
  return `<div class="fade-in">
    ${header('Donation Tracking','Your impact at a glance','donate')}
    <div class="content">
      <div class="impact-hero">
        <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(245,158,11,0.13);pointer-events:none"></div>
        <div style="font-size:11px;color:#a8956e;margin-bottom:6px;font-family:monospace;letter-spacing:1px">TOTAL IMPACT</div>
        <div style="font-size:36px;font-weight:800;color:#f59e0b">₹5,000</div>
        <div style="font-size:12px;color:#a8956e;margin-top:4px">From 42 donors this month</div>
      </div>
      <div class="stats-grid">
        ${[['🍱','12','Food Kits','#10b981'],['👕','8','Clothes Sets','#3b82f6'],['📚','24','Books','#8b5cf6'],['👧','18','Children','#ef4444']].map(([icon,n,lbl,color])=>`
          <div class="stat-card">
            <div style="font-size:26px">${icon}</div>
            <div style="font-size:22px;font-weight:800;color:${color};margin-top:4px">${n}</div>
            <div style="font-size:10px;color:#78716c">${lbl}</div>
          </div>`).join('')}
      </div>
      ${label('Recent Transactions')}
      ${[['💰 Money Donated','₹1000','Today 9:41 AM','Anonymous'],
         ['🍱 Food Kit','Weekly Pack','Yesterday','Rajan K.'],
         ['📚 Books','Middle School Set','Mar 10','Priya S.'],
         ['👕 Clothes','Age 6–12 Set','Mar 8','Anonymous']].map(([type,amt,time,who])=>`
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div style="font-weight:600;font-size:13px;color:#1c1917">${e(type)}</div>
            <div style="font-weight:700;font-size:13px;color:#f59e0b">${e(amt)}</div>
          </div>
          <div style="font-size:11px;color:#78716c;margin-top:4px">By ${e(who)} · ${e(time)}</div>
        </div>`).join('')}
    </div>
  </div>`;
}

// ── actions ──────────────────────────────────────────────────
function detectGPS(){
  if(S.gps)return;
  S.gps=true; draw();
  setTimeout(()=>{S.loc='13.0827° N, 80.2707° E — Chennai, Tamil Nadu';S.gps=false;draw();},1800);
}
function submitReport(){
  S.submitting=true; draw();
  setTimeout(()=>{S.submitting=false;S.done=true;draw();},1400);
}
function resetReport(){
  Object.assign(S,{screen:'home',step:1,photo:false,loc:'',desc:'',contact:'',gps:false,submitting:false,done:false,rid:Math.floor(Math.random()*9000+1000)});
  draw();
}

// ── render ───────────────────────────────────────────────────
const NAV=[['home','🏠','Home'],['report','🚨','Report'],['donate','💛','Donate'],['ashrams','📍','Near'],['updates','📡','Updates']];

function draw(){
  const sc=document.getElementById('screen');
  const nv=document.getElementById('nav');
  if(!sc||!nv)return;

  const renders={login,home,report,donate,ashrams,updates,tracking};
  sc.innerHTML=(renders[S.screen]||home)();
  sc.scrollTop=0;

  // hide nav on login screen
  if(S.screen==='login'){
    nv.style.display='none';
  } else {
    nv.style.display='';
    const activeNav=S.screen==='tracking'?'donate':S.screen;
    nv.innerHTML=NAV.map(([id,icon,lbl])=>`
      <button class="nav-btn${activeNav===id?' active':''}" onclick="go('${id}')">
        <span class="nav-icon">${icon}</span>
        <span class="nav-label">${lbl}</span>
      </button>`).join('');
  }
}

draw();

// ── live clock ───────────────────────────────────────────────
function updateClock(){
  const now=new Date();
  let h=now.getHours(), m=now.getMinutes();
  const el=document.getElementById('live-time');
  if(el) el.textContent=h+':'+(m<10?'0':'')+m;
}
updateClock();
setInterval(updateClock,1000);