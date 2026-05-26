import { useState, useRef, useEffect, useCallback, useMemo } from "react";

const BACKEND_URL = "https://rotapilot.onrender.com";

const F = {
  dark:"#1a3d2b", mid:"#2d6a4f", amber:"#d97706", amberL:"#f59e0b",
  amberP:"#fffbeb", cream:"#fdfcf8", warm:"#f5f0e8",
  text:"#1c1a14", textM:"#3d3728", textL:"#78716c", textD:"#a8a29e",
  border:"rgba(26,61,43,0.11)", borderM:"rgba(26,61,43,0.2)",
  shadow:"0 2px 16px rgba(26,61,43,0.07)", red:"#dc2626", redP:"#fef2f2",
};

const Shield = ({ size=40 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
    <rect width="56" height="56" rx="13" fill={F.dark}/>
    <path d="M28 11 L42 17 L42 31 Q42 41 28 47 Q14 41 14 31 L14 17 Z" fill={F.mid} opacity="0.35" stroke={F.amber} strokeWidth="1.8"/>
    <path d="M28 15 L39 20 L39 31 Q39 39 28 44 Q17 39 17 31 L17 20 Z" fill={F.amber} opacity="0.1"/>
    <path d="M21 28 L26 33 L35 23" stroke={F.amberL} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Logo = ({ size=40, light=false, tag=true, onClick }) => (
  <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, cursor:onClick?"pointer":"default" }}>
    <Shield size={size}/>
    <div style={{ lineHeight:1 }}>
      <div style={{ fontSize:Math.round(size*0.48), fontWeight:900, letterSpacing:-0.5, lineHeight:1 }}>
        <span style={{ color:light?"white":F.dark }}>Rota</span>
        <span style={{ color:F.amber }}>Pilot</span>
      </div>
      {tag && <div style={{ fontSize:Math.round(size*0.26), color:light?"rgba(255,255,255,0.55)":F.textL, marginTop:3, fontWeight:400 }}>Smarter care rostering</div>}
    </div>
  </div>
);

const DEMO_ACCOUNTS = [
  { email:"demo@abilityfirst.com.au", password:"demo123", org:"Ability First Care", plan:"Growth", workers:15, participants:12, location:"Melbourne" },
  { email:"admin@sunrise.com.au", password:"trial123", org:"Sunrise Support Services", plan:"Starter", workers:8, participants:6, location:"Sydney" },
];

const QUALIFICATIONS = ["Medication Administration","Manual Handling","Hoist Operation","Complex Behaviour Support","First Aid","Mental Health Support","Autism Specialist","Epilepsy Management"];
const SUPPORT_NEEDS = ["Medication Assistance","Hoist Transfer","Complex Behaviour","Seizure Management","Communication Support","Personal Care","Meal Preparation","Community Access"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const TUTORIAL_STEPS = [
  { title:"Welcome to RotaPilot", desc:"RotaPilot is your smart rostering partner for disability and aged care. Ask questions, handle crises, get SCHADS guidance, and draft communications - all in plain English.", tip:"You can type or use voice input. RotaPilot understands natural language - no special commands needed.", demo:"Try: 'My worker Marcus just called in sick for his 6am shift. David needs medication at 7am. What do I do?'" },
  { title:"Set up your team", desc:"Add your workers and participants once. RotaPilot remembers their qualifications, availability, support needs, and preferences - so you never have to explain them again.", tip:"Go to the Team tab. Add workers with their qualifications and available days. Add participants with their support needs and emergency contact.", demo:"Once set up, type 'Marcus cancelled 6am David' and RotaPilot instantly knows who they are, what David needs, and which workers can cover." },
  { title:"Handling cancellations", desc:"When a worker cancels, describe the situation or tap the microphone and speak. RotaPilot identifies the right replacement, drafts your communications, and helps you document the incident - all in one response.", tip:"The more detail you give, the better the response. Include participant name, time, and any specific needs.", demo:"'Jenny cancelled tonight. Sarah has complex behaviour support needs and prefers female workers. Who can cover?'" },
  { title:"SCHADS guidance", desc:"RotaPilot walks through every SCHADS calculation step by step in plain English. Penalty rates, overtime, broken shifts, casual loading - described so you understand the reasoning, not just the answer.", tip:"Always confirm calculations with Fair Work Australia. RotaPilot provides guidance, not legal advice.", demo:"'My casual worker did a Sunday shift after working 38 hours this week. What do I pay?'" },
  { title:"Communications", desc:"Every stakeholder message drafted in the right tone - workers, families, coordinators, management. Describe the situation and who needs to be contacted. RotaPilot writes it.", tip:"Tell RotaPilot who the message is for and the key information. It handles tone, format, and professional language.", demo:"'Draft a message to David's family. His regular worker is sick today. Jenny is covering and will arrive at 6:15am.'" },
  { title:"Audit readiness", desc:"Ask RotaPilot what documentation you need for any shift type, what auditors look for, and how to structure your records. Build good habits every week - so an audit never catches you off guard.", tip:"Ask every Monday: 'What documentation do I need to check this week?' - builds compliance habits before an audit arrives.", demo:"'What records does the NDIS Commission look for in a rostering audit?'" },
  { title:"You are ready", desc:"RotaPilot is here every time you need it - Sunday night emergencies, Monday morning SCHADS questions, or building next week's roster. Your team. Confident. Every shift.", tip:"Save RotaPilot as a browser bookmark for instant access. The faster you can get to it in a crisis, the better.", demo:"You are all set. Go to the Chat tab and describe your current rostering situation." },
];

const LEGAL_TEXT = [
  ["Terms of Use", "RotaPilot is built for rostering coordinators. It gives you the right information at the right moment — and points you to the right expert when a question goes beyond rostering. It is not a substitute for legal, payroll, or compliance advice. All roster recommendations require human review before implementation."],
  ["Privacy", "Worker and participant profiles are stored in your browser only and never transmitted to RotaPilot servers. Chat conversations are processed by Anthropic AI to generate responses and are not stored or used for AI training. Emergency contacts and sensitive information never leave your device."],
  ["Limitations", "RotaPilot is a decision support tool. It does not replace qualified HR advice, legal counsel, or payroll processing. Providers remain responsible for all rostering decisions, award compliance, and participant safety. In any emergency, call 000 immediately."],
  ["Data Security", "Your team profiles and session history are stored locally in your browser. Clearing browser data will remove this information. We recommend downloading your team profiles regularly from the Settings tab as a backup."],
];

export default function App() {
  const [page, setPage] = useState("landing");
  const [client, setClient] = useState(null);
  const [tab, setTab] = useState("chat");
  const [darkMode, setDarkMode] = useState(true);
  const [showLegal, setShowLegal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [sTab, setSTab] = useState("workers");
  const [showWF, setShowWF] = useState(false);
  const [showPF, setShowPF] = useState(false);
  const [tutStep, setTutStep] = useState(0);
  const [nw, setNw] = useState({ name:"", phone:"", type:"casual", travelMins:20, quals:[], days:[], notes:"" });
  const [np, setNp] = useState({ name:"", address:"", gender:"any", medTime:"", emergencyName:"", emergencyPhone:"", needs:[], notes:"" });
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const save = (w, p) => {
    localStorage.setItem("rp_workers", JSON.stringify(w));
    localStorage.setItem("rp_participants", JSON.stringify(p));
  };

  useEffect(() => {
    const w = localStorage.getItem("rp_workers");
    const p = localStorage.getItem("rp_participants");
    const s = localStorage.getItem("rp_sessions");
    const t = localStorage.getItem("rp_terms");
    try { if (w) setWorkers(JSON.parse(w)); } catch { setWorkers([]); }
    try { if (p) setParticipants(JSON.parse(p)); } catch { setParticipants([]); }
    try { if (s) setSessions(JSON.parse(s)); } catch { setSessions([]); }
    if (t) setTermsAccepted(true);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs]);

  useEffect(() => {
    if (!client || msgs.length === 0) return;
    const timeout = setTimeout(() => {
      const preview = typeof msgs[0]?.content === "string" ? msgs[0].content.slice(0,55) + "..." : "New conversation";
      const session = { id: currentSession || Date.now(), org: client.org, preview, date: new Date().toLocaleDateString("en-AU"), msgs };
      const updated = currentSession
        ? sessions.map(s => s.id === currentSession ? session : s)
        : [session, ...sessions.slice(0,19)];
      setSessions(updated);
      if (!currentSession) setCurrentSession(session.id);
      localStorage.setItem("rp_sessions", JSON.stringify(updated));
    }, 500);
    return () => clearTimeout(timeout);
  }, [msgs]);

  // Builds context object for backend
  const buildContext = useCallback(() => ({
    org: client?.org,
    location: client?.location,
    plan: client?.plan,
    workers: client?.workers,
    participants: client?.participants,
    workerProfiles: workers,
    participantProfiles: participants,
  }), [client, workers, participants]);

  const send = useCallback(async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput("");
    const userMsg = { role:"user", content:msg };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          messages: next.map(m => ({ role:m.role, content:m.content })),
          context: buildContext(),
        })
      });
      if (!res.ok) throw new Error("API error " + res.status);
      const data = await res.json();
      const reply = data.reply || "No response received.";
      setMsgs([...next, { role:"assistant", content:reply }]);
    } catch {
      setMsgs([...next, { role:"assistant", content:"Connection error. Please try again." }]);
    }
    setLoading(false);
  }, [msgs, input, loading, buildContext]);

  const copy = (id, text) => {
    navigator.clipboard.writeText(typeof text === "string" ? text : JSON.stringify(text, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyR = (t) => {
    const rows = t.split("\n").filter(l => l.includes("|"));
    navigator.clipboard.writeText(rows.join("\n"));
    setCopiedId("r");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const voice = () => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input requires Chrome browser."); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = false;
    r.onstart = () => setIsRecording(true);
    r.onend = () => setIsRecording(false);
    r.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); setTimeout(() => send(t), 300); };
    r.onerror = () => { setIsRecording(false); alert("Voice error. Please try again."); };
    r.start();
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const mime = file.type;
    const r = new FileReader();
    r.onload = async (e) => {
      const b64 = e.target.result.split(",")[1];
      const imageMsg = {
        role:"user",
        content:[
          { type:"image", source:{ type:"base64", media_type:mime, data:b64 } },
          { type:"text", text:input||"Please analyse this image in the context of rostering." }
        ]
      };
      const next = [...msgs, imageMsg];
      setMsgs(next);
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/chat`, {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({
            messages: next.map(m => ({ role:m.role, content:m.content })),
            context: buildContext(),
          })
        });
        const data = await res.json();
        setMsgs([...next, { role:"assistant", content:data.reply || "No response received." }]);
      } catch {
        setMsgs([...next, { role:"assistant", content:"Connection error." }]);
      }
      setLoading(false);
    };
    r.readAsDataURL(file);
  };

  const addW = () => {
    if (!nw.name.trim()) return;
    const u = [...workers, {...nw, id:Date.now()}];
    setWorkers(u); save(u, participants);
    setNw({ name:"", phone:"", type:"casual", travelMins:20, quals:[], days:[], notes:"" });
    setShowWF(false);
  };

  const remW = (id) => { const u = workers.filter(w => w.id !== id); setWorkers(u); save(u, participants); };

  const addP = () => {
    if (!np.name.trim()) return;
    const u = [...participants, {...np, id:Date.now()}];
    setParticipants(u); save(workers, u);
    setNp({ name:"", address:"", gender:"any", medTime:"", emergencyName:"", emergencyPhone:"", needs:[], notes:"" });
    setShowPF(false);
  };

  const remP = (id) => { const u = participants.filter(p => p.id !== id); setParticipants(u); save(workers, u); };

  const login = () => {
    const found = DEMO_ACCOUNTS.find(a => a.email === email && a.password === pass);
    if (found) {
      setClient(found);
      if (!termsAccepted) { setShowTermsPopup(true); } else { setPage("app"); }
      setLoginErr("");
    } else {
      setLoginErr("Invalid email or password. Try demo@abilityfirst.com.au / demo123");
    }
  };

  const acceptTerms = () => {
    setTermsAccepted(true);
    localStorage.setItem("rp_terms","1");
    setShowTermsPopup(false);
    setPage("app");
  };

  const DM = darkMode ? {
    appBg:"#0a1a0f", chatBg:"linear-gradient(160deg,#0a1a0f,#0f2419)", tabBg:"#0f1f15",
    tabBorder:"1px solid rgba(255,255,255,0.08)", contentBg:"#0f1f15",
    sidebarBg:"#080f0a", sidebarBorder:"1px solid rgba(255,255,255,0.08)",
    msgAssistBg:"rgba(255,255,255,0.07)", msgAssistColor:"rgba(255,255,255,0.92)",
    msgAssistBorder:"1px solid rgba(255,255,255,0.1)",
    inputAreaBg:"#080f0a", inputAreaBorder:"1px solid rgba(255,255,255,0.08)",
    inputBoxBg:"rgba(255,255,255,0.06)", inputBoxBorder:"1.5px solid rgba(255,255,255,0.15)",
    inputColor:"white", btnBg:"rgba(255,255,255,0.1)", btnBorder:"1px solid rgba(255,255,255,0.2)",
    btnColor:"white", privacyBg:"rgba(212,119,6,0.15)", privacyColor:"rgba(255,255,255,0.7)",
    cardBg:"rgba(255,255,255,0.05)", cardBorder:"1px solid rgba(255,255,255,0.1)",
    textPrimary:"white", textSecondary:"rgba(255,255,255,0.7)", textMuted:"rgba(255,255,255,0.4)",
    sessionBg:"rgba(255,255,255,0.04)", sessionActiveBg:"rgba(255,255,255,0.1)",
  } : {
    appBg:F.cream, chatBg:F.cream, tabBg:"white", tabBorder:"1px solid rgba(26,61,43,0.11)",
    contentBg:F.cream, sidebarBg:"white", sidebarBorder:"1px solid rgba(26,61,43,0.11)",
    msgAssistBg:"white", msgAssistColor:F.text, msgAssistBorder:"1px solid rgba(26,61,43,0.11)",
    inputAreaBg:"white", inputAreaBorder:"1px solid rgba(26,61,43,0.11)",
    inputBoxBg:F.cream, inputBoxBorder:"1.5px solid rgba(26,61,43,0.11)", inputColor:F.text,
    btnBg:F.warm, btnBorder:"1px solid rgba(26,61,43,0.2)", btnColor:F.textM,
    privacyBg:F.amberP, privacyColor:F.textM,
    cardBg:"white", cardBorder:"1px solid rgba(26,61,43,0.11)",
    textPrimary:F.text, textSecondary:F.textM, textMuted:F.textD,
    sessionBg:F.warm, sessionActiveBg:F.amberP,
  };

  const btnDk = (extra={}) => ({ background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)", color:"white", border:"none", borderRadius:10, padding:"10px 20px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", ...extra });
  const btnAm = (extra={}) => ({ background:"linear-gradient(135deg,#d97706,#f59e0b)", color:F.dark, border:"none", borderRadius:10, padding:"10px 20px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", ...extra });
  const iStyle = { width:"100%", padding:"9px 12px", border:"1px solid rgba(26,61,43,0.11)", borderRadius:9, fontSize:13, fontFamily:"inherit", outline:"none", background:"white", color:F.text };
  const lStyle = { display:"block", fontSize:11, fontWeight:700, color:F.textL, marginBottom:5, textTransform:"uppercase", letterSpacing:0.8 };

  const GlobalStyles = () => (
    <style>{`
      @keyframes rpb{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-5px);opacity:1}}
      *{box-sizing:border-box;}
      ::-webkit-scrollbar{width:5px;}
      ::-webkit-scrollbar-thumb{background:#d9770644;border-radius:3px;}
      textarea::placeholder,input::placeholder{color:rgba(120,120,120,0.5);}
      select{appearance:auto;}
    `}</style>
  );

  const Legal = () => (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"white", borderRadius:20, padding:32, maxWidth:560, width:"100%", maxHeight:"80vh", overflowY:"auto" }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:F.text, marginBottom:20 }}>Terms of Use &amp; Privacy Notice</h2>
        {LEGAL_TEXT.map(([t,b]) => (
          <div key={t} style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:F.dark, marginBottom:6 }}>{t}</div>
            <div style={{ fontSize:13, color:F.textM, lineHeight:1.75 }}>{b}</div>
          </div>
        ))}
        <button onClick={() => setShowLegal(false)} style={btnDk({ width:"100%" })}>Close</button>
      </div>
    </div>
  );

  const TermsPopup = () => (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"white", borderRadius:20, padding:32, maxWidth:480, width:"100%" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}><Shield size={48}/></div>
        <h2 style={{ fontSize:20, fontWeight:800, color:F.text, marginBottom:12, textAlign:"center" }}>Before you begin</h2>
        <p style={{ fontSize:14, color:F.textM, lineHeight:1.75, marginBottom:20, textAlign:"center" }}>RotaPilot is built for rostering coordinators. It gives you the right information at the right moment — and points you to the right expert when a question goes beyond rostering.</p>
        <div style={{ background:F.amberP, border:"1px solid #d9770644", borderRadius:12, padding:"14px 16px", marginBottom:24 }}>
          {["All SCHADS guidance is advisory - confirm with Fair Work Australia","Roster recommendations require human review before implementation","In any emergency, call 000 immediately","Your team data is stored locally in your browser only"].map(item => (
            <div key={item} style={{ display:"flex", gap:10, marginBottom:8, fontSize:13, color:F.textM }}>
              <span style={{ color:F.amber, fontWeight:700, flexShrink:0 }}>*</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <button onClick={acceptTerms} style={btnDk({ width:"100%", padding:"14px", fontSize:15, marginBottom:12 })}>I understand - start using RotaPilot</button>
        <p style={{ fontSize:12, color:F.textL, textAlign:"center" }}>
          By continuing you agree to our{" "}
          <span onClick={() => setShowLegal(true)} style={{ color:F.amber, cursor:"pointer", textDecoration:"underline" }}>Terms of Use &amp; Privacy Notice</span>
        </p>
      </div>
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const hasP = workers.length > 0 || participants.length > 0;

  const TBtn = ({id,label,icon}) => (
    <button onClick={() => setTab(id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"10px 6px", background:tab===id?"linear-gradient(135deg,#1a3d2b,#2d6a4f)":"transparent", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <span style={{ fontSize:12, fontWeight:700, color:tab===id?"white":darkMode?"rgba(255,255,255,0.6)":F.textL, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</span>
    </button>
  );

  // ─── LANDING ───────────────────────────────────────────────────────────────
  if (page === "landing") return (
    <div style={{ background:F.cream, color:F.text, minHeight:"100vh" }}>
      <GlobalStyles/>
      {showLegal && <Legal/>}
      <nav style={{ height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", borderBottom:"1px solid rgba(26,61,43,0.11)", position:"sticky", top:0, zIndex:100, background:"rgba(253,252,248,0.96)", backdropFilter:"blur(12px)" }}>
        <Logo size={44}/>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={() => setPage("pricing")} style={{ background:"none", border:"none", color:F.textL, cursor:"pointer", fontSize:14, fontFamily:"inherit", padding:"6px 14px" }}>Pricing</button>
          <button onClick={() => setShowLegal(true)} style={{ background:"none", border:"none", color:F.textL, cursor:"pointer", fontSize:14, fontFamily:"inherit", padding:"6px 14px" }}>Legal</button>
          <button onClick={() => setPage("login")} style={btnAm({ borderRadius:10, padding:"8px 20px" })}>Log in</button>
        </div>
      </nav>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"60px 32px 0px", textAlign:"center" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}><Shield size={72}/></div>
        <div style={{ fontSize:28, fontWeight:900, letterSpacing:-0.5, marginBottom:6, lineHeight:1 }}>
          <span style={{ color:F.dark }}>Rota</span><span style={{ color:F.amber }}>Pilot</span>
        </div>
        <div style={{ fontSize:14, color:F.textL, marginBottom:32, fontWeight:400, letterSpacing:0.5 }}>Smarter care rostering</div>
        <h1 style={{ fontSize:52, fontWeight:900, lineHeight:1.06, margin:"0 0 20px", color:F.text, letterSpacing:-2 }}>
          Your team.<br/><span style={{ color:F.amber }}>Confident. Every shift.</span>
        </h1>
        <p style={{ fontSize:16, color:F.textM, maxWidth:480, margin:"0 auto 28px", lineHeight:1.8, fontWeight:400 }}>
          Decision support for care coordinators under pressure. The rostering intelligence your team needs to make better decisions faster.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:12 }}>
          <button style={btnDk({ borderRadius:10, padding:"14px 32px", fontSize:16, boxShadow:"0 8px 28px #1a3d2b44" })} onClick={() => setPage("login")}>Start free 30-day trial</button>
          <button onClick={() => setPage("pricing")} style={{ background:"transparent", color:F.text, border:"1.5px solid rgba(26,61,43,0.2)", borderRadius:10, padding:"14px 26px", fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>View pricing</button>
        </div>
        <p style={{ fontSize:13, color:F.textD }}>No credit card required. Cancel anytime.</p>
      </div>
      <div style={{ background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)", padding:"56px 40px", marginTop:56 }}>
        <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {[["Crisis in seconds","Complete action plan and replacement options instantly"],["SCHADS guidance","7-step calculations in plain English every time"],["Communications","Every message drafted in the right tone, ready to send"],["Roster building","2-4 week rosters with skill matching, export to Excel"],["Team profiles","Short commands in a crisis - Marcus cancelled 6am David"],["Voice enabled","Tap and speak. No typing when seconds matter"]].map(([title,desc]) => (
            <div key={title} style={{ background:"rgba(255,255,255,0.07)", borderRadius:16, padding:"32px 24px", border:"1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ fontSize:19, fontWeight:800, color:"white", marginBottom:12 }}>{title}</div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,0.78)", lineHeight:1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:F.warm, padding:"60px 32px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <h2 style={{ fontSize:28, fontWeight:800, color:F.text, textAlign:"center", marginBottom:40 }}>What coordinators say</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {[["The 6am Sunday cancellation used to take me 45 minutes to sort out. Now it takes 3 minutes.","Operations Manager, Melbourne Disability Services"],["Finally something that actually understands SCHADS. I can explain calculations to my team now.","Rostering Coordinator, Sydney NDIS Provider"]].map(([q,a]) => (
              <div key={a} style={{ background:"white", border:"1px solid rgba(26,61,43,0.11)", borderRadius:16, padding:"24px 22px", boxShadow:F.shadow }}>
                <div style={{ fontSize:14, color:F.textM, lineHeight:1.8, marginBottom:12, fontStyle:"italic" }}>{q}</div>
                <div style={{ fontSize:12, color:F.textL }}>— {a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background:F.dark, padding:"60px 32px", textAlign:"center" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}><Shield size={52}/></div>
        <h2 style={{ fontSize:26, fontWeight:800, color:"white", margin:"0 0 14px" }}>Ready to roster smarter?</h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.65)", maxWidth:400, margin:"0 auto 32px" }}>30-day free trial. No credit card. Personal onboarding call included.</p>
        <button style={btnAm({ borderRadius:12, padding:"16px 44px", fontSize:16 })} onClick={() => setPage("login")}>Try RotaPilot free</button>
        <div style={{ marginTop:20, fontSize:12, color:"rgba(255,255,255,0.4)" }}>
          <span onClick={() => setShowLegal(true)} style={{ color:F.amber, cursor:"pointer", textDecoration:"underline" }}>Terms of Use &amp; Privacy</span>
        </div>
      </div>
    </div>
  );

  // ─── PRICING ───────────────────────────────────────────────────────────────
  if (page === "pricing") return (
    <div style={{ background:F.cream, color:F.text, minHeight:"100vh" }}>
      <GlobalStyles/>
      {showLegal && <Legal/>}
      <nav style={{ height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", borderBottom:"1px solid rgba(26,61,43,0.11)", background:"rgba(253,252,248,0.96)" }}>
        <Logo size={38} onClick={() => setPage("landing")}/>
        <button onClick={() => setPage("landing")} style={{ background:"none", border:"none", color:F.amber, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>Back</button>
      </nav>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"60px 32px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <h1 style={{ fontSize:36, fontWeight:900, color:F.text, margin:"0 0 12px" }}>Simple, transparent pricing</h1>
          <p style={{ fontSize:15, color:F.textM }}>Plans that grow with your organisation. Switch anytime.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:32 }}>
          {[
            { name:"Solo", price:"$97", desc:"Independent providers", features:["Up to 5 support workers","Up to 3 participants","Crisis cancellation support","SCHADS guidance","Communication drafting"], popular:false },
            { name:"Starter", price:"$297", desc:"Small providers", features:["Up to 10 support workers","Up to 6 participants","Crisis cancellation support","SCHADS guidance","Communication drafting","Audit checklists"], popular:false },
            { name:"Growth", price:"$597", desc:"Most popular", features:["Up to 30 support workers","Up to 18 participants","Everything in Starter","Proactive roster building","Voice input","Priority support"], popular:true },
            { name:"Operations Partner", price:"$997", desc:"Established providers", features:["Unlimited workers","Unlimited participants","Everything in Growth","Dedicated onboarding","Direct support line"], popular:false },
          ].map(plan => (
            <div key={plan.name} style={{ background:plan.popular?"linear-gradient(160deg,#1a3d2b,#2d6a4f)":"white", border:plan.popular?"none":"1px solid rgba(26,61,43,0.11)", borderRadius:18, padding:"28px 22px", position:"relative" }}>
              {plan.popular && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:F.amber, color:F.dark, borderRadius:10, padding:"3px 14px", fontSize:11, fontWeight:800, whiteSpace:"nowrap" }}>MOST POPULAR</div>}
              <div style={{ fontSize:18, fontWeight:800, color:plan.popular?"white":F.text, marginBottom:4 }}>{plan.name}</div>
              <div style={{ fontSize:12, color:plan.popular?"rgba(255,255,255,0.6)":F.textL, marginBottom:16 }}>{plan.desc}</div>
              <div style={{ fontSize:32, fontWeight:900, color:plan.popular?F.amberL:F.dark, marginBottom:20 }}>{plan.price}<span style={{ fontSize:13, fontWeight:400 }}>/mo</span></div>
              {plan.features.map(f => <div key={f} style={{ fontSize:13, color:plan.popular?"rgba(255,255,255,0.85)":F.textM, marginBottom:8 }}>{f}</div>)}
              <div style={{ marginTop:20 }}>
                <button onClick={() => setPage("login")} style={{ width:"100%", background:plan.popular?"linear-gradient(135deg,#d97706,#f59e0b)":"linear-gradient(135deg,#1a3d2b,#2d6a4f)", color:plan.popular?F.dark:"white", border:"none", borderRadius:10, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Start free trial</button>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign:"center", fontSize:13, color:F.textD }}>All plans include a 30-day free trial. No credit card required. Cancel anytime.</p>
      </div>
    </div>
  );

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  if (page === "login") return (
    <div style={{ background:F.cream, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <GlobalStyles/>
      {showLegal && <Legal/>}
      {showTermsPopup && <TermsPopup/>}
      <nav style={{ height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", borderBottom:"1px solid rgba(26,61,43,0.11)", background:"rgba(253,252,248,0.96)" }}>
        <Logo size={38} onClick={() => setPage("landing")}/>
        <span onClick={() => setPage("landing")} style={{ fontSize:13, color:F.amber, cursor:"pointer" }}>Back</span>
      </nav>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:32 }}>
        <div style={{ maxWidth:400, width:"100%" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <Logo size={52} onClick={() => setPage("landing")}/>
          </div>
          <div style={{ background:"white", border:"1px solid rgba(26,61,43,0.11)", borderRadius:20, padding:"30px 26px", boxShadow:F.shadow }}>
            <h2 style={{ fontSize:22, fontWeight:800, color:F.text, marginBottom:4 }}>Welcome back</h2>
            <p style={{ fontSize:13, color:F.textL, marginBottom:22, fontWeight:300 }}>Sign in to your RotaPilot account</p>
            <div style={{ marginBottom:16 }}>
              <label style={lStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@organisation.com.au" onKeyDown={e => e.key==="Enter"&&login()} style={iStyle}/>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={lStyle}>Password</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="password" onKeyDown={e => e.key==="Enter"&&login()} style={iStyle}/>
            </div>
            {loginErr && <p style={{ fontSize:12, color:F.red, marginBottom:12 }}>{loginErr}</p>}
            <button onClick={login} style={btnDk({ width:"100%", padding:"13px", fontSize:15, marginBottom:16 })}>Sign in</button>
            <p style={{ fontSize:12, color:F.textL, textAlign:"center", lineHeight:1.7 }}>
              By signing in you agree to our{" "}
              <span onClick={() => setShowLegal(true)} style={{ color:F.amber, cursor:"pointer", textDecoration:"underline" }}>Terms of Use &amp; Privacy Notice</span>
            </p>
          </div>
          <div style={{ background:F.warm, border:"1px solid rgba(26,61,43,0.11)", borderRadius:12, padding:"14px 18px", marginTop:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:F.textL, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>Demo accounts</div>
            {DEMO_ACCOUNTS.map(a => (
              <div key={a.email} onClick={() => { setEmail(a.email); setPass(a.password); }} style={{ fontSize:12, color:F.textM, marginBottom:4, cursor:"pointer", padding:"4px 0" }}>
                <span style={{ color:F.dark, fontWeight:600 }}>{a.email}</span>{" / "}{a.password}{" — "}{a.plan}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── APP SHELL ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background:DM.appBg, display:"flex", flexDirection:"column", height:"100vh", color:DM.textPrimary, transition:"all 0.3s" }}>
      <GlobalStyles/>
      {showLegal && <Legal/>}
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => { handleFile(e.target.files[0]); e.target.value=""; }}/>

      {/* Top bar */}
      <div style={{ height:58, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", background:F.dark, flexShrink:0 }}>
        <Logo size={32} light tag={false} onClick={() => setPage("landing")}/>
        <div style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.8)" }}>{client?.org}</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ background:"rgba(255,255,255,0.1)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"rgba(255,255,255,0.85)", fontWeight:600 }}>{client?.plan}</span>
          <button onClick={() => setTab("settings")} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:20, padding:"5px 16px", fontSize:12, fontWeight:600, color:"white", cursor:"pointer", fontFamily:"inherit" }}>Settings</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, padding:"8px 12px", background:DM.tabBg, borderBottom:DM.tabBorder, flexShrink:0 }}>
        <TBtn id="chat" label="Chat" icon="💬"/>
        <TBtn id="team" label="Team" icon="👥"/>
        <TBtn id="tutorial" label="Guide" icon="📖"/>
        <TBtn id="settings" label="Settings" icon="⚙️"/>
      </div>

      {/* Privacy bar */}
      <div style={{ padding:"5px 18px", background:DM.privacyBg, borderBottom:"1px solid #d9770622", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <span style={{ fontSize:12, color:DM.privacyColor }}>Use first names or participant codes — do not enter NDIS numbers</span>
        <span onClick={() => setShowLegal(true)} style={{ fontSize:12, color:F.amber, cursor:"pointer", textDecoration:"underline" }}>Terms</span>
      </div>

      {/* ── CHAT TAB ── */}
      {tab === "chat" && (
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
          {/* Sidebar */}
          <div style={{ width:240, background:DM.sidebarBg, borderRight:DM.sidebarBorder, display:"flex", flexDirection:"column", flexShrink:0 }}>
            <div style={{ padding:"12px 12px 8px" }}>
              <button onClick={() => { setMsgs([]); setCurrentSession(null); }} style={{ width:"100%", background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)", color:"white", border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ New chat</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"0 8px 8px" }}>
              {sessions.length === 0 ? (
                <div style={{ fontSize:12, color:DM.textMuted, textAlign:"center", marginTop:24, lineHeight:1.8, padding:"0 8px" }}>No sessions yet. Start a conversation and it saves automatically.</div>
              ) : (
                <>
                  <div style={{ fontSize:10, fontWeight:700, color:DM.textMuted, letterSpacing:1.5, textTransform:"uppercase", padding:"8px 6px 6px" }}>Recent</div>
                  {sessions.map(s => (
                    <button key={s.id} onClick={() => { setMsgs(s.msgs); setCurrentSession(s.id); }} style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"flex-start", padding:"9px 10px", background:currentSession===s.id?DM.sessionActiveBg:DM.sessionBg, border:currentSession===s.id?"1px solid #d9770644":"1px solid transparent", borderRadius:8, cursor:"pointer", marginBottom:4, fontFamily:"inherit", textAlign:"left" }}>
                      <div style={{ fontSize:12, fontWeight:600, color:DM.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", width:"100%" }}>{s.preview}</div>
                      <div style={{ fontSize:10, color:DM.textMuted, marginTop:2 }}>{s.date}</div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ flex:1, overflowY:"auto", padding:"20px", background:DM.chatBg }}>
              {msgs.length === 0 && (
                <div style={{ maxWidth:560, margin:"40px auto 0", textAlign:"center" }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>🛡️</div>
                  <div style={{ fontSize:24, fontWeight:800, color:DM.textPrimary, marginBottom:8 }}>{greeting} 👋</div>
                  <div style={{ fontSize:15, color:DM.textSecondary, marginBottom:24, lineHeight:1.7 }}>
                    {hasP
                      ? `Your team is ready — ${workers.length} workers, ${participants.length} participants. Describe any rostering situation or type a short command.`
                      : `Describe your rostering situation, ask a SCHADS question, or type a short command like "Marcus cancelled 6am David".`}
                  </div>
                  {!hasP && (
                    <div style={{ background:F.amberP, border:"1px solid #d9770644", borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, textAlign:"left" }}>
                      <span style={{ fontSize:13, color:F.textM }}>Set up your team first to use short commands</span>
                      <button style={btnDk({ padding:"6px 16px", fontSize:12 })} onClick={() => setTab("team")}>Set up</button>
                    </div>
                  )}
                  <div style={{ background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:10, padding:"10px 16px", display:"flex", gap:9, alignItems:"center", textAlign:"left" }}>
                    <span>🚨</span>
                    <span style={{ fontSize:12, color:"#f87171" }}><strong>Life-threatening emergency?</strong> Call 000 immediately.</span>
                  </div>
                </div>
              )}
              <div style={{ maxWidth:700, margin:"0 auto" }}>
                {msgs.map((m,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", marginBottom:12 }}>
                    {m.role==="assistant" && <div style={{ marginRight:9, marginTop:2, flexShrink:0 }}><Shield size={30}/></div>}
                    <div style={{ maxWidth:"82%", display:"flex", flexDirection:"column", gap:5 }}>
                      <div style={{ padding:"13px 17px", fontSize:15, lineHeight:1.85, whiteSpace:"pre-wrap", ...(m.role==="user" ? { background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)", color:"white", borderRadius:"16px 16px 3px 16px" } : { background:DM.msgAssistBg, color:DM.msgAssistColor, border:DM.msgAssistBorder, borderRadius:"16px 16px 16px 3px" }) }}>
                        {typeof m.content === "string" ? m.content : "[Image attached]"}
                      </div>
                      {m.role==="assistant" && (
                        <div style={{ display:"flex", gap:6, paddingLeft:2 }}>
                          <button onClick={() => copy(i, m.content)} style={{ background:DM.btnBg, border:DM.btnBorder, borderRadius:6, padding:"4px 12px", fontSize:12, color:copiedId===i?"#16a34a":DM.btnColor, cursor:"pointer", fontFamily:"inherit" }}>
                            {copiedId===i?"Copied":"Copy"}
                          </button>
                          {typeof m.content === "string" && m.content.includes("|") && (
                            <button onClick={() => copyR(m.content)} style={{ background:F.amberP, border:"1px solid #d9770644", borderRadius:6, padding:"4px 12px", fontSize:12, color:copiedId==="r"?"#16a34a":F.amber, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
                              {copiedId==="r"?"Ready!":"Copy to Excel"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:12 }}>
                    <Shield size={30}/>
                    <div style={{ background:DM.msgAssistBg, border:DM.msgAssistBorder, borderRadius:"16px 16px 16px 3px", padding:"12px 18px", display:"flex", gap:5 }}>
                      {[0,1,2].map(j => <div key={j} style={{ width:7, height:7, borderRadius:"50%", background:F.amber, animation:`rpb 1s ease-in-out ${j*0.18}s infinite` }}/>)}
                    </div>
                  </div>
                )}
                <div ref={endRef}/>
              </div>
            </div>

            {/* Input area */}
            <div style={{ padding:"10px 16px 14px", borderTop:DM.inputAreaBorder, background:DM.inputAreaBg, flexShrink:0 }}>
              <div style={{ maxWidth:700, margin:"0 auto" }}>
                <div style={{ display:"flex", gap:8, background:DM.inputBoxBg, border:DM.inputBoxBorder, borderRadius:14, padding:"10px 12px", alignItems:"flex-end" }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder={hasP?"Short command or describe situation...":"Describe your rostering situation..."}
                    rows={1}
                    style={{ flex:1, background:"transparent", border:"none", outline:"none", color:DM.inputColor, fontSize:15, fontFamily:"inherit", resize:"none", lineHeight:1.6, maxHeight:130, overflowY:"auto" }}
                    onInput={e => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,130)+"px"; }}
                  />
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                    <button onClick={() => fileRef.current?.click()} style={{ height:36, padding:"0 14px", background:DM.btnBg, border:DM.btnBorder, borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, color:DM.btnColor, fontFamily:"inherit" }}>Attach</button>
                    <button onClick={voice} style={{ height:36, padding:"0 14px", background:isRecording?"linear-gradient(135deg,#dc2626,#ef4444)":DM.btnBg, border:isRecording?"1px solid #dc2626":"1px solid rgba(255,255,255,0.2)", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, color:isRecording?"white":DM.btnColor, fontFamily:"inherit" }}>
                      {isRecording?"Stop":"Voice"}
                    </button>
                    <button onClick={() => send()} disabled={!input.trim()||loading} style={{ height:36, width:42, background:input.trim()&&!loading?"linear-gradient(135deg,#d97706,#f59e0b)":"rgba(255,255,255,0.1)", border:"none", borderRadius:9, cursor:input.trim()&&!loading?"pointer":"not-allowed", color:input.trim()&&!loading?F.dark:"rgba(255,255,255,0.3)", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>➤</button>
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                  <span style={{ fontSize:11, color:DM.textMuted }}>Enter to send · Shift+Enter for new line</span>
                  <span style={{ fontSize:11, color:DM.textMuted }}>SCHADS guidance — confirm with Fair Work Australia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TEAM TAB ── */}
      {tab === "team" && (
        <div style={{ flex:1, overflowY:"auto", padding:"20px", background:DM.contentBg }}>
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <div style={{ marginBottom:22 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:DM.textPrimary, marginBottom:6 }}>Team Setup</h2>
              <p style={{ fontSize:13, color:DM.textSecondary, lineHeight:1.7 }}>Add your workers and participants once. RotaPilot remembers everything — then use short commands in a crisis.</p>
            </div>
            <div style={{ display:"flex", gap:4, marginBottom:22, background:DM.cardBg, border:DM.cardBorder, borderRadius:12, padding:4 }}>
              {[["workers","Workers"],["participants","Participants"]].map(([t,label]) => (
                <button key={t} onClick={() => setSTab(t)} style={{ flex:1, background:sTab===t?"linear-gradient(135deg,#1a3d2b,#2d6a4f)":"transparent", color:sTab===t?"white":DM.textSecondary, border:"none", borderRadius:9, padding:"10px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{label}</button>
              ))}
            </div>

            {sTab === "workers" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:DM.textPrimary }}>{workers.length} worker{workers.length!==1?"s":""}</span>
                  <button style={btnDk({ padding:"7px 16px", fontSize:13 })} onClick={() => setShowWF(true)}>+ Add worker</button>
                </div>
                {workers.map(w => (
                  <div key={w.id} style={{ background:DM.cardBg, border:DM.cardBorder, borderRadius:12, padding:"16px 18px", marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700, color:DM.textPrimary, marginBottom:5 }}>{w.name}</div>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          <span style={{ background:F.amberP, borderRadius:10, padding:"2px 9px", fontSize:11, color:F.amber, fontWeight:600 }}>{w.type}</span>
                          <span style={{ background:"#eff6ff", borderRadius:10, padding:"2px 9px", fontSize:11, color:"#1d4ed8" }}>{w.travelMins}min travel</span>
                        </div>
                      </div>
                      <button onClick={() => remW(w.id)} style={{ background:"none", border:"none", color:F.red, cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
                    </div>
                    {w.quals.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:6 }}>{w.quals.map(q => <span key={q} style={{ background:F.amberP, borderRadius:7, padding:"2px 9px", fontSize:11, color:F.amber }}>{q}</span>)}</div>}
                    {w.days.length > 0 && <div style={{ display:"flex", gap:4, marginBottom:6 }}>{DAYS.map(d => <span key={d} style={{ background:w.days.includes(d)?F.dark:DM.cardBg, color:w.days.includes(d)?"white":DM.textMuted, border:w.days.includes(d)?"none":DM.cardBorder, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{d}</span>)}</div>}
                    {w.notes && <div style={{ fontSize:12, color:DM.textMuted, marginTop:4, fontStyle:"italic" }}>{w.notes}</div>}
                  </div>
                ))}
                {workers.length === 0 && !showWF && <div style={{ textAlign:"center", padding:"36px 20px", color:DM.textMuted, fontSize:13 }}>No workers yet — add your support workers so RotaPilot can match them to shifts</div>}
                {showWF && (
                  <div style={{ background:DM.cardBg, border:"1.5px solid #d97706", borderRadius:14, padding:"22px 20px", marginTop:12 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:DM.textPrimary, marginBottom:18 }}>Add new worker</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                      {[["First name *","name","text","e.g. Marcus"],["Phone (optional)","phone","tel","e.g. 0412 345 678"]].map(([label,key,type,ph]) => (
                        <div key={key}><label style={{ ...lStyle, color:DM.textMuted }}>{label}</label><input type={type} value={nw[key]} onChange={e => setNw(p => ({...p,[key]:e.target.value}))} placeholder={ph} style={{ ...iStyle, background:DM.inputBoxBg, border:DM.cardBorder, color:DM.textPrimary }}/></div>
                      ))}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                      <div><label style={{ ...lStyle, color:DM.textMuted }}>Employment type</label><select value={nw.type} onChange={e => setNw(p => ({...p,type:e.target.value}))} style={{ ...iStyle, background:DM.inputBoxBg, border:DM.cardBorder, color:DM.textPrimary }}>{["casual","part-time","full-time"].map(t => <option key={t}>{t}</option>)}</select></div>
                      <div><label style={{ ...lStyle, color:DM.textMuted }}>Travel time (mins)</label><input type="number" value={nw.travelMins} onChange={e => setNw(p => ({...p,travelMins:Number(e.target.value)}))} min={5} max={120} style={{ ...iStyle, background:DM.inputBoxBg, border:DM.cardBorder, color:DM.textPrimary }}/></div>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <label style={{ ...lStyle, color:DM.textMuted }}>Qualifications</label>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {QUALIFICATIONS.map(q => <button key={q} onClick={() => setNw(p => ({...p,quals:p.quals.includes(q)?p.quals.filter(x=>x!==q):[...p.quals,q]}))} style={{ background:nw.quals.includes(q)?F.dark:DM.cardBg, color:nw.quals.includes(q)?"white":DM.textSecondary, border:nw.quals.includes(q)?"1px solid #1a3d2b":DM.cardBorder, borderRadius:8, padding:"5px 11px", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{q}</button>)}
                      </div>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <label style={{ ...lStyle, color:DM.textMuted }}>Available days</label>
                      <div style={{ display:"flex", gap:6 }}>
                        {DAYS.map(d => <button key={d} onClick={() => setNw(p => ({...p,days:p.days.includes(d)?p.days.filter(x=>x!==d):[...p.days,d]}))} style={{ background:nw.days.includes(d)?F.dark:DM.cardBg, color:nw.days.includes(d)?"white":DM.textSecondary, border:nw.days.includes(d)?"1px solid #1a3d2b":DM.cardBorder, borderRadius:8, padding:"6px 10px", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>{d}</button>)}
                      </div>
                    </div>
                    <div style={{ marginBottom:18 }}><label style={{ ...lStyle, color:DM.textMuted }}>Notes</label><input value={nw.notes} onChange={e => setNw(p => ({...p,notes:e.target.value}))} placeholder="e.g. Speaks Mandarin, prefers mornings" style={{ ...iStyle, background:DM.inputBoxBg, border:DM.cardBorder, color:DM.textPrimary }}/></div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button style={btnDk({ flex:2, padding:"11px", fontSize:14, borderRadius:9 })} onClick={addW}>Save worker</button>
                      <button onClick={() => setShowWF(false)} style={{ flex:1, background:"none", border:DM.cardBorder, borderRadius:9, padding:"11px", fontSize:13, color:DM.textSecondary, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {sTab === "participants" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:DM.textPrimary }}>{participants.length} participant{participants.length!==1?"s":""}</span>
                  <button style={btnDk({ padding:"7px 16px", fontSize:13 })} onClick={() => setShowPF(true)}>+ Add participant</button>
                </div>
                {participants.map(p => (
                  <div key={p.id} style={{ background:DM.cardBg, border:DM.cardBorder, borderRadius:12, padding:"16px 18px", marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700, color:DM.textPrimary, marginBottom:5 }}>{p.name}</div>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          {p.address && <span style={{ background:"#eff6ff", borderRadius:10, padding:"2px 9px", fontSize:11, color:"#1d4ed8" }}>{p.address}</span>}
                          {p.medTime && <span style={{ background:"#fff7ed", borderRadius:10, padding:"2px 9px", fontSize:11, color:"#c2410c", fontWeight:600 }}>Med: {p.medTime}</span>}
                        </div>
                      </div>
                      <button onClick={() => remP(p.id)} style={{ background:"none", border:"none", color:F.red, cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
                    </div>
                    {p.needs.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:6 }}>{p.needs.map(n => <span key={n} style={{ background:F.redP, borderRadius:7, padding:"2px 9px", fontSize:11, color:F.red }}>{n}</span>)}</div>}
                    {p.emergencyName && <div style={{ fontSize:12, color:DM.textMuted }}>Emergency: {p.emergencyName} {p.emergencyPhone}</div>}
                    {p.notes && <div style={{ fontSize:12, color:DM.textMuted, marginTop:4, fontStyle:"italic" }}>{p.notes}</div>}
                  </div>
                ))}
                {participants.length === 0 && !showPF && <div style={{ textAlign:"center", padding:"36px 20px", color:DM.textMuted, fontSize:13 }}>No participants yet</div>}
                {showPF && (
                  <div style={{ background:DM.cardBg, border:"1.5px solid #d97706", borderRadius:14, padding:"22px 20px", marginTop:12 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:DM.textPrimary, marginBottom:18 }}>Add new participant</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                      {[["First name *","name","text","e.g. David"],["Home address","address","text","e.g. 12 Smith St"]].map(([label,key,type,ph]) => (
                        <div key={key}><label style={{ ...lStyle, color:DM.textMuted }}>{label}</label><input type={type} value={np[key]} onChange={e => setNp(p => ({...p,[key]:e.target.value}))} placeholder={ph} style={{ ...iStyle, background:DM.inputBoxBg, border:DM.cardBorder, color:DM.textPrimary }}/></div>
                      ))}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                      <div><label style={{ ...lStyle, color:DM.textMuted }}>Worker gender preference</label><select value={np.gender} onChange={e => setNp(p => ({...p,gender:e.target.value}))} style={{ ...iStyle, background:DM.inputBoxBg, border:DM.cardBorder, color:DM.textPrimary }}>{["any","female","male"].map(g => <option key={g}>{g}</option>)}</select></div>
                      <div><label style={{ ...lStyle, color:DM.textMuted }}>Medication time</label><input value={np.medTime} onChange={e => setNp(p => ({...p,medTime:e.target.value}))} placeholder="e.g. 7:00am" style={{ ...iStyle, background:DM.inputBoxBg, border:DM.cardBorder, color:DM.textPrimary }}/></div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                      {[["Emergency contact name","emergencyName","text","e.g. Mary Smith"],["Emergency contact phone","emergencyPhone","tel","e.g. 0412 345 678"]].map(([label,key,type,ph]) => (
                        <div key={key}><label style={{ ...lStyle, color:DM.textMuted }}>{label}</label><input type={type} value={np[key]} onChange={e => setNp(p => ({...p,[key]:e.target.value}))} placeholder={ph} style={{ ...iStyle, background:DM.inputBoxBg, border:DM.cardBorder, color:DM.textPrimary }}/></div>
                      ))}
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <label style={{ ...lStyle, color:DM.textMuted }}>Support needs</label>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {SUPPORT_NEEDS.map(n => <button key={n} onClick={() => setNp(p => ({...p,needs:p.needs.includes(n)?p.needs.filter(x=>x!==n):[...p.needs,n]}))} style={{ background:np.needs.includes(n)?F.red:DM.cardBg, color:np.needs.includes(n)?"white":DM.textSecondary, border:np.needs.includes(n)?"1px solid #dc2626":DM.cardBorder, borderRadius:8, padding:"5px 11px", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{n}</button>)}
                      </div>
                    </div>
                    <div style={{ marginBottom:18 }}><label style={{ ...lStyle, color:DM.textMuted }}>Notes</label><input value={np.notes} onChange={e => setNp(p => ({...p,notes:e.target.value}))} placeholder="e.g. Complex behaviours, prefers consistent workers" style={{ ...iStyle, background:DM.inputBoxBg, border:DM.cardBorder, color:DM.textPrimary }}/></div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button style={btnDk({ flex:2, padding:"11px", fontSize:14, borderRadius:9 })} onClick={addP}>Save participant</button>
                      <button onClick={() => setShowPF(false)} style={{ flex:1, background:"none", border:DM.cardBorder, borderRadius:9, padding:"11px", fontSize:13, color:DM.textSecondary, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TUTORIAL TAB ── */}
      {tab === "tutorial" && (
        <div style={{ flex:1, overflowY:"auto", padding:"24px 20px", background:DM.contentBg }}>
          <div style={{ maxWidth:600, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}><Shield size={52}/></div>
              <h2 style={{ fontSize:24, fontWeight:800, color:DM.textPrimary, marginBottom:6 }}>Getting started with RotaPilot</h2>
              <p style={{ fontSize:14, color:DM.textSecondary, fontWeight:300 }}>Seven steps to smarter care rostering</p>
            </div>
            <div style={{ display:"flex", gap:4, marginBottom:24, justifyContent:"center" }}>
              {TUTORIAL_STEPS.map((_,i) => (
                <div key={i} onClick={() => setTutStep(i)} style={{ width:i===tutStep?28:10, height:10, borderRadius:5, background:i===tutStep?F.amber:i<tutStep?F.amber+"55":darkMode?"rgba(255,255,255,0.15)":F.border, cursor:"pointer", transition:"all 0.3s" }}/>
              ))}
            </div>
            <div style={{ background:DM.cardBg, border:DM.cardBorder, borderRadius:20, padding:"32px 28px", marginBottom:16 }}>
              <h3 style={{ fontSize:20, fontWeight:800, color:DM.textPrimary, marginBottom:12, textAlign:"center" }}>{TUTORIAL_STEPS[tutStep].title}</h3>
              <p style={{ fontSize:15, color:DM.textSecondary, lineHeight:1.8, marginBottom:16, textAlign:"center" }}>{TUTORIAL_STEPS[tutStep].desc}</p>
              {TUTORIAL_STEPS[tutStep].tip && (
                <div style={{ background:F.amberP, border:"1px solid rgba(217,119,6,0.27)", borderRadius:12, padding:"14px 16px", marginBottom:TUTORIAL_STEPS[tutStep].demo?12:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:F.amber, marginBottom:5, textTransform:"uppercase", letterSpacing:1 }}>Tip</div>
                  <div style={{ fontSize:13, color:F.textM, lineHeight:1.7 }}>{TUTORIAL_STEPS[tutStep].tip}</div>
                </div>
              )}
              {TUTORIAL_STEPS[tutStep].demo && (
                <div style={{ background:darkMode?"rgba(255,255,255,0.05)":F.warm, border:DM.cardBorder, borderRadius:12, padding:"14px 16px", marginTop:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:DM.textMuted, marginBottom:5, textTransform:"uppercase", letterSpacing:1 }}>Example</div>
                  <div style={{ fontSize:13, color:DM.textSecondary, lineHeight:1.7, fontStyle:"italic" }}>{TUTORIAL_STEPS[tutStep].demo}</div>
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setTutStep(t => Math.max(0,t-1))} disabled={tutStep===0} style={{ flex:1, background:"none", border:DM.cardBorder, borderRadius:10, padding:"12px", fontSize:14, color:tutStep===0?DM.textMuted:DM.textSecondary, cursor:tutStep===0?"not-allowed":"pointer", fontFamily:"inherit" }}>Back</button>
              {tutStep < TUTORIAL_STEPS.length-1
                ? <button style={btnDk({ flex:2, padding:"12px", fontSize:14, borderRadius:10 })} onClick={() => setTutStep(t => t+1)}>Next</button>
                : <button style={btnAm({ flex:2, padding:"12px", fontSize:14, borderRadius:10 })} onClick={() => setTab("chat")}>Start using RotaPilot</button>
              }
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === "settings" && (
        <div style={{ flex:1, overflowY:"auto", padding:"24px 20px", background:DM.contentBg }}>
          <div style={{ maxWidth:600, margin:"0 auto" }}>
            <h2 style={{ fontSize:22, fontWeight:800, color:DM.textPrimary, marginBottom:6 }}>Settings</h2>
            <p style={{ fontSize:13, color:DM.textSecondary, marginBottom:16 }}>Manage your RotaPilot account and preferences.</p>

            {(workers.length > 0 || participants.length > 0) && (
              <div style={{ background:"#fffbeb", border:"1px solid #d9770644", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#92400e", marginBottom:2 }}>Back up your team profiles</div>
                  <div style={{ fontSize:12, color:"#78716c" }}>Profiles are stored in this browser. Download a backup before clearing cache or switching devices.</div>
                </div>
                <button onClick={() => { const b={version:"1.0",org:client?.org,date:new Date().toISOString(),workers,participants}; const a=document.createElement("a"); a.href="data:application/json,"+encodeURIComponent(JSON.stringify(b,null,2)); a.download="rotapilot-backup-"+new Date().toISOString().slice(0,10)+".json"; a.click(); }} style={btnDk({ padding:"8px 16px", fontSize:12, whiteSpace:"nowrap", flexShrink:0 })}>Backup now</button>
              </div>
            )}

            <div style={{ background:DM.cardBg, border:DM.cardBorder, borderRadius:14, padding:"20px", marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:F.amber, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Account</div>
              {[["Organisation",client?.org],["Plan",client?.plan],["Workers",client?.workers+" workers"],["Participants",client?.participants+" participants"]].map(([label,value]) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:DM.cardBorder }}>
                  <span style={{ fontSize:14, color:DM.textSecondary }}>{label}</span>
                  <span style={{ fontSize:14, fontWeight:600, color:DM.textPrimary }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ background:DM.cardBg, border:DM.cardBorder, borderRadius:14, padding:"20px", marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:F.amber, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Appearance</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:DM.textPrimary, marginBottom:3 }}>Theme</div>
                  <div style={{ fontSize:12, color:DM.textSecondary }}>Choose dark or light mode</div>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} style={{ background:darkMode?"linear-gradient(135deg,#1a3d2b,#2d6a4f)":"white", border:"1.5px solid rgba(26,61,43,0.2)", borderRadius:20, padding:"6px 18px", fontSize:13, fontWeight:600, color:darkMode?"white":F.text, cursor:"pointer", fontFamily:"inherit" }}>
                  {darkMode?"Dark mode":"Light mode"}
                </button>
              </div>
            </div>

            <div style={{ background:DM.cardBg, border:DM.cardBorder, borderRadius:14, padding:"20px", marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:F.amber, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Session History</div>
              {sessions.length === 0
                ? <div style={{ fontSize:13, color:DM.textMuted, textAlign:"center", padding:"12px" }}>No sessions yet</div>
                : sessions.map(s => (
                  <button key={s.id} onClick={() => { setMsgs(s.msgs); setCurrentSession(s.id); setTab("chat"); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:currentSession===s.id?DM.sessionActiveBg:"transparent", border:"1px solid transparent", borderRadius:10, cursor:"pointer", fontFamily:"inherit", textAlign:"left", marginBottom:4 }}>
                    <Shield size={28}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:DM.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.preview}</div>
                      <div style={{ fontSize:11, color:DM.textMuted }}>{s.date}</div>
                    </div>
                  </button>
                ))
              }
              {sessions.length > 0 && <button onClick={() => { setMsgs([]); setCurrentSession(null); setTab("chat"); }} style={btnDk({ marginTop:12, padding:"8px 18px", fontSize:13 })}>+ New chat</button>}
            </div>

            <div style={{ background:DM.cardBg, border:DM.cardBorder, borderRadius:14, padding:"20px", marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:F.amber, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Backup &amp; Restore</div>
              {[
                ["Download team backup","Save all profiles as a backup file", () => { const b={version:"1.0",org:client?.org,date:new Date().toISOString(),workers,participants}; const a=document.createElement("a"); a.href="data:application/json,"+encodeURIComponent(JSON.stringify(b,null,2)); a.download="rotapilot-backup-"+new Date().toISOString().slice(0,10)+".json"; a.click(); }, "Download"],
                ["Export team as CSV","Spreadsheet format for admin records", () => { const rows=[["Type","Name","Quals/Needs","Days/Notes"],...workers.map(w=>["Worker",w.name,w.quals.join("|"),w.days.join("|")]),...participants.map(p=>["Participant",p.name,p.needs.join("|"),p.notes||""])]; const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n"); const a=document.createElement("a"); a.href="data:text/csv,"+encodeURIComponent(csv); a.download="rotapilot-team.csv"; a.click(); }, "Export CSV"],
                ["Export this session","Save current chat as a text file", () => { const text=msgs.map(m=>(m.role==="user"?"You":"RotaPilot")+":\n"+(typeof m.content==="string"?m.content:"[Image]")).join("\n\n---\n\n"); const a=document.createElement("a"); a.href="data:text/plain,"+encodeURIComponent(text); a.download="rotapilot-session-"+new Date().toISOString().slice(0,10)+".txt"; a.click(); }, "Export"],
              ].map(([title, desc, fn, label]) => (
                <div key={title} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:DM.cardBorder }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:DM.textPrimary, marginBottom:2 }}>{title}</div>
                    <div style={{ fontSize:12, color:DM.textSecondary }}>{desc}</div>
                  </div>
                  <button onClick={fn} style={{ background:DM.btnBg, border:DM.btnBorder, borderRadius:8, padding:"6px 16px", fontSize:12, fontWeight:600, color:DM.btnColor, cursor:"pointer", fontFamily:"inherit" }}>{label}</button>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0" }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:DM.textPrimary, marginBottom:2 }}>Restore from backup</div>
                  <div style={{ fontSize:12, color:DM.textSecondary }}>Load a previously downloaded backup file</div>
                </div>
                <button onClick={() => { const inp=document.createElement("input"); inp.type="file"; inp.accept=".json"; inp.onchange=(e)=>{ const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=(ev)=>{ try{ const data=JSON.parse(ev.target.result); if(data.workers&&Array.isArray(data.workers)){setWorkers(data.workers);localStorage.setItem("rp_workers",JSON.stringify(data.workers));} if(data.participants&&Array.isArray(data.participants)){setParticipants(data.participants);localStorage.setItem("rp_participants",JSON.stringify(data.participants));} alert("Restored: "+(data.workers?.length||0)+" workers, "+(data.participants?.length||0)+" participants."); }catch{ alert("Could not read backup file."); } }; reader.readAsText(file); }; inp.click(); }} style={{ background:DM.btnBg, border:DM.btnBorder, borderRadius:8, padding:"6px 16px", fontSize:12, fontWeight:600, color:DM.btnColor, cursor:"pointer", fontFamily:"inherit" }}>Restore</button>
              </div>
            </div>

            <div style={{ background:DM.cardBg, border:DM.cardBorder, borderRadius:14, padding:"20px", marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:F.amber, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Privacy</div>
              {[["Worker profiles","Stored in your browser only — never sent to any server"],["Chat conversations","Processed by AI to generate responses. Avoid entering highly sensitive information."],["Session history","Stored in your browser only"],["Emergency contacts","Stored in your browser only — never leaves your device"]].map(([item,detail]) => (
                <div key={item} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom:DM.cardBorder }}>
                  <span style={{ color:"#22c55e", fontSize:14, flexShrink:0, marginTop:1 }}>✓</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:DM.textPrimary }}>{item}</div>
                    <div style={{ fontSize:12, color:DM.textSecondary }}>{detail}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}