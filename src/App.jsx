import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "https://rosterwise-server.onrender.com";

const DEMO_ACCOUNTS = [
{ email: "demo@abilityfirst.com.au", password: "demo123", org: "Ability First Care", plan: "Growth", workers: 15, participants: 12 },
{ email: "admin@sunrise.com.au", password: "trial123", org: "Sunrise Disability Services", plan: "Starter", workers: 8, participants: 6 },
];

const QUICK_PROMPTS = [
{ icon: "🚨", title: "Worker cancelled", subtitle: "Get immediate cover plan", text: "My worker just cancelled their shift starting in 30 minutes. What do I do?" },
{ icon: "💰", title: "SCHADS pay query", subtitle: "Calculate correct rates", text: "I need help calculating the correct pay rate for a shift that was worked." },
{ icon: "📋", title: "Build a roster", subtitle: "Plan 2–4 weeks ahead", text: "Help me build next week's roster for my participants." },
{ icon: "✉️", title: "Draft a message", subtitle: "Ready-to-send comms", text: "I need to draft a message to a participant's family about a roster change." },
{ icon: "✅", title: "Audit checklist", subtitle: "Stay compliant", text: "Give me a complete audit readiness checklist for my NDIS organisation." },
{ icon: "⚖️", title: "SCHADS dispute", subtitle: "Resolve underpayment", text: "A worker says they have been underpaid. Help me work through the calculation." },
];

const PLANS = [
{
name: "Starter", price: 297, annualPrice: 2851, desc: "Perfect for small providers",
features: ["Up to 10 support workers", "Up to 6 participants", "Last-minute cancellation support", "SCHADS pay queries", "Communication drafting", "Email support"],
highlight: false,
},
{
name: "Growth", price: 597, annualPrice: 5731, desc: "Most popular",
features: ["Up to 30 support workers", "Up to 18 participants", "Everything in Starter", "Proactive roster building", "Timesheet audit assistance", "Priority support"],
highlight: true,
},
{
name: "Operations Partner", price: 997, annualPrice: 9571, desc: "For established providers",
features: ["Unlimited workers & participants", "Everything in Growth", "After-hours framework", "Compliance reporting", "SCHADS dispute support", "Dedicated account review"],
highlight: false,
},
];

const LEGAL_SECTIONS = [
{ title: "General Guidance Only", body: "RosterWise provides general rostering and compliance guidance only. It is not a substitute for qualified legal, industrial relations, clinical, or professional advice. All information should be verified independently before acting upon it." },
{ title: "SCHADS Award", body: "Pay rate guidance is indicative only. Always verify SCHADS Award calculations with Fair Work Australia or a qualified IR advisor. RosterWise accepts no liability for payroll errors or underpayment claims arising from use of this tool." },
{ title: "Rostering Decisions", body: "The provider is solely responsible for all rostering decisions, including staff deployment, participant safety, and compliance with NDIS Practice Standards. RosterWise is a decision-support tool only." },
{ title: "Privacy & Participant Data", body: "Do not enter identifiable participant information into RosterWise. Use first names or participant codes only (e.g. Participant A). Do not enter NDIS numbers, full addresses, or sensitive health details. You are responsible for compliance with the Australian Privacy Act 1988." },
{ title: "Emergency Situations", body: "RosterWise is not an emergency service. In any life-threatening situation, call 000 immediately. For medication emergencies, call the Poisons Information Centre: 13 11 26." },
{ title: "No Liability", body: "RosterWise and its operators accept no liability for any loss, damage, compliance breach, or harm arising from use of or reliance on this tool." },
{ title: "Data Processing", body: "Conversations are processed by Anthropic AI systems. No conversation history is stored by RosterWise between sessions." },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

:root {
--green: #3d6b52;
--green-light: #5e8b68;
--green-pale: #e8f0ea;
--green-mid: #c5d9c9;
--cream: #faf8f4;
--warm: #f2ede4;
--text: #1c2b1e;
--text-mid: #4a5e4d;
--text-light: #7a8f7d;
--text-dim: #a8b8ab;
--border: rgba(61,107,82,0.15);
--border-mid: rgba(61,107,82,0.25);
--shadow: 0 2px 16px rgba(61,107,82,0.08);
--shadow-lg: 0 8px 40px rgba(61,107,82,0.12);
--radius: 14px;
--font-display: 'Fraunces', Georgia, serif;
--font-body: 'DM Sans', system-ui, sans-serif;
}

* { box-sizing: border-box; }

.rw-app {
font-family: var(--font-body);
background: var(--cream);
color: var(--text);
min-height: 100vh;
}

/* NAV */
.rw-nav {
position: sticky; top: 0; z-index: 100;
padding: 0 32px;
height: 60px;
display: flex; align-items: center; justify-content: space-between;
background: rgba(250,248,244,0.92);
backdrop-filter: blur(12px);
border-bottom: 1px solid var(--border);
}

.rw-logo {
display: flex; align-items: center; gap: 10px;
cursor: pointer; text-decoration: none;
}

.rw-logo-mark {
width: 34px; height: 34px;
background: var(--green);
border-radius: 9px;
display: flex; align-items: center; justify-content: center;
font-family: var(--font-display);
font-size: 16px; font-weight: 600;
color: white;
letter-spacing: -0.5px;
}

.rw-logo-name {
font-family: var(--font-display);
font-size: 18px; font-weight: 400;
color: var(--green);
letter-spacing: -0.3px;
}

.rw-nav-links {
display: flex; align-items: center; gap: 6px;
}

.rw-nav-link {
background: none; border: none;
padding: 7px 14px;
font-family: var(--font-body); font-size: 13px; font-weight: 400;
color: var(--text-mid); cursor: pointer;
border-radius: 8px;
transition: all 0.15s;
}
.rw-nav-link:hover { background: var(--green-pale); color: var(--green); }

.rw-nav-cta {
background: var(--green); color: white;
border: none; border-radius: 9px;
padding: 8px 18px;
font-family: var(--font-body); font-size: 13px; font-weight: 500;
cursor: pointer;
transition: all 0.15s;
}
.rw-nav-cta:hover { background: var(--green-light); transform: translateY(-1px); }

/* HERO */
.rw-hero {
max-width: 920px; margin: 0 auto;
padding: 80px 32px 64px;
text-align: center;
}

.rw-badge {
display: inline-block;
background: var(--green-pale);
border: 1px solid var(--green-mid);
border-radius: 20px;
padding: 5px 16px;
font-size: 11px; font-weight: 500;
color: var(--green);
letter-spacing: 1.5px;
text-transform: uppercase;
margin-bottom: 24px;
}

.rw-hero h1 {
font-family: var(--font-display);
font-size: 52px; font-weight: 300;
line-height: 1.1;
color: var(--text);
margin-bottom: 20px;
letter-spacing: -1px;
}

.rw-hero h1 em {
font-style: italic;
color: var(--green);
}

.rw-hero p {
font-size: 17px; font-weight: 300;
color: var(--text-mid);
max-width: 540px; margin: 0 auto 36px;
line-height: 1.75;
}

.rw-hero-btns {
display: flex; gap: 12px;
justify-content: center; flex-wrap: wrap;
}

.rw-btn-primary {
background: var(--green); color: white;
border: none; border-radius: 12px;
padding: 14px 32px;
font-family: var(--font-body); font-size: 15px; font-weight: 500;
cursor: pointer;
transition: all 0.2s;
box-shadow: 0 4px 16px rgba(61,107,82,0.25);
}
.rw-btn-primary:hover { background: var(--green-light); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,107,82,0.3); }

.rw-btn-secondary {
background: white; color: var(--text);
border: 1px solid var(--border-mid); border-radius: 12px;
padding: 14px 32px;
font-family: var(--font-body); font-size: 15px; font-weight: 400;
cursor: pointer;
transition: all 0.2s;
}
.rw-btn-secondary:hover { border-color: var(--green); color: var(--green); transform: translateY(-1px); }

/* FEATURES */
.rw-features {
max-width: 920px; margin: 0 auto;
padding: 0 32px 64px;
display: grid;
grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
gap: 14px;
}

.rw-feature-card {
background: white;
border: 1px solid var(--border);
border-radius: var(--radius);
padding: 22px 20px;
transition: all 0.2s;
}
.rw-feature-card:hover { border-color: var(--green-mid); box-shadow: var(--shadow); transform: translateY(-2px); }

.rw-feature-icon { font-size: 26px; margin-bottom: 12px; }
.rw-feature-title { font-family: var(--font-display); font-size: 16px; font-weight: 400; color: var(--text); margin-bottom: 7px; }
.rw-feature-desc { font-size: 13px; color: var(--text-light); line-height: 1.7; font-weight: 300; }

/* TESTIMONIAL */
.rw-testimonial {
max-width: 680px; margin: 0 auto 64px;
padding: 0 32px;
text-align: center;
}

.rw-testimonial blockquote {
font-family: var(--font-display);
font-size: 21px; font-weight: 300; font-style: italic;
color: var(--text);
line-height: 1.6;
margin-bottom: 14px;
position: relative;
}

.rw-testimonial cite { font-size: 13px; color: var(--text-light); font-style: normal; }

/* CTA SECTION */
.rw-cta {
max-width: 920px; margin: 0 auto 80px;
padding: 0 32px;
text-align: center;
}

.rw-trial-note { font-size: 12px; color: var(--text-dim); margin-bottom: 14px; }
.rw-legal-note { margin-top: 14px; font-size: 12px; color: var(--text-dim); }
.rw-legal-link { color: var(--green); cursor: pointer; text-decoration: underline; }

/* PRICING */
.rw-pricing {
max-width: 920px; margin: 0 auto;
padding: 64px 32px;
}

.rw-pricing-header { text-align: center; margin-bottom: 40px; }

.rw-pricing-header h1 {
font-family: var(--font-display);
font-size: 40px; font-weight: 300;
color: var(--text);
margin-bottom: 10px;
}

.rw-pricing-header p { font-size: 15px; color: var(--text-mid); font-weight: 300; }

.rw-toggle {
display: inline-flex; align-items: center; gap: 12px;
background: white;
border: 1px solid var(--border);
border-radius: 40px;
padding: 8px 18px;
margin-top: 24px;
}

.rw-toggle-label { font-size: 13px; color: var(--text-light); }
.rw-toggle-label.active { color: var(--text); font-weight: 500; }

.rw-toggle-switch {
width: 42px; height: 22px;
background: var(--green-mid);
border-radius: 11px;
position: relative;
cursor: pointer;
transition: background 0.3s;
}
.rw-toggle-switch.on { background: var(--green); }
.rw-toggle-switch::after {
content: '';
position: absolute;
top: 3px; left: 3px;
width: 16px; height: 16px;
border-radius: 50%;
background: white;
transition: left 0.3s;
box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.rw-toggle-switch.on::after { left: 23px; }

.rw-save-badge {
background: var(--green-pale);
color: var(--green);
border-radius: 10px;
padding: 2px 10px;
font-size: 11px; font-weight: 500;
}

.rw-plans {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
gap: 16px;
margin-bottom: 32px;
}

.rw-plan {
background: white;
border: 1px solid var(--border);
border-radius: 18px;
padding: 28px 22px;
position: relative;
}

.rw-plan.featured {
background: var(--green);
border-color: transparent;
box-shadow: 0 12px 40px rgba(61,107,82,0.25);
}

.rw-plan-badge {
position: absolute; top: -11px; left: 50%;
transform: translateX(-50%);
background: var(--text); color: white;
border-radius: 20px; padding: 3px 14px;
font-size: 10px; font-weight: 500;
letter-spacing: 1px; text-transform: uppercase;
white-space: nowrap;
}

.rw-plan-name {
font-family: var(--font-display);
font-size: 20px; font-weight: 400;
margin-bottom: 3px;
}
.rw-plan.featured .rw-plan-name { color: white; }

.rw-plan-desc { font-size: 12px; color: var(--text-light); margin-bottom: 18px; font-weight: 300; }
.rw-plan.featured .rw-plan-desc { color: rgba(255,255,255,0.7); }

.rw-plan-price {
font-family: var(--font-display);
font-size: 36px; font-weight: 300;
color: var(--green);
margin-bottom: 4px;
}
.rw-plan.featured .rw-plan-price { color: white; }

.rw-plan-saving { font-size: 12px; color: var(--green-light); font-weight: 500; margin-bottom: 20px; }
.rw-plan.featured .rw-plan-saving { color: rgba(255,255,255,0.8); }
.rw-plan-spacer { height: 20px; }

.rw-plan-feature {
display: flex; align-items: flex-start; gap: 8px;
font-size: 13px; color: var(--text-mid);
margin-bottom: 9px; font-weight: 300;
}
.rw-plan.featured .rw-plan-feature { color: rgba(255,255,255,0.9); }
.rw-plan-check { color: var(--green); font-size: 13px; margin-top: 1px; flex-shrink: 0; }
.rw-plan.featured .rw-plan-check { color: rgba(255,255,255,0.9); }

.rw-plan-btn {
margin-top: 22px; width: 100%;
border-radius: 10px; padding: 11px;
font-family: var(--font-body); font-size: 13px; font-weight: 500;
cursor: pointer; transition: all 0.2s;
border: 1px solid var(--border-mid);
background: transparent; color: var(--green);
}
.rw-plan-btn:hover { background: var(--green-pale); }
.rw-plan.featured .rw-plan-btn {
background: rgba(255,255,255,0.2);
border-color: rgba(255,255,255,0.4);
color: white;
}
.rw-plan.featured .rw-plan-btn:hover { background: rgba(255,255,255,0.3); }

/* LOGIN */
.rw-login-wrap {
min-height: 100vh;
display: flex; align-items: center; justify-content: center;
background: var(--cream);
padding: 24px;
}

.rw-login-box {
width: 100%; max-width: 400px;
}

.rw-login-logo {
text-align: center; margin-bottom: 28px;
}

.rw-login-mark {
width: 52px; height: 52px;
background: var(--green);
border-radius: 14px;
display: flex; align-items: center; justify-content: center;
font-family: var(--font-display);
font-size: 22px; font-weight: 600;
color: white;
margin: 0 auto 12px;
}

.rw-login-title {
font-family: var(--font-display);
font-size: 26px; font-weight: 300;
color: var(--text);
margin-bottom: 4px;
}

.rw-login-sub { font-size: 13px; color: var(--text-light); font-weight: 300; }

.rw-card {
background: white;
border: 1px solid var(--border);
border-radius: 18px;
padding: 28px 24px;
box-shadow: var(--shadow);
}

.rw-field { margin-bottom: 16px; }
.rw-label {
display: block;
font-size: 11px; font-weight: 500;
color: var(--text-light);
letter-spacing: 1px; text-transform: uppercase;
margin-bottom: 6px;
}
.rw-input {
width: 100%;
background: var(--cream);
border: 1px solid var(--border);
border-radius: 9px;
padding: 11px 13px;
font-family: var(--font-body); font-size: 14px; font-weight: 300;
color: var(--text);
outline: none;
transition: border-color 0.15s;
}
.rw-input:focus { border-color: var(--green); background: white; }
.rw-input::placeholder { color: var(--text-dim); }

.rw-checkbox-wrap {
display: flex; align-items: flex-start; gap: 10px;
padding: 12px 13px;
background: var(--green-pale);
border: 1px solid var(--green-mid);
border-radius: 10px;
margin-bottom: 18px;
}
.rw-checkbox { width: 15px; height: 15px; margin-top: 2px; cursor: pointer; accent-color: var(--green); flex-shrink: 0; }
.rw-checkbox-label { font-size: 12px; color: var(--text-mid); line-height: 1.6; font-weight: 300; cursor: pointer; }

.rw-error {
background: rgba(220,38,38,0.07);
border: 1px solid rgba(220,38,38,0.2);
border-radius: 8px;
padding: 9px 12px;
font-size: 12px; color: #dc2626;
margin-bottom: 14px;
}

.rw-submit {
width: 100%;
background: var(--green); color: white;
border: none; border-radius: 10px;
padding: 12px;
font-family: var(--font-body); font-size: 14px; font-weight: 500;
cursor: pointer;
transition: all 0.2s;
}
.rw-submit:hover { background: var(--green-light); }

.rw-login-footer {
text-align: center; margin-top: 16px;
font-size: 12px; color: var(--text-dim);
line-height: 2;
}

/* APP SHELL */
.rw-shell {
display: flex; flex-direction: column;
height: 100vh;
background: var(--cream);
}

.rw-app-nav {
height: 56px;
display: flex; align-items: center; justify-content: space-between;
padding: 0 20px;
background: white;
border-bottom: 1px solid var(--border);
flex-shrink: 0;
}

.rw-app-info { font-size: 12px; color: var(--text-light); font-weight: 300; }
.rw-app-pills { display: flex; gap: 6px; align-items: center; }
.rw-pill {
background: var(--green-pale);
border: 1px solid var(--green-mid);
border-radius: 20px;
padding: 3px 10px;
font-size: 11px; color: var(--green); font-weight: 400;
}

.rw-app-btn {
background: none; border: 1px solid var(--border);
border-radius: 7px; padding: 5px 11px;
font-family: var(--font-body); font-size: 12px;
color: var(--text-light); cursor: pointer;
transition: all 0.15s;
}
.rw-app-btn:hover { border-color: var(--green-mid); color: var(--green); }

.rw-privacy-bar {
padding: 5px 20px;
background: var(--green-pale);
border-bottom: 1px solid var(--green-mid);
display: flex; align-items: center; justify-content: space-between;
flex-shrink: 0;
}
.rw-privacy-bar span { font-size: 11px; color: var(--green); font-weight: 300; }

/* CHAT */
.rw-chat {
flex: 1; overflow-y: auto;
padding: 20px;
}

.rw-welcome {
max-width: 600px; margin: 32px auto 0;
}

.rw-welcome-title {
font-family: var(--font-display);
font-size: 24px; font-weight: 300;
color: var(--text);
text-align: center;
margin-bottom: 6px;
}

.rw-welcome-sub {
font-size: 14px; color: var(--text-light); font-weight: 300;
text-align: center; margin-bottom: 28px;
}

.rw-prompts {
display: grid; grid-template-columns: 1fr 1fr;
gap: 8px; margin-bottom: 14px;
}

.rw-prompt-btn {
background: white;
border: 1px solid var(--border);
border-radius: 12px;
padding: 13px 14px;
text-align: left; cursor: pointer;
display: flex; align-items: flex-start; gap: 10px;
transition: all 0.2s;
}
.rw-prompt-btn:hover { border-color: var(--green-mid); background: var(--green-pale); transform: translateY(-1px); box-shadow: var(--shadow); }

.rw-prompt-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.rw-prompt-text { flex: 1; }
.rw-prompt-title { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 2px; }
.rw-prompt-sub { font-size: 11px; color: var(--text-dim); font-weight: 300; }

.rw-emergency-bar {
background: rgba(220,38,38,0.05);
border: 1px solid rgba(220,38,38,0.15);
border-radius: 10px;
padding: 9px 14px;
display: flex; align-items: center; gap: 9px;
font-size: 12px; color: #b91c1c;
font-weight: 300;
}

/* MESSAGES */
.rw-messages { max-width: 680px; margin: 0 auto; }

.rw-msg-row {
display: flex;
margin-bottom: 12px;
}
.rw-msg-row.user { justify-content: flex-end; }
.rw-msg-row.assistant { justify-content: flex-start; }

.rw-avatar {
width: 26px; height: 26px; min-width: 26px;
background: var(--green);
border-radius: 7px;
display: flex; align-items: center; justify-content: center;
font-family: var(--font-display);
font-size: 11px; font-weight: 600; color: white;
margin-right: 8px; margin-top: 2px;
}

.rw-bubble {
max-width: 80%;
padding: 10px 14px;
font-size: 14px; line-height: 1.75; font-weight: 300;
white-space: pre-wrap;
}

.rw-bubble.user {
background: var(--green);
color: white;
border-radius: 16px 16px 3px 16px;
}

.rw-bubble.assistant {
background: white;
color: var(--text);
border: 1px solid var(--border);
border-radius: 16px 16px 16px 3px;
}

.rw-typing {
display: flex; gap: 4px; align-items: center;
padding: 12px 16px;
background: white;
border: 1px solid var(--border);
border-radius: 16px 16px 16px 3px;
}

.rw-dot {
width: 6px; height: 6px;
border-radius: 50%;
background: var(--green-mid);
animation: rw-bounce 1.2s ease-in-out infinite;
}
.rw-dot:nth-child(2) { animation-delay: 0.2s; }
.rw-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes rw-bounce {
0%, 100% { transform: translateY(0); }
50% { transform: translateY(-5px); }
}

/* INPUT */
.rw-input-wrap {
padding: 10px 20px 16px;
border-top: 1px solid var(--border);
background: white;
flex-shrink: 0;
}

.rw-input-box {
max-width: 680px; margin: 0 auto;
display: flex; gap: 8px;
background: var(--cream);
border: 1px solid var(--border);
border-radius: 13px;
padding: 9px 12px;
align-items: flex-end;
transition: border-color 0.15s;
}
.rw-input-box:focus-within { border-color: var(--green-mid); background: white; }

.rw-textarea {
flex: 1;
background: transparent; border: none; outline: none;
font-family: var(--font-body); font-size: 14px; font-weight: 300;
color: var(--text);
resize: none; line-height: 1.6;
max-height: 120px; overflow-y: auto;
}
.rw-textarea::placeholder { color: var(--text-dim); }

.rw-send {
width: 32px; height: 32px; min-width: 32px;
border-radius: 8px; border: none;
display: flex; align-items: center; justify-content: center;
font-size: 15px;
cursor: pointer;
transition: all 0.15s;
}
.rw-send.active { background: var(--green); color: white; }
.rw-send.active:hover { background: var(--green-light); }
.rw-send.inactive { background: var(--green-pale); color: var(--text-dim); cursor: not-allowed; }

.rw-input-hint {
max-width: 680px; margin: 6px auto 0;
font-size: 11px; color: var(--text-dim); font-weight: 300;
text-align: center;
}

/* LEGAL MODAL */
.rw-overlay {
position: fixed; inset: 0; z-index: 500;
background: rgba(0,0,0,0.35);
display: flex; align-items: center; justify-content: center;
padding: 20px;
}

.rw-modal {
background: white;
border-radius: 18px;
padding: 32px 28px;
max-width: 540px; width: 100%;
max-height: 85vh; overflow-y: auto;
box-shadow: 0 24px 80px rgba(0,0,0,0.15);
}

.rw-modal h2 {
font-family: var(--font-display);
font-size: 22px; font-weight: 400;
color: var(--text);
margin-bottom: 20px;
}

.rw-legal-section { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid var(--border); }
.rw-legal-section:last-child { border-bottom: none; }
.rw-legal-title { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 5px; }
.rw-legal-body { font-size: 13px; color: var(--text-mid); line-height: 1.75; font-weight: 300; }
.rw-legal-date { font-size: 11px; color: var(--text-dim); margin-top: 12px; }

.rw-modal-close {
margin-top: 18px;
background: var(--green); color: white;
border: none; border-radius: 9px;
padding: 10px 24px;
font-family: var(--font-body); font-size: 13px; font-weight: 500;
cursor: pointer;
}

@media (max-width: 600px) {
.rw-hero h1 { font-size: 36px; }
.rw-prompts { grid-template-columns: 1fr; }
.rw-plans { grid-template-columns: 1fr; }
.rw-nav { padding: 0 16px; }
.rw-hero { padding: 48px 16px 40px; }
}
`;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function App() {
const [page, setPage] = useState("landing");
const [client, setClient] = useState(null);
const [msgs, setMsgs] = useState([]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [email, setEmail] = useState("");
const [pass, setPass] = useState("");
const [loginErr, setLoginErr] = useState("");
const [annual, setAnnual] = useState(false);
const [agreed, setAgreed] = useState(false);
const [showLegal, setShowLegal] = useState(false);
const endRef = useRef(null);
const textRef = useRef(null);

useEffect(() => {
const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);
return () => document.head.removeChild(style);
}, []);

useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

const login = () => {
if (!agreed) { setLoginErr("Please accept the Terms of Use first."); return; }
const found = DEMO_ACCOUNTS.find(a => a.email === email && a.password === pass);
if (found) { setClient(found); setPage("app"); setLoginErr(""); }
else setLoginErr("Invalid credentials. Try demo@abilityfirst.com.au / demo123");
};

const send = useCallback(async (text) => {
const msg = text || input.trim();
if (!msg || loading) return;
setInput("");
if (textRef.current) textRef.current.style.height = "auto";
const next = [...msgs, { role: "user", content: msg }];
setMsgs(next);
setLoading(true);
try {
const res = await fetch(`${API}/chat`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
messages: next,
context: client ? { org: client.org, plan: client.plan, workers: client.workers, participants: client.participants } : {},
}),
});
if (!res.ok) throw new Error();
const data = await res.json();
setMsgs([...next, { role: "assistant", content: data.reply || "No response received." }]);
} catch {
setMsgs([...next, { role: "assistant", content: "Server error. Please check your connection and try again." }]);
} finally { setLoading(false); }
}, [msgs, input, loading, client]);

const LegalModal = () => (
<div className="rw-overlay" onClick={() => setShowLegal(false)}>
<div className="rw-modal" onClick={e => e.stopPropagation()}>
<h2>Terms of Use & Privacy Notice</h2>
{LEGAL_SECTIONS.map((s, i) => (
<div key={i} className="rw-legal-section">
<div className="rw-legal-title">{i + 1}. {s.title}</div>
<div className="rw-legal-body">{s.body}</div>
</div>
))}
<div className="rw-legal-date">Last updated: May 2026</div>
<button className="rw-modal-close" onClick={() => setShowLegal(false)}>Close</button>
</div>
</div>
);

// ── LANDING ──
if (page === "landing") return (
<div className="rw-app">
{showLegal && <LegalModal />}
<nav className="rw-nav">
<div className="rw-logo">
<div className="rw-logo-mark">Rw</div>
<span className="rw-logo-name">RosterWise</span>
</div>
<div className="rw-nav-links">
<button className="rw-nav-link" onClick={() => setPage("pricing")}>Pricing</button>
<button className="rw-nav-link" onClick={() => setShowLegal(true)}>Legal</button>
<button className="rw-nav-cta" onClick={() => setPage("login")}>Log in</button>
</div>
</nav>

<div className="rw-hero">
<div className="rw-badge">Built for Australian NDIS Providers</div>
<h1>Your rostering coordinator,<br /><em>available around the clock.</em></h1>
<p>Expert help with shift scheduling, SCHADS compliance, last-minute cancellations, and audit documentation — without the expensive salary and on-costs.</p>
<div className="rw-hero-btns">
<button className="rw-btn-primary" onClick={() => setPage("login")}>Start free trial →</button>
<button className="rw-btn-secondary" onClick={() => setPage("pricing")}>See pricing</button>
</div>
</div>

<div className="rw-features">
{[
["🚨", "Last-minute cancellations", "Immediate cover plans, qualified worker matching, and ready-to-send messages — even at 6am Sunday."],
["⚖️", "SCHADS Award compliance", "Accurate penalty rates, overtime calculations, and underpayment checks before they become Fair Work complaints."],
["📋", "Proactive roster building", "2–4 week rosters factoring worker skills, travel time, contracted hours, and participant preferences."],
["✉️", "Stakeholder communications", "Draft professional messages to workers, families, support coordinators, and management instantly."],
["✅", "Audit readiness", "Stay compliant with 2026 NDIS reforms, PACE payment system requirements, and documentation standards."],
["⏰", "After-hours intelligence", "No on-call coordinator salary needed. RosterWise handles the thinking while you sleep."],
].map(([icon, title, desc]) => (
<div key={title} className="rw-feature-card">
<div className="rw-feature-icon">{icon}</div>
<div className="rw-feature-title">{title}</div>
<div className="rw-feature-desc">{desc}</div>
</div>
))}
</div>

<div className="rw-testimonial">
<blockquote>"We were about to hire a rostering coordinator on an expensive salary. RosterWise handled the same problems for a fraction of the cost — and it's available at 6am on a Sunday."</blockquote>
<cite>— NDIS Provider, Melbourne</cite>
</div>

<div className="rw-cta">
<div className="rw-trial-note">30-day free trial · No credit card required · Cancel anytime</div>
<button className="rw-btn-primary" onClick={() => setPage("login")}>Try RosterWise free for 30 days</button>
<div className="rw-legal-note">
By using RosterWise you agree to our{" "}
<span className="rw-legal-link" onClick={() => setShowLegal(true)}>Terms of Use & Privacy Notice</span>
</div>
</div>
</div>
);

// ── PRICING ──
if (page === "pricing") return (
<div className="rw-app">
{showLegal && <LegalModal />}
<nav className="rw-nav">
<div className="rw-logo" onClick={() => setPage("landing")} style={{ cursor: "pointer" }}>
<div className="rw-logo-mark">Rw</div>
<span className="rw-logo-name">RosterWise</span>
</div>
<div className="rw-nav-links">
<button className="rw-nav-link" onClick={() => setShowLegal(true)}>Legal</button>
<button className="rw-nav-cta" onClick={() => setPage("login")}>Log in</button>
</div>
</nav>
<div className="rw-pricing">
<div className="rw-pricing-header">
<h1>Simple, honest pricing</h1>
<p>Hiring a rostering coordinator costs over $60K in salary alone.<br />RosterWise starts at $297/month.</p>
<div className="rw-toggle">
<span className={`rw-toggle-label ${!annual ? "active" : ""}`}>Monthly</span>
<div className={`rw-toggle-switch ${annual ? "on" : ""}`} onClick={() => setAnnual(!annual)} />
<span className={`rw-toggle-label ${annual ? "active" : ""}`}>Annual</span>
{annual && <span className="rw-save-badge">Save 20%</span>}
</div>
</div>
<div className="rw-plans">
{PLANS.map(plan => (
<div key={plan.name} className={`rw-plan ${plan.highlight ? "featured" : ""}`}>
{plan.highlight && <div className="rw-plan-badge">Most Popular</div>}
<div className="rw-plan-name">{plan.name}</div>
<div className="rw-plan-desc">{plan.desc}</div>
<div className="rw-plan-price">
{annual ? `$${plan.annualPrice.toLocaleString()}/yr` : `$${plan.price}/mo`}
</div>
{annual
? <div className="rw-plan-saving">Save ${Math.round(plan.price * 12 * 0.2).toLocaleString()} per year</div>
: <div className="rw-plan-spacer" />
}
{plan.features.map(f => (
<div key={f} className="rw-plan-feature">
<span className="rw-plan-check">✓</span>{f}
</div>
))}
<button className="rw-plan-btn" onClick={() => setPage("login")}>Start free trial</button>
</div>
))}
</div>
<div style={{ textAlign: "center", fontSize: 13, color: "var(--text-dim)" }}>
All plans include a 30-day free trial · No credit card required · Cancel anytime<br />
<span className="rw-legal-link" onClick={() => setShowLegal(true)}>Terms of Use & Privacy Notice</span>
{" · "}
<span className="rw-legal-link" onClick={() => setPage("landing")}>← Back to home</span>
</div>
</div>
</div>
);

// ── LOGIN ──
if (page === "login") return (
<div className="rw-login-wrap">
{showLegal && <LegalModal />}
<div className="rw-login-box">
<div className="rw-login-logo">
<div className="rw-login-mark">Rw</div>
<div className="rw-login-title">Welcome back</div>
<div className="rw-login-sub">Sign in to your RosterWise account</div>
</div>
<div className="rw-card">
<div className="rw-field">
<label className="rw-label">Email</label>
<input className="rw-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@organisation.com.au" />
</div>
<div className="rw-field">
<label className="rw-label">Password</label>
<input className="rw-input" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="••••••••" />
</div>
<div className="rw-checkbox-wrap">
<input className="rw-checkbox" type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
<label className="rw-checkbox-label" htmlFor="agree">
I agree to the{" "}
<span className="rw-legal-link" onClick={() => setShowLegal(true)}>Terms of Use & Privacy Notice</span>.
I understand RosterWise provides general guidance only, I will not enter identifiable participant data, and I am responsible for all rostering decisions.
</label>
</div>
{loginErr && <div className="rw-error">{loginErr}</div>}
<button className="rw-submit" onClick={login}>Sign in</button>
<div className="rw-login-footer">
Demo: demo@abilityfirst.com.au / demo123<br />
<span className="rw-legal-link" onClick={() => setPage("landing")}>← Back to home</span>
</div>
</div>
</div>
</div>
);

// ── MAIN APP ──
const hour = new Date().getHours();
const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

return (
<div className="rw-shell">
{showLegal && <LegalModal />}

<div className="rw-app-nav">
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<div className="rw-logo-mark" style={{ width: 30, height: 30, fontSize: 13 }}>Rw</div>
<div>
<div style={{ fontSize: 14, fontWeight: 500, color: "var(--green)", fontFamily: "var(--font-display)" }}>RosterWise</div>
<div className="rw-app-info">{client?.org}</div>
</div>
</div>
<div className="rw-app-pills">
<span className="rw-pill">👥 {client?.workers} workers</span>
<span className="rw-pill">🧑 {client?.participants} participants</span>
<span className="rw-pill">{client?.plan}</span>
<button className="rw-app-btn" onClick={() => setShowLegal(true)}>Legal</button>
<button className="rw-app-btn" onClick={() => { setPage("landing"); setClient(null); setMsgs([]); }}>Sign out</button>
</div>
</div>

<div className="rw-privacy-bar">
<span>🔒 Use first names or participant codes only — do not enter NDIS numbers or full identifying details</span>
<span className="rw-legal-link" style={{ fontSize: 11 }} onClick={() => setShowLegal(true)}>Terms</span>
</div>

<div className="rw-chat">
{msgs.length === 0 && (
<div className="rw-welcome">
<div className="rw-welcome-title">{greeting} 👋</div>
<div className="rw-welcome-sub">What rostering challenge can I help you with today?</div>
<div className="rw-prompts">
{QUICK_PROMPTS.map(p => (
<button key={p.title} className="rw-prompt-btn" onClick={() => send(p.text)}>
<span className="rw-prompt-icon">{p.icon}</span>
<div className="rw-prompt-text">
<div className="rw-prompt-title">{p.title}</div>
<div className="rw-prompt-sub">{p.subtitle}</div>
</div>
</button>
))}
</div>
<div className="rw-emergency-bar">
<span>🚨</span>
<span><strong>Life-threatening emergency?</strong> Call 000 immediately. RosterWise is a decision-support tool — not an emergency service.</span>
</div>
</div>
)}

<div className="rw-messages">
{msgs.map((m, i) => (
<div key={i} className={`rw-msg-row ${m.role}`}>
{m.role === "assistant" && <div className="rw-avatar">Rw</div>}
<div className={`rw-bubble ${m.role}`}>{m.content}</div>
</div>
))}
{loading && (
<div className="rw-msg-row assistant">
<div className="rw-avatar">Rw</div>
<div className="rw-typing">
<div className="rw-dot" />
<div className="rw-dot" />
<div className="rw-dot" />
</div>
</div>
)}
<div ref={endRef} />
</div>
</div>

<div className="rw-input-wrap">
<div className="rw-input-box">
<textarea
ref={textRef}
className="rw-textarea"
value={input}
onChange={e => setInput(e.target.value)}
onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
placeholder="Describe your rostering situation..."
rows={1}
onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
/>
<button
className={`rw-send ${input.trim() && !loading ? "active" : "inactive"}`}
onClick={() => send()}
disabled={!input.trim() || loading}
>↑</button>
</div>
<div className="rw-input-hint">
Enter to send · Shift+Enter for new line · Always verify SCHADS rates with Fair Work Australia
</div>
</div>
</div>
);
}