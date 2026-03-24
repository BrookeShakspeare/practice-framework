import { useState, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  bg: "#F7F3EE", bgDeep: "#EDE7DC", canvas: "#FDFAF6",
  inkMid: "#3D3128", inkFaint: "#7A6B5C", inkGhost: "#B5A898",
  line: "#C8B8A2", lineFaint: "#E0D4C4",
  domains: {
    values:     { bg: "#E8F0E4", border: "#7AAB68", text: "#2E5020" },
    theories:   { bg: "#E4EAF4", border: "#5878C0", text: "#1C2E6A" },
    approaches: { bg: "#F4EDE4", border: "#C07840", text: "#5A2E10" },
    influences: { bg: "#F0E4F0", border: "#9058A8", text: "#3A1050" },
    self:       { bg: "#F4E8E4", border: "#C05060", text: "#5A1020" },
    context:    { bg: "#E4F0F0", border: "#408888", text: "#103838" },
  },
};

// ─── EDITOR DOMAINS ──────────────────────────────────────────────────────────
const DOMAINS = [
  { id: "values", label: "Core Values", icon: "◈", desc: "The ethical commitments and principles that anchor your practice",
    prompts: ["What do you believe about people and their capacity for change?", "What justice or rights principles guide your work?", "What does it mean to you to 'do no harm'?"],
    suggestions: ["Human dignity","Self-determination","Social justice","Anti-oppression","Unconditional positive regard","Cultural humility","Transparency","Partnership","Strengths-based","Trauma-informed"] },
  { id: "theories", label: "Theoretical Frameworks", icon: "◇", desc: "The formal theories and models that explain human behaviour and change",
    prompts: ["Which theories do you draw on most frequently?", "How do neuroscience, nervous system science, attachment theory and developmental theories shape your thinking and inform the foundations of your practice?", "What is your theory of change?"],
    suggestions: ["Structural Family Therapy","Strategic Family Therapy","Milan Systemic Therapy","Bowen Family Systems","Experiential FT (Satir)","Narrative Therapy","Solution-Focused Brief Therapy","Polyvagal Theory","Attachment Theory","Dyadic Developmental Psychotherapy","Mentalization-Based Therapy","Interpersonal Neurobiology","Developmental Psychology","CBT","DBT","ACT","EMDR","Psychodynamic / Psychoanalytic","Person-Centred Therapy","Motivational Interviewing","Trauma-Informed Practice","Somatic Approaches","Systems Theory","Social Constructionism","Ecological / Ecosystems Theory","Family Life Cycle Theory","Feminist Theory","Anti-Oppressive Practice","Indigenous Knowledge Frameworks"] },
  { id: "approaches", label: "Practice Approaches", icon: "◆", desc: "The methods, techniques and therapeutic modalities you use in session",
    prompts: ["What do you actually do in session?", "How do you select techniques — intuition or formulation?", "Where is your practice most intentional vs. reactive?"],
    suggestions: ["Genograms","Timelines","Sociograms","Family Life Cycle mapping","Ecomaps","Circular questioning","Hypothesising","Positive connotation","Reframing","Externalisation","Reflecting teams","Enactments","Sculpting","Scaling questions","Miracle question","Identifying exceptions","Unique outcomes","Re-storying / re-authoring","Letter writing","PACE","Mentalizing","Epistemic trust building","Safety-based interventions","Co-regulation","Mindfulness","Boundary setting","Joining & accommodation","Parts work / IFS","Somatic interventions","Play / expressive therapies","Psychoeducation","Case formulation","Collaborative goal setting"] },
  { id: "influences", label: "Key Influences", icon: "○", desc: "Thinkers, training, supervisors, and experiences that have shaped you",
    prompts: ["Who are the supervisors or mentors who shaped how you think?", "What training has most changed your practice?", "Which authors or theorists do you return to?"],
    suggestions: ["Training programme","Previous supervisors","Key texts/authors","Lived experience","Cultural knowledge","Research/evidence base","Colleagues","Personal therapy","Cultural consultation"] },
  { id: "self", label: "Use of Self", icon: "◉", desc: "Your Way of Being — what you bring as a person into the therapeutic relationship",
    prompts: ["How does your positionality (GRACES) show up in your work?", "What do clients experience of you in the room?", "What personal material gets activated in your practice?", "What life experiences, lived experiences and family of origin stories are present and influence how you show up in the room — and how do you bring the fullness of yourself as a therapist?"],
    suggestions: ["Cultural identity","Family of origin","Relational style","Nervous system patterns","Personal values in action","Blind spots","Compassion & limits","Self-disclosure practice","Embodied presence"] },
  { id: "context", label: "Context & System", icon: "□", desc: "The organisational, professional and social context of your practice",
    prompts: ["How does your agency shape what supervision is?", "What systemic pressures affect your caseload?", "Whose voice is absent from your supervision?"],
    suggestions: ["Organisational mandate","Funding constraints","Professional registration","Team culture","Referring system","Client community","Policy environment","Intersecting services"] },
];

// ─── SATELLITE DEFINITIONS ───────────────────────────────────────────────────
// These are the 6 knowledge-base nodes orbiting the SIPM.
// Each has a title, colour, icon, reflection prompts, and example suggestions.
// 9 satellites at 40° intervals around the SIPM
const SAT_DEFS = [
  {
    id: "systems", angle: -90,
    title: "Systems & Complexity Thinking", icon: "◎",
    tagline: "How you understand relationship, pattern, context and circularity",
    color: { bg: "#E6F0F8", border: "#3A68B0", text: "#162848" },
    prompts: [
      "Which aspects of systems and complexity thinking most shape how you see your clients and their world?",
      "How do you hold circularity, non-linearity and context in mind during your work?",
      "What systems frameworks — structural, Milan, ecological, complexity — sit at the heart of how you think?",
      "How does Indigenous systems wisdom and relational thinking inform your understanding of people and change?",
      "How does your professional discipline's dominant paradigm sit alongside systemic thinking — where does it fit, and where is there tension?",
    ],
    suggestions: ["Circularity","Structural FT (Minuchin)","Milan Systemic Therapy","Ecological / ecosystems thinking","Bowen Family Systems","Non-linear causality","Complexity science","Chaos theory","Irreducible wholeness","Goodchild's relational systems","General Systems Theory","Family as emotional unit","Bateson's ecology of mind"],
  },
  {
    id: "foundational", angle: -50,
    title: "Foundational Theories", icon: "◈",
    tagline: "The developmental, neuroscience & attachment theories underpinning your practice",
    color: { bg: "#EAF5EC", border: "#3A8A58", text: "#163820" },
    prompts: [
      "How do attachment theory and developmental psychology shape how you understand your clients?",
      "How does nervous system science and neurobiology inform how you create safety in the room?",
      "Which developmental or trauma frameworks are foundational for you — and why?",
      "How do you draw on interpersonal neurobiology or polyvagal theory in practice?",
      "How does your professional discipline's training in these areas shape what you foreground and what you overlook?",
    ],
    suggestions: ["Attachment Theory (Bowlby)","Polyvagal Theory (Porges)","Interpersonal Neurobiology (Siegel)","Developmental Psychology","Dyadic Developmental Psychotherapy","Mentalization (Fonagy)","Trauma-Informed Practice","Neurobiology of safety","PACE framework (DDP)","Adverse Childhood Experiences (ACEs)","Epigenetics","Window of tolerance (Ogden)"],
  },
  {
    id: "epistemology", angle: -10,
    title: "Epistemological Frameworks", icon: "◉",
    tagline: "How you know what you know — the paradigms shaping your understanding of reality",
    color: { bg: "#F0EBF8", border: "#7048B0", text: "#2A1050" },
    prompts: [
      "What is your theory of knowledge — how do you understand truth, reality and meaning in your practice?",
      "How do postmodern ideas shape your relationship with certainty, expertise and clinical authority?",
      "How does social constructionism inform how you understand problems, solutions and the stories clients bring?",
      "Where does your practice sit in relation to modernist and postmodern ways of knowing — and how do you hold that tension?",
      "How has your thinking about knowledge and truth shifted over your professional life?",
    ],
    suggestions: ["Social constructionism","Postmodernism","Critical realism","Phenomenology","Modernism vs postmodernism","Multiple realities","Narrative epistemology","Not-knowing stance","Second-order cybernetics","Constructivism","Collaborative language systems (Anderson & Goolishian)","Reflecting processes (Andersen)"],
  },
  {
    id: "humanrights", angle: 30,
    title: "Human Rights Frameworks", icon: "◇",
    tagline: "The rights-based commitments that ground your ethical practice",
    color: { bg: "#F5EAE6", border: "#B05030", text: "#481810" },
    prompts: [
      "Which human rights frameworks actively inform how you practice?",
      "How do you hold the rights of children, families and communities in your clinical work?",
      "How does the right to self-determination shape how you work with clients?",
      "Which rights-based obligations feel most live and most challenging in your current context?",
      "How does your professional discipline's approach to rights align with or diverge from a social work perspective?",
    ],
    suggestions: ["UNCROC (UN Convention on Rights of the Child)","UNDRIP (Rights of Indigenous Peoples)","CRPD (Rights of People with Disability)","Right to self-determination","Right to cultural identity","Dignity and inherent worth","Children's right to be heard","Family preservation principles","Least restrictive intervention","Right to community participation"],
  },
  {
    id: "antioppressive", angle: 70,
    title: "Anti-Oppressive Practice", icon: "◆",
    tagline: "How you hold power, privilege and structural inequality in your work",
    color: { bg: "#F5E6F0", border: "#A03880", text: "#481830" },
    prompts: [
      "How do you actively work against oppression and discrimination in your practice?",
      "What does your Social GRACES analysis reveal about your positionality with clients?",
      "How do you recognise and respond to structural inequalities that affect your clients' lives?",
      "Where does your practice risk re-enacting colonising or oppressive patterns — and how do you interrupt this?",
      "How does your professional discipline's history sit in relation to oppression — and what does that mean for your practice today?",
    ],
    suggestions: ["Social GRACES framework","Intersectionality","Decolonising practice","Anti-racist practice","Feminist practice","Critical reflexivity","Power analysis","Privilege awareness","Community development lens","Structural social work","White privilege","Ableism & disability justice"],
  },
  {
    id: "cultural", angle: 110,
    title: "Cultural & Contextual Frameworks", icon: "⬡",
    tagline: "The cultural knowledges, country and community frameworks that inform your understanding of wellbeing",
    color: { bg: "#FFF0E0", border: "#C06820", text: "#5A2800" },
    prompts: [
      "What cultural knowledges inform how you understand wellbeing, distress and healing?",
      "Whose knowledge systems are centred in your practice — and whose are marginalised or invisible?",
      "How do you hold country, community and cultural identity as living frameworks — not just background context?",
      "How does your own cultural location shape what you see and don't see in the clinical room?",
      "How do you practice cultural safety — and what does that require of you personally and professionally?",
    ],
    suggestions: ["Aboriginal & Torres Strait Islander knowledges","Te Tiriti o Waitangi","Cultural safety","Cultural humility","Country and place","Community as context","Collectivist worldviews","Kinship systems","Cultural identity & belonging","Refugee & diaspora experience","Acculturation & cultural stress","Spiritual & religious frameworks"],
  },
  {
    id: "ethics", angle: 150,
    title: "Professional Ethics & Codes", icon: "○",
    tagline: "The ethical frameworks and professional obligations that shape your practice",
    color: { bg: "#F5F0E0", border: "#907020", text: "#3A2C00" },
    prompts: [
      "Which professional code of ethics applies to your practice — and how does it live in your day-to-day work?",
      "How do duty of care, confidentiality and informed consent shape how you work?",
      "Where do ethical tensions or dilemmas most commonly arise in your practice?",
      "How does your commitment to supervision connect to your professional and ethical obligations?",
      "How do the ethical frameworks of your discipline sit alongside those of other disciplines you work with?",
    ],
    suggestions: ["AASW Code of Ethics","PACFA Code of Ethics","ANZAPPL","APS Ethical Guidelines","OT Australia Ethics","Duty of care","Informed consent","Confidentiality & limits","Mandatory reporting","Scope of practice","Cultural safety obligations","Supervision requirements","Vicarious trauma obligations"],
  },
  {
    id: "philosophy", angle: 190,
    title: "Philosophy of Practice & Professional Identity", icon: "◐",
    tagline: "Why this work — your theory of the person, of change, and of what it means to help",
    color: { bg: "#E8F5F0", border: "#208870", text: "#083828" },
    prompts: [
      "What is your philosophy of what it means to help another person?",
      "What is your theory of the person — how do you understand human nature, suffering and growth?",
      "How does your professional discipline shape what you think change looks like — and is that the same as what you actually believe?",
      "How has your philosophy of practice evolved over your career — what has shifted and why?",
      "What does it mean to you to work systemically when your discipline's dominant paradigm may be individualistic?",
    ],
    suggestions: ["Existentialism","Phenomenology","Virtue ethics","Relational ethics","Theory of the person","Theory of change","Humanistic psychology","Positive psychology","Philosophy of mind","Meaning-making frameworks","Professional identity","Interdisciplinary practice","Conscious competence"],
  },
  {
    id: "contemporary", angle: 230,
    title: "Contemporary Social Context", icon: "◑",
    tagline: "The broader social, political and cultural water your clients — and you — are swimming in",
    color: { bg: "#EEF0F8", border: "#485898", text: "#181830" },
    prompts: [
      "How does the instability and pace of contemporary life — liquid modernity — show up in your clinical room?",
      "How do you hold the social and political context of your clients' lives in your thinking, not just their individual stories?",
      "How are late capitalism, precarity and inequality shaping the presentations you see?",
      "How do you think about digital life, social media and technology as part of your clients' relational world?",
      "How does climate anxiety, ecological grief or the broader environmental context appear in your work?",
    ],
    suggestions: ["Liquid modernity (Bauman)","Late capitalism & precarity","Digital life & social media","Climate anxiety & ecological grief","Social isolation & loneliness","Intergenerational trauma","Post-pandemic context","Globalisation & displacement","Cultural dislocation","Economic inequality","Housing & food insecurity","Political polarisation"],
  },
];

// ─── CHIP & PILL ─────────────────────────────────────────────────────────────
function Chip({ label, onRemove, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px 4px 12px", borderRadius: "100px", backgroundColor: color.bg, border: `1.5px solid ${color.border}`, color: color.text, fontSize: "12px", fontFamily: "Georgia, serif", lineHeight: 1.4 }}>
      {label}
      <span onClick={onRemove} style={{ cursor: "pointer", opacity: 0.45, fontSize: "11px" }}>✕</span>
    </span>
  );
}

function SuggPill({ label, onClick, color }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: "3px 10px", borderRadius: "100px", cursor: "pointer", backgroundColor: h ? color.bg : "transparent", border: `1px dashed ${color.border}`, color: h ? color.text : T.inkFaint, fontSize: "11px", fontFamily: "Georgia, serif", transition: "all 0.15s", lineHeight: 1.5 }}>
      + {label}
    </button>
  );
}

// ─── DOMAIN CARD (Editor tab) ─────────────────────────────────────────────────
function DomainCard({ domain, items, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const col = T.domains[domain.id];
  const inputRef = useRef(null);
  const add = v => { const t = v.trim(); if (!t || items.includes(t)) return; onAdd(domain.id, t); setInput(""); };
  return (
    <div style={{ backgroundColor: "white", borderRadius: "14px", overflow: "hidden", border: `1.5px solid ${open ? col.border : T.lineFaint}`, boxShadow: open ? `0 4px 24px ${col.border}22` : "0 1px 3px #00000008", transition: "all 0.2s" }}>
      <div onClick={() => { setOpen(o => !o); setTimeout(() => !open && inputRef.current?.focus(), 100); }}
        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", cursor: "pointer", backgroundColor: open ? col.bg : "white", borderBottom: open ? `1px solid ${col.border}33` : "none", transition: "background 0.2s" }}>
        <span style={{ fontSize: "18px", color: col.border }}>{domain.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: T.inkMid, fontFamily: "Georgia, serif" }}>{domain.label}</span>
            {items.length > 0 && <span style={{ fontSize: "10px", color: col.border, backgroundColor: col.bg, border: `1px solid ${col.border}66`, borderRadius: "100px", padding: "1px 7px", fontFamily: "monospace" }}>{items.length}</span>}
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: T.inkFaint, fontFamily: "Georgia, serif", lineHeight: 1.4 }}>{domain.desc}</p>
        </div>
        <span style={{ color: T.inkGhost, fontSize: "12px", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </div>
      {open && (
        <div style={{ padding: "14px 18px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ backgroundColor: col.bg, borderRadius: "8px", padding: "10px 14px", borderLeft: `3px solid ${col.border}` }}>
            <p style={{ margin: "0 0 4px", fontSize: "10px", color: col.border, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>Reflection prompts</p>
            {domain.prompts.map((p, i) => <p key={i} style={{ margin: "3px 0 0", fontSize: "12px", color: col.text, fontFamily: "Georgia, serif", lineHeight: 1.55 }}>· {p}</p>)}
          </div>
          {items.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{items.map(it => <Chip key={it} label={it} color={col} onRemove={() => onRemove(domain.id, it)}/>)}</div>}
          <div style={{ display: "flex", gap: "6px", alignItems: "center", border: `1.5px solid ${focused ? col.border : T.lineFaint}`, borderRadius: "8px", padding: "6px 10px", backgroundColor: "white" }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              onKeyDown={e => e.key === "Enter" && add(input)} placeholder={`Add to ${domain.label.toLowerCase()}…`}
              style={{ flex: 1, border: "none", outline: "none", fontSize: "13px", fontFamily: "Georgia, serif", color: T.inkMid, background: "transparent" }}/>
            <button onClick={() => add(input)} style={{ padding: "3px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", backgroundColor: col.border, color: "white", border: "none", opacity: input.trim() ? 1 : 0.4 }}>Add</button>
          </div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: "10px", color: T.inkGhost, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>Suggestions</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>{domain.suggestions.filter(s => !items.includes(s)).map(s => <SuggPill key={s} label={s} color={col} onClick={() => onAdd(domain.id, s)}/>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SATELLITE PANEL (slide-in drawer) ───────────────────────────────────────
function SatPanel({ sat, items, onAdd, onRemove, onClose }) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const c = sat.color;
  const add = v => { const t = v.trim(); if (!t || items.includes(t)) return; onAdd(sat.id, t); setInput(""); };

  // Load saved reflection text for this satellite
  const storageKey = `pfm_reflection_${sat.id}`;
  const [reflection, setReflection] = useState(() => {
    try { return localStorage.getItem(storageKey) || ""; } catch { return ""; }
  });
  const saveTimer = useRef(null);
  const handleReflectionChange = (val) => {
    setReflection(val);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(storageKey, val); } catch {}
    }, 500);
  };

  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: "380px", height: "100vh", backgroundColor: "white", boxShadow: "-4px 0 32px #00000020", zIndex: 1000, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ backgroundColor: c.bg, borderBottom: `2px solid ${c.border}`, padding: "20px 22px 16px", position: "sticky", top: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "20px", color: c.border }}>{sat.icon}</span>
              <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: "700", color: c.text }}>{sat.title}</h2>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: c.border, fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.4 }}>{sat.tagline}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: T.inkGhost, flexShrink: 0, padding: "0 4px", lineHeight: 1 }}>✕</button>
        </div>
        {items.length > 0 && (
          <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {items.map(it => <Chip key={it} label={it} color={c} onRemove={() => onRemove(sat.id, it)}/>)}
          </div>
        )}
      </div>

      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "18px", flex: 1 }}>
        {/* Reflection prompts */}
        <div>
          <p style={{ margin: "0 0 8px", fontSize: "10px", color: c.border, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Reflection prompts</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sat.prompts.map((p, i) => (
              <div key={i} style={{ backgroundColor: c.bg, borderRadius: "8px", padding: "10px 13px", borderLeft: `3px solid ${c.border}` }}>
                <p style={{ margin: 0, fontSize: "12.5px", color: c.text, fontFamily: "Georgia, serif", lineHeight: 1.6 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Free text reflection */}
        <div>
          <p style={{ margin: "0 0 6px", fontSize: "10px", color: T.inkGhost, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Your reflection</p>
          <textarea value={reflection} onChange={e => handleReflectionChange(e.target.value)} placeholder="Write your reflections on these prompts…" rows={4}
            style={{ width: "100%", border: `1.5px solid ${focused ? c.border : T.lineFaint}`, borderRadius: "8px", padding: "10px 12px", fontSize: "12.5px", fontFamily: "Georgia, serif", color: T.inkMid, resize: "vertical", outline: "none", backgroundColor: T.bg, boxSizing: "border-box", lineHeight: 1.6, transition: "border-color 0.15s" }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}/>
        </div>

        {/* Add items */}
        <div>
          <p style={{ margin: "0 0 6px", fontSize: "10px", color: T.inkGhost, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Add to your framework</p>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", border: `1.5px solid ${T.lineFaint}`, borderRadius: "8px", padding: "6px 10px", backgroundColor: "white" }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              onKeyDown={e => e.key === "Enter" && add(input)} placeholder={`Add to ${sat.title.toLowerCase()}…`}
              style={{ flex: 1, border: "none", outline: "none", fontSize: "13px", fontFamily: "Georgia, serif", color: T.inkMid, background: "transparent" }}/>
            <button onClick={() => add(input)} style={{ padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", backgroundColor: c.border, color: "white", border: "none", opacity: input.trim() ? 1 : 0.4 }}>Add</button>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p style={{ margin: "0 0 7px", fontSize: "10px", color: T.inkGhost, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Examples & suggestions</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {sat.suggestions.filter(s => !items.includes(s)).map(s => <SuggPill key={s} label={s} color={c} onClick={() => onAdd(sat.id, s)}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SVG TEXT HELPER ─────────────────────────────────────────────────────────
function T2({ x, y, rows, size = 9.5, fill = "#1A1410", bold = false, italic = false, dy = 13 }) {
  return rows.map((r, i) => (
    <text key={i} x={x} y={y + i * dy} textAnchor="middle" fontSize={size}
      fontWeight={bold ? "700" : "normal"} fontStyle={italic ? "italic" : "normal"}
      fontFamily="Georgia, serif" fill={fill} style={{ pointerEvents: "none" }}>
      {r}
    </text>
  ));
}

// ─── RING PANEL DEFINITIONS ──────────────────────────────────────────────────
const RING_PANELS = {
  wob: {
    title: "Way of Being",
    tagline: "I-Thou · Unconditional Positive Regard · The foundation of all therapeutic work",
    color: { bg: "#FEF6EE", border: "#C07840", text: "#5A2A10" },
    prompts: [
      "How would you describe your Way of Being with this client — are you in an I-Thou or I-It position, and what tells you that?",
      "What do you notice in yourself when you are with this client — emotionally, somatically, relationally?",
      "How are your own Social GRACES showing up in your work with this client?",
      "What does Unconditional Positive Regard look like for you with this client — where does it come easily, and where is it harder?",
      "How does your Way of Being shift across different clients, contexts or presentations — and what does that tell you?",
      "What life experiences, family of origin stories or personal material are present and influencing how you show up in the room?",
    ],
    gaps: [
      "Where in your Way of Being do you notice the most uncertainty or thin edges?",
      "Which clients or presentations make it hardest to sustain an I-Thou position — and what does that tell you?",
      "What personal work, supervision or learning would most develop your Way of Being as a clinician?",
    ],
    suggestions: ["I-Thou presence","UPR in practice","Congruence & authenticity","Social GRACES reflection","Personal material activated","Embodied presence","Emotional attunement","Relational safety created","Countertransference awareness","I-It moments & recovery"],
  },
  alliance: {
    title: "Therapeutic Alliance",
    tagline: "Goals · Tasks · Bonds · Neuroscience · PACE · Mentalizing",
    color: { bg: "#EFF0FA", border: "#5060B8", text: "#1A2060" },
    prompts: [
      "What type of relationship do you have with this client — customer, complainant, visitor or mandated? How does this shape your approach?",
      "How shared and meaningful are the goals of the work — does the client see themselves as part of the solution?",
      "How safe does the client feel in the room — what tells you this neurobiologically and relationally?",
      "How are you using PACE (Playfulness, Acceptance, Curiosity, Empathy) in your work with this client?",
      "Where is the alliance strongest — with an individual, a subsystem, or the whole family system?",
      "How are you drawing on mentalization and epistemic trust to deepen the alliance?",
    ],
    gaps: [
      "Where do you find alliance-building most challenging — which client types, presentations or contexts?",
      "What neuroscience or attachment knowledge would strengthen how you build and repair alliance?",
      "What would you like to develop in how you hold the systemic alliance across family members?",
    ],
    suggestions: ["Customer relationship","Complainant relationship","Shared goals established","Safety neurobiologically","PACE in practice","Mentalization","Epistemic trust","Right-brain attunement","Alliance rupture & repair","Systemic alliance across members"],
  },
  systemic: {
    title: "Systemic Formulation & Practice",
    tagline: "The Helicopter · Hypothesising · Formulation · Context",
    color: { bg: "#EAF0F8", border: "#3A68B0", text: "#162848" },
    prompts: [
      "What is your systemic hypothesis about what is maintaining the presenting problem?",
      "What does the genogram reveal about multigenerational patterns, triangles, and transmission processes?",
      "How are you holding the full ecosystem — family, school, services, community — in your formulation?",
      "What are the behavioural sequences (the 'dances') around the problem — and what function might the symptom serve in the system?",
      "What are the strengths, resources and resilience in this system that you can build on?",
      "What primary, secondary and rejected pictures are shaping your formulation — and what might you be missing?",
    ],
    gaps: [
      "Where does your systemic formulation feel thin or underdeveloped — what are you not yet seeing?",
      "Which schools of family therapy or systemic tools do you draw on least — and what would it mean to develop these?",
      "What training or practice would most strengthen your systemic assessment and formulation skills?",
    ],
    suggestions: ["Systemic hypothesis","Genogram findings","Ecosystem mapping","Behavioural sequences","Function of symptom","Meaning & narrative","Strengths & resilience","Vertical stressors","Family Life Cycle stage","Multigenerational patterns","Primary picture named"],
  },
  therapy: {
    title: "Therapy & Intervention in the Room",
    tagline: "Grounded in Way of Being · Alliance · Systemic Formulation",
    color: { bg: "#EAF5EC", border: "#3A8A58", text: "#163820" },
    prompts: [
      "Before reflecting on technique — how were your Way of Being, the alliance, and your systemic formulation present and active in this session?",
      "What was your theory of change for this session — and did your interventions align with it?",
      "What did you actually do in the room — which approaches, techniques or modalities did you draw on, and why those?",
      "How intentional vs intuitive were your choices in session — and what does that tell you about your conscious competence?",
      "What was the client's response to your interventions — what worked, what landed, what didn't?",
      "How did you sequence and time your interventions — what shaped your decisions about when to move and when to wait?",
      "What would you do differently — and what does that illuminate about your developing practice?",
      "How did the layers beneath — Way of Being, Alliance, Systemic thinking — support or constrain your interventions?",
    ],
    gaps: [
      "Where do you notice your intervention choices becoming narrow, habitual or reactive rather than intentional?",
      "Which therapeutic modalities or approaches do you want to develop further in your direct practice?",
      "What would more conscious competence look like in your intervention choices — what would you be doing differently?",
    ],
    suggestions: ["Theory of change applied","Intentional intervention","Technique selection rationale","Client response observed","Timing & sequencing","Conscious competence","Intuitive vs deliberate","What worked & why","What didn't land","Would do differently","Integration of layers","Ongoing review process"],
  },
};

// ─── RING PANEL COMPONENT ────────────────────────────────────────────────────
function RingPanel({ ringKey, onClose }) {
  const panel = RING_PANELS[ringKey];
  const c = panel.color;
  const storageKey = `pfm_ring_${ringKey}`;
  const gapsKey    = `pfm_ring_gaps_${ringKey}`;
  const itemsKey   = `pfm_ring_items_${ringKey}`;

  const [reflection, setReflection] = useState(() => { try { return localStorage.getItem(storageKey) || ""; } catch { return ""; } });
  const [gaps,       setGaps]       = useState(() => { try { return localStorage.getItem(gapsKey)    || ""; } catch { return ""; } });
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem(itemsKey) || "[]"); } catch { return []; } });
  const [input, setInput] = useState("");
  const saveTimer = useRef(null);

  const save = (key, val) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { try { localStorage.setItem(key, val); } catch {} }, 500);
  };

  const addItem = (v) => {
    const t = v.trim(); if (!t || items.includes(t)) return;
    const next = [...items, t]; setItems(next); setInput("");
    try { localStorage.setItem(itemsKey, JSON.stringify(next)); } catch {}
  };
  const removeItem = (it) => {
    const next = items.filter(x => x !== it); setItems(next);
    try { localStorage.setItem(itemsKey, JSON.stringify(next)); } catch {}
  };

  const divider = (label) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
      <div style={{ flex: 1, height: "1px", backgroundColor: T.lineFaint }}/>
      <span style={{ fontSize: "9px", color: T.inkGhost, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", backgroundColor: T.lineFaint }}/>
    </div>
  );

  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: "400px", height: "100vh", backgroundColor: "white", boxShadow: "-4px 0 32px #00000020", zIndex: 1000, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ backgroundColor: c.bg, borderBottom: `2px solid ${c.border}`, padding: "20px 22px 16px", position: "sticky", top: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: "700", color: c.text }}>{panel.title}</h2>
            <p style={{ margin: 0, fontSize: "12px", color: c.border, fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.4 }}>{panel.tagline}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: T.inkGhost, flexShrink: 0, padding: "0 4px" }}>✕</button>
        </div>
        {items.length > 0 && (
          <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {items.map(it => <Chip key={it} label={it} color={c} onRemove={() => removeItem(it)}/>)}
          </div>
        )}
      </div>

      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
        {/* Reflection prompts */}
        <div>
          <p style={{ margin: "0 0 8px", fontSize: "10px", color: c.border, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Reflection prompts</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {panel.prompts.map((p, i) => (
              <div key={i} style={{ backgroundColor: c.bg, borderRadius: "8px", padding: "9px 13px", borderLeft: `3px solid ${c.border}` }}>
                <p style={{ margin: 0, fontSize: "12px", color: c.text, fontFamily: "Georgia, serif", lineHeight: 1.6 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection text */}
        <div>
          <p style={{ margin: "0 0 6px", fontSize: "10px", color: T.inkGhost, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Your reflection</p>
          <textarea value={reflection} onChange={e => { setReflection(e.target.value); save(storageKey, e.target.value); }}
            placeholder="Write your reflections on these prompts…" rows={4}
            style={{ width: "100%", border: `1.5px solid ${T.lineFaint}`, borderRadius: "8px", padding: "10px 12px", fontSize: "12.5px", fontFamily: "Georgia, serif", color: T.inkMid, resize: "vertical", outline: "none", backgroundColor: T.bg, boxSizing: "border-box", lineHeight: 1.6 }}/>
        </div>

        {/* Key notes */}
        <div>
          <p style={{ margin: "0 0 6px", fontSize: "10px", color: T.inkGhost, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Key notes & observations</p>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", border: `1.5px solid ${T.lineFaint}`, borderRadius: "8px", padding: "6px 10px", backgroundColor: "white" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem(input)}
              placeholder="Add a key observation…"
              style={{ flex: 1, border: "none", outline: "none", fontSize: "13px", fontFamily: "Georgia, serif", color: T.inkMid, background: "transparent" }}/>
            <button onClick={() => addItem(input)} style={{ padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", backgroundColor: c.border, color: "white", border: "none", opacity: input.trim() ? 1 : 0.4 }}>Add</button>
          </div>
          {items.length > 0 && <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "5px" }}>{items.map(it => <Chip key={it} label={it} color={c} onRemove={() => removeItem(it)}/>)}</div>}
        </div>

        {/* Suggestions */}
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {panel.suggestions.filter(s => !items.includes(s)).map(s => <SuggPill key={s} label={s} color={c} onClick={() => addItem(s)}/>)}
          </div>
        </div>

        {divider("Gaps, Growth & Supervision Goals")}

        {/* Gaps prompts */}
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
            {panel.gaps.map((p, i) => (
              <div key={i} style={{ backgroundColor: "#F9F5EF", borderRadius: "8px", padding: "9px 13px", borderLeft: `3px solid ${T.line}` }}>
                <p style={{ margin: 0, fontSize: "12px", color: T.inkMid, fontFamily: "Georgia, serif", lineHeight: 1.6 }}>{p}</p>
              </div>
            ))}
          </div>
          <textarea value={gaps} onChange={e => { setGaps(e.target.value); save(gapsKey, e.target.value); }}
            placeholder="Note any gaps, areas for growth, or supervision goals related to this layer…" rows={4}
            style={{ width: "100%", border: `1.5px solid ${T.lineFaint}`, borderRadius: "8px", padding: "10px 12px", fontSize: "12.5px", fontFamily: "Georgia, serif", color: T.inkMid, resize: "vertical", outline: "none", backgroundColor: "#F9F5EF", boxSizing: "border-box", lineHeight: 1.6 }}/>
        </div>
      </div>
    </div>
  );
}

const RING_DETAIL = {
  wob:      { title: "Way of Being — the Foundation", body: "Click to reflect & identify growth areas" },
  alliance: { title: "Therapeutic Alliance", body: "Click to reflect & identify growth areas" },
  systemic: { title: "Systemic Formulation & Practice", body: "Click to reflect & identify growth areas" },
  therapy:  { title: "Therapy & Intervention in the Room", body: "Click to reflect & identify growth areas" },
};

function MapView({ satItems, onSatAdd, onSatRemove }) {
  const [hovRing, setHovRing] = useState(null);
  const [hovSat, setHovSat]   = useState(null);
  const [openSat, setOpenSat] = useState(null);
  const [openRing, setOpenRing] = useState(null);

  const W = 1240, H = 1240, CX = 620, CY = 620;
  const SAT_ORBIT = 490, SAT_R = 68;
  const toR = d => d * Math.PI / 180;

  const sats = SAT_DEFS.map(s => ({
    ...s,
    x: CX + SAT_ORBIT * Math.cos(toR(s.angle)),
    y: CY + SAT_ORBIT * Math.sin(toR(s.angle)),
  }));

  const E = [
    { key: "wob",      rx: 470, ry: 438, sw: 3.2 },
    { key: "alliance", rx: 366, ry: 334, sw: 2.6 },
    { key: "systemic", rx: 252, ry: 224, sw: 2.2 },
    { key: "therapy",  rx: 128, ry: 106, sw: 2   },
  ];

  const activeSat = openSat ? SAT_DEFS.find(s => s.id === openSat) : null;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ width: "100%", maxWidth: "1020px", margin: "0 auto", overflow: "visible" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
          <defs>
            <radialGradient id="mapBg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#FEFCF8"/>
              <stop offset="100%" stopColor="#EAE2D6"/>
            </radialGradient>
            <filter id="satShad">
              <feDropShadow dx="0" dy="2" stdDeviation="10" floodColor="#0000001A"/>
            </filter>
          </defs>

          <rect width={W} height={H} fill="url(#mapBg)"/>

          {/* Spokes */}
          {sats.map(s => {
            const isH = hovSat === s.id || openSat === s.id;
            const dx = s.x - CX, dy = s.y - CY;
            const len = Math.sqrt(dx*dx+dy*dy);
            const t = Math.atan2(dy/E[0].ry, dx/E[0].rx);
            const ex = CX + E[0].rx * Math.cos(t), ey = CY + E[0].ry * Math.sin(t);
            const sx = s.x - (dx/len)*(SAT_R+1), sy = s.y - (dy/len)*(SAT_R+1);
            return <line key={s.id+"-l"} x1={ex} y1={ey} x2={sx} y2={sy}
              stroke={isH ? s.color.border : "#C0B0A0"} strokeWidth={isH ? 2.5 : 1}
              strokeDasharray={isH ? "0" : "5 7"} strokeOpacity={isH ? 1 : 0.5}
              style={{ transition: "all 0.2s" }}/>;
          })}

          {/* Ellipses — outermost first */}
          {E.map(e => (
            <ellipse key={e.key} cx={CX} cy={CY} rx={e.rx} ry={e.ry}
              fill="white" stroke="#1A1A1A" strokeWidth={hovRing === e.key || openRing === e.key ? e.sw + 2 : e.sw}
              onMouseEnter={() => setHovRing(e.key)} onMouseLeave={() => setHovRing(null)}
              onClick={() => { setOpenRing(openRing === e.key ? null : e.key); setOpenSat(null); }}
              style={{ cursor: "pointer", transition: "stroke-width 0.18s" }}/>
          ))}

          {/* WAY OF BEING — top of outermost band, well inside the outer ellipse (ry=438) and above alliance (ry=334) */}
          {T2({ x: CX, y: CY - 400, rows: ["Way of Being"], size: 22, bold: true })}
          {T2({ x: CX, y: CY - 374, rows: ["I-Thou", "Unconditional Positive Regard"], size: 13, fill: "#333" })}

          {/* THERAPEUTIC ALLIANCE BAND — between ry=334 and ry=224, rx=366 and rx=252 */}
          {/* Title just inside Alliance ring top */}
          {T2({ x: CX, y: CY - 282, rows: ["Therapeutic Alliance"], size: 19, bold: true })}

          {/* Left side — x must be between CX-366 and CX-252 to stay in Alliance band */}
          {T2({ x: CX - 300, y: CY - 50, rows: ["Content Dimension:", "Goals, Tasks,", "& Bonds"], size: 10, fill: "#222" })}
          {T2({ x: CX - 298, y: CY + 60, rows: ["Interpersonal", "Dimension:", "Individuals", "Subsystems", "Whole Family", "Within Family", "Therapy System"], size: 9.5, fill: "#222" })}

          {/* Right side — x must be between CX+252 and CX+366 */}
          {T2({ x: CX + 298, y: CY - 60, rows: ["Neurobiology", "Understandings"], size: 10, fill: "#222" })}
          {T2({ x: CX + 298, y: CY + 10, rows: ["Mentalization"], size: 10, fill: "#222" })}
          {T2({ x: CX + 298, y: CY + 60, rows: ["PACEful", "Interactions:", "Playfulness,", "Acceptance,", "Curiosity,", "Empathy"], size: 9.5, fill: "#222" })}

          {/* SYSTEMIC THINKING BAND — between ry=224 and ry=106, rx=252 and rx=128 */}
          {/* Title just inside Systemic ring top */}
          {T2({ x: CX, y: CY - 178, rows: ["Systemic Formulation"], size: 15, bold: true })}
          {T2({ x: CX, y: CY - 162, rows: ["& Practice"], size: 15, bold: true })}
          {T2({ x: CX, y: CY - 147, rows: ['"The Helicopter"'], size: 11, fill: "#444", italic: true })}

          {/* Left side — x between CX-252 and CX-128 */}
          {T2({ x: CX - 186, y: CY - 82, rows: ["Structural", "Consideration:", "Family &", "Stakeholder", "Systems"], size: 9, fill: "#222" })}
          {T2({ x: CX - 186, y: CY + 20, rows: ["Family", "Life Cycle"], size: 9, fill: "#222" })}
          {T2({ x: CX - 186, y: CY + 58, rows: ["Vertical &", "Horizontal", "Stressors"], size: 9, fill: "#222" })}
          {T2({ x: CX - 162, y: CY + 118, rows: ["Strengths,", "Resources", "& Resilience"], size: 9, fill: "#222" })}

          {/* Right side — x between CX+128 and CX+252 */}
          {T2({ x: CX + 182, y: CY - 82, rows: ["Systemic", "Context", "(Genogram", "& Timeline)"], size: 9, fill: "#222" })}
          {T2({ x: CX + 182, y: CY + 16, rows: ["Meaning", "Making"], size: 9, fill: "#222" })}
          {T2({ x: CX + 182, y: CY + 52, rows: ["Emotions"], size: 9, fill: "#222" })}
          {T2({ x: CX + 182, y: CY + 68, rows: ["Client(s)'s", "Ecosystem"], size: 9, fill: "#222" })}
          {T2({ x: CX + 138, y: CY + 110, rows: ['The "Dances":', "Problem &", "Exception", "Patterns"], size: 8.5, fill: "#222", dy: 11 })}

          {/* THERAPY / INTERVENTION — inner ellipse rx=128 ry=106 */}
          {/* Decision Making box — top. 3 text rows at dy=11 after title = needs ~52px height */}
          <rect x={CX-58} y={CY-102} width={116} height={52} rx={4} fill="white" stroke="#333" strokeWidth="1.5" style={{ pointerEvents: "none" }}/>
          {T2({ x: CX, y: CY - 88, rows: ["Decision Making:"], size: 8.5, bold: true })}
          {T2({ x: CX, y: CY - 76, rows: ["Theory of Change,", "context, resources,", "timing & staging"], size: 7.5, fill: "#444", dy: 11 })}

          {/* Down arrow */}
          <polygon points={`${CX-9},${CY-49} ${CX+9},${CY-49} ${CX+9},${CY-38} ${CX+16},${CY-38} ${CX},${CY-26} ${CX-16},${CY-38} ${CX-9},${CY-38}`} fill="#333" opacity="0.85" style={{ pointerEvents: "none" }}/>

          {/* Therapy label + list */}
          {T2({ x: CX, y: CY - 14, rows: ["Therapy/Intervention"], size: 10, bold: true })}
          {T2({ x: CX, y: CY + 0, rows: ["CBT, ACT, DDP, MBT,", "Play Therapy, DBT,", "Somatic, IFS, COS,", "Art Therapy & more"], size: 7.5, fill: "#333", dy: 11 })}

          {/* Up arrow */}
          <polygon points={`${CX-9},${CY+46} ${CX+9},${CY+46} ${CX+9},${CY+57} ${CX+16},${CY+57} ${CX},${CY+69} ${CX-16},${CY+57} ${CX-9},${CY+57}`} fill="#333" opacity="0.85" style={{ pointerEvents: "none" }}/>

          {/* Ongoing Review box — bottom */}
          <rect x={CX-58} y={CY+71} width={116} height={32} rx={4} fill="white" stroke="#333" strokeWidth="1.5" style={{ pointerEvents: "none" }}/>
          {T2({ x: CX, y: CY + 84, rows: ["Ongoing Review:"], size: 8.5, bold: true })}
          {T2({ x: CX, y: CY + 96, rows: ["Circular & Collaborative"], size: 7.5, fill: "#444" })}

          {/* FOUNDATION STATEMENTS — correctly placed within their own ring band */}

          {/* "Therapy/Intervention Rests on..." — inside SYSTEMIC band (ry=106 to ry=224), bottom section */}
          {T2({ x: CX, y: CY + 132, rows: ["Therapy/Intervention Rests on", "Systemic Thinking,", "Alliance & Way of Being"], size: 10, bold: true, fill: "#D97706", dy: 13 })}

          {/* "Therapeutic Alliance Rests on..." — inside ALLIANCE band (ry=224 to ry=334), bottom section */}
          {T2({ x: CX, y: CY + 248, rows: ["Therapeutic Alliance", "Rests on Way of Being"], size: 11, bold: true, fill: "#059669", dy: 15 })}

          {/* "Way of Being is the Foundation" — inside WAY OF BEING band (ry=334 to ry=438), bottom section */}
          {T2({ x: CX, y: CY + 362, rows: ["Way of Being", "is the Foundation"], size: 13, bold: true, fill: "#0EA5E9", dy: 17 })}

          {/* SATELLITE NODES */}
          {sats.map(s => {
            const isH   = hovSat  === s.id;
            const isOpen= openSat === s.id;
            const count = (satItems[s.id] || []).length;
            const words = s.title.split(" ");
            const mid   = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(" ");
            const line2 = words.slice(mid).join(" ");
            return (
              <g key={s.id}
                onMouseEnter={() => setHovSat(s.id)}
                onMouseLeave={() => setHovSat(null)}
                onClick={() => setOpenSat(isOpen ? null : s.id)}
                style={{ cursor: "pointer" }}>
                {(isH || isOpen) && <circle cx={s.x} cy={s.y} r={SAT_R + 14} fill={s.color.bg} opacity="0.4"/>}
                <circle cx={s.x} cy={s.y} r={SAT_R}
                  fill={isOpen ? s.color.bg : isH ? s.color.bg : "white"}
                  stroke={s.color.border} strokeWidth={isOpen ? 3 : isH ? 2.5 : 1.8}
                  filter={isH || isOpen ? "url(#satShad)" : "none"}
                  style={{ transition: "all 0.2s" }}/>
                {/* Icon */}
                <text x={s.x} y={s.y - (line2 ? 18 : 8)} textAnchor="middle" fontSize="14" fill={s.color.border} style={{ pointerEvents: "none" }}>{s.icon}</text>
                {/* Label line 1 */}
                <text x={s.x} y={s.y + (line2 ? -1 : 8)} textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="Georgia, serif" fill={s.color.text} style={{ pointerEvents: "none" }}>{line1}</text>
                {/* Label line 2 */}
                {line2 && <text x={s.x} y={s.y + 13} textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="Georgia, serif" fill={s.color.text} style={{ pointerEvents: "none" }}>{line2}</text>}
                {/* Item count badge */}
                {count > 0 && (
                  <g>
                    <circle cx={s.x + SAT_R - 9} cy={s.y - SAT_R + 9} r={12} fill={s.color.border}/>
                    <text x={s.x + SAT_R - 9} y={s.y - SAT_R + 14} textAnchor="middle" fontSize="9" fill="white" fontFamily="monospace" style={{ pointerEvents: "none" }}>{count}</text>
                  </g>
                )}
                {/* "tap to edit" hint on hover */}
                {isH && !isOpen && (
                  <text x={s.x} y={s.y + SAT_R - 10} textAnchor="middle" fontSize="8" fontFamily="Georgia, serif" fill={s.color.border} fontStyle="italic" style={{ pointerEvents: "none" }}>click to explore</text>
                )}
                {/* open indicator */}
                {isOpen && (
                  <text x={s.x} y={s.y + SAT_R - 10} textAnchor="middle" fontSize="8" fontFamily="Georgia, serif" fill={s.color.border} fontStyle="italic" style={{ pointerEvents: "none" }}>▸ open</text>
                )}
              </g>
            );
          })}

          {/* Ring hover tooltip inline */}
          {hovRing && !openSat && (
            <g style={{ pointerEvents: "none" }}>
              <rect x={CX - 190} y={20} width={380} height={56} rx={10} fill="white" stroke="#888" strokeWidth="1.2" opacity="0.96"/>
              <text x={CX} y={45} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="Georgia, serif" fill="#1A1410">{RING_DETAIL[hovRing].title}</text>
              <text x={CX} y={63} textAnchor="middle" fontSize="9" fontFamily="Georgia, serif" fill="#5A4A3A">{RING_DETAIL[hovRing].body.slice(0,90)}…</text>
            </g>
          )}

          <text x={W - 14} y={H - 10} textAnchor="end" fontSize="8" fill="#B8A898" fontFamily="monospace">SIPM: White &amp; Owen (2022) · Dr Leonie White</text>
        </svg>
      </div>

      {/* Instruction strip */}
      {!openSat && !openRing && (
        <p style={{ textAlign: "center", fontSize: "11px", color: T.inkGhost, fontFamily: "Georgia, serif", fontStyle: "italic", margin: "8px 0 0" }}>
          Click any satellite node or ellipse ring to open reflection prompts
        </p>
      )}

      {/* Slide-in satellite panel */}
      {activeSat && (
        <>
          <div onClick={() => setOpenSat(null)} style={{ position: "fixed", inset: 0, backgroundColor: "#00000022", zIndex: 999 }}/>
          <SatPanel sat={activeSat} items={satItems[activeSat.id] || []} onAdd={onSatAdd} onRemove={onSatRemove} onClose={() => setOpenSat(null)}/>
        </>
      )}

      {/* Slide-in ring panel */}
      {openRing && (
        <>
          <div onClick={() => setOpenRing(null)} style={{ position: "fixed", inset: 0, backgroundColor: "#00000022", zIndex: 999 }}/>
          <RingPanel ringKey={openRing} onClose={() => setOpenRing(null)}/>
        </>
      )}
    </div>
  );
}

// ─── SUMMARY VIEW ────────────────────────────────────────────────────────────
function SummaryView({ allItems, satItems, notes }) {
  const domainTotal = Object.values(allItems).flat().length;
  const satTotal    = Object.values(satItems).flat().length;
  const hasAny = domainTotal > 0 || satTotal > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ padding: "20px 24px", backgroundColor: T.bgDeep, borderRadius: "12px", border: `1px solid ${T.line}` }}>
        <h3 style={{ margin: "0 0 6px", fontFamily: "Georgia, serif", fontSize: "18px", color: T.inkMid }}>Framework Summary</h3>
        <p style={{ margin: 0, fontSize: "12px", color: T.inkFaint, fontFamily: "Georgia, serif" }}>
          {!hasAny ? "No items added yet. Use the Editor tab or click satellite nodes in the Visual Map." : `${domainTotal + satTotal} elements mapped across your framework`}
        </p>
      </div>

      {/* Satellite items */}
      {SAT_DEFS.map(sat => {
        const items = satItems[sat.id] || [];
        if (!items.length) return null;
        return (
          <div key={sat.id} style={{ borderRadius: "10px", overflow: "hidden", border: `1.5px solid ${sat.color.border}33` }}>
            <div style={{ backgroundColor: sat.color.bg, padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: `1px solid ${sat.color.border}22` }}>
              <span style={{ fontSize: "16px", color: sat.color.border }}>{sat.icon}</span>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: sat.color.text, fontWeight: "700" }}>{sat.title}</span>
            </div>
            <div style={{ padding: "12px 16px", backgroundColor: "white", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {items.map(it => <span key={it} style={{ padding: "3px 10px", borderRadius: "100px", backgroundColor: sat.color.bg, border: `1px solid ${sat.color.border}`, color: sat.color.text, fontSize: "12px", fontFamily: "Georgia, serif" }}>{it}</span>)}
            </div>
          </div>
        );
      })}

      {/* Domain items */}
      {DOMAINS.map(domain => {
        const items = allItems[domain.id] || [];
        const col = T.domains[domain.id];
        if (!items.length) return null;
        return (
          <div key={domain.id} style={{ borderRadius: "10px", overflow: "hidden", border: `1.5px solid ${col.border}33` }}>
            <div style={{ backgroundColor: col.bg, padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: `1px solid ${col.border}22` }}>
              <span style={{ fontSize: "16px", color: col.border }}>{domain.icon}</span>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: col.text, fontWeight: "700" }}>{domain.label}</span>
            </div>
            <div style={{ padding: "12px 16px", backgroundColor: "white", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {items.map(it => <span key={it} style={{ padding: "3px 10px", borderRadius: "100px", backgroundColor: col.bg, border: `1px solid ${col.border}`, color: col.text, fontSize: "12px", fontFamily: "Georgia, serif" }}>{it}</span>)}
            </div>
          </div>
        );
      })}

      {notes?.trim() && (
        <div style={{ borderRadius: "10px", border: `1.5px solid ${T.line}`, overflow: "hidden" }}>
          <div style={{ backgroundColor: T.bgDeep, padding: "10px 16px", borderBottom: `1px solid ${T.line}` }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: T.inkMid }}>Supervision Notes</span>
          </div>
          <div style={{ padding: "14px 16px", backgroundColor: "white" }}>
            <p style={{ margin: 0, fontSize: "13px", color: T.inkMid, fontFamily: "Georgia, serif", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{notes}</p>
          </div>
        </div>
      )}

      {!hasAny && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: T.inkGhost }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "17px", margin: "0 0 6px" }}>Begin in the Editor tab or Visual Map</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "12px", margin: 0 }}>Click the satellite nodes on the map to reflect and add elements</p>
        </div>
      )}
    </div>
  );
}

// ─── SUPERVISION QUESTIONS ───────────────────────────────────────────────────
const SUPERVISION_QS = [
  { q: "Looking at your map — where are you most grounded and most uncertain?", tag: "Reflection" },
  { q: "Which theoretical frameworks most shape how you understand what's happening for this client right now?", tag: "Theory" },
  { q: "What does your map reveal about your Way of Being in the room — what do clients experience of you?", tag: "Self" },
  { q: "Which parts of your practice framework are most intentional, and which are more intuitive or default?", tag: "Intentionality" },
  { q: "Are there dominant voices in your framework — and whose voices are absent or quiet?", tag: "Positionality" },
  { q: "How does your organisational context support or constrain the practice framework you've mapped?", tag: "Context" },
  { q: "Where is there tension or contradiction within your framework — and what do you do with that?", tag: "Integration" },
  { q: "What is your theory of change for this client — and does it align with your mapped framework?", tag: "Formulation" },
  { q: "What would it mean to move from your most espoused theory toward a more integrated practice?", tag: "Growth" },
  { q: "Which influences on your map do you most need to critically examine — are they serving your clients?", tag: "Critical Reflection" },
];

function SupervisionQView() {
  const [revealed, setRevealed] = useState([]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ padding: "18px 22px", backgroundColor: T.bgDeep, borderRadius: "12px", border: `1px solid ${T.line}` }}>
        <h3 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: "17px", color: T.inkMid }}>Supervision Discussion Questions</h3>
        <p style={{ margin: 0, fontSize: "12px", color: T.inkFaint, fontFamily: "Georgia, serif" }}>Use your completed map as a reference while working through these questions with your supervisor</p>
      </div>
      {SUPERVISION_QS.map((item, i) => {
        const isOpen = revealed.includes(i);
        return (
          <div key={i} onClick={() => setRevealed(isOpen ? revealed.filter(x => x !== i) : [...revealed, i])}
            style={{ borderRadius: "10px", border: `1.5px solid ${isOpen ? T.line : T.lineFaint}`, backgroundColor: isOpen ? "white" : T.canvas, padding: "14px 18px", cursor: "pointer", transition: "all 0.2s", boxShadow: isOpen ? "0 2px 12px #00000010" : "none" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ fontSize: "10px", color: T.inkGhost, fontFamily: "monospace", marginTop: "3px", flexShrink: 0 }}>{String(i+1).padStart(2,"0")}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <p style={{ margin: 0, fontSize: "13.5px", color: T.inkMid, fontFamily: "Georgia, serif", lineHeight: 1.55 }}>{item.q}</p>
                  <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "100px", backgroundColor: T.bgDeep, color: T.inkFaint, whiteSpace: "nowrap", fontFamily: "monospace", flexShrink: 0 }}>{item.tag}</span>
                </div>
                {isOpen && <textarea placeholder="Your reflection…" rows={2} onClick={e => e.stopPropagation()}
                  style={{ marginTop: "10px", width: "100%", border: `1px solid ${T.lineFaint}`, borderRadius: "6px", padding: "8px 10px", fontSize: "12px", fontFamily: "Georgia, serif", color: T.inkMid, resize: "vertical", outline: "none", backgroundColor: T.bg, boxSizing: "border-box" }}/>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CASE REFLECTION VIEW ────────────────────────────────────────────────────
const CASE_SECTIONS = [
  {
    id: "context",
    label: "Client & Context",
    icon: "◇",
    color: { bg: "#EAF0F8", border: "#3A68B0", text: "#162848" },
    desc: "Brief context for the case or session you are reflecting on",
    prompts: [
      "Who is this client/family — what is the presenting concern and how long have you been working together?",
      "What is the broader system context — who else is involved, what services, what pressures?",
      "What stage of the work are you at — beginning, middle, ending — and what does that mean for this session?",
    ],
  },
  {
    id: "wob_case",
    label: "Way of Being in This Session",
    icon: "◉",
    color: { bg: "#FEF6EE", border: "#C07840", text: "#5A2A10" },
    desc: "How your relational presence showed up — I-Thou, UPR, personal material",
    prompts: [
      "How present and attuned were you in this session — what was your Way of Being like?",
      "Were there moments of I-It — where the client became a problem to solve rather than a person to be with? What happened?",
      "What personal material, family of origin stories or lived experiences were activated in you during this session?",
      "How did your Social GRACES show up — what did you notice about the relational dynamics between you and this client?",
    ],
  },
  {
    id: "alliance_case",
    label: "Therapeutic Alliance in This Session",
    icon: "◈",
    color: { bg: "#EFF0FA", border: "#5060B8", text: "#1A2060" },
    desc: "The quality, strengths and ruptures of the alliance in this session",
    prompts: [
      "How would you describe the alliance in this session — what type of relationship were you working with?",
      "Were there moments of rupture or disconnection — and how did you respond?",
      "How safe did the client feel — what told you this neurobiologically and relationally?",
      "How well-aligned were you and the client on the goals and tasks of the session?",
    ],
  },
  {
    id: "formulation_case",
    label: "Systemic Formulation — What Was Present",
    icon: "◎",
    color: { bg: "#EAF5EC", border: "#3A8A58", text: "#163820" },
    desc: "How your systemic thinking and formulation shaped the session",
    prompts: [
      "What systemic hypothesis were you working from in this session — and did it hold, shift or deepen?",
      "How did the broader ecosystem — family, services, context — show up in the room?",
      "What patterns, dances or sequences were visible in this session?",
      "What did you notice about strengths, resilience or exceptions to the problem?",
    ],
  },
  {
    id: "intervention_case",
    label: "Therapy & Intervention — What You Did",
    icon: "◆",
    color: { bg: "#F5E6F0", border: "#A03880", text: "#481830" },
    desc: "The actual interventions, grounded in all the layers that came before",
    prompts: [
      "What did you actually do in the room — which approaches, techniques or modalities did you use?",
      "How intentional vs intuitive were your choices — and what does that tell you?",
      "What was the client's response — what worked, what landed, what didn't?",
      "How did you sequence and time your interventions — what shaped when you moved and when you waited?",
      "How did your Way of Being, the alliance and your formulation support — or constrain — what you did?",
    ],
  },
  {
    id: "learning_case",
    label: "Learning & Next Steps",
    icon: "○",
    color: { bg: "#F5F0E0", border: "#907020", text: "#3A2C00" },
    desc: "What this session reveals about your developing practice",
    prompts: [
      "What would you do differently — and what does that illuminate about your growth edges?",
      "What did this session reveal about gaps in your framework, knowledge or skills?",
      "What do you want to bring to supervision from this reflection?",
      "What is one thing you want to carry forward into your next session with this client?",
    ],
  },
];

function CaseSection({ section }) {
  const c = section.color;
  const textKey = `pfm_case_${section.id}`;
  const [open, setOpen] = useState(false);
  const [reflection, setReflection] = useState(() => { try { return localStorage.getItem(textKey) || ""; } catch { return ""; } });
  const saveTimer = useRef(null);
  const save = val => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { try { localStorage.setItem(textKey, val); } catch {} }, 500);
  };
  return (
    <div style={{ borderRadius: "14px", overflow: "hidden", border: `1.5px solid ${open ? c.border : T.lineFaint}`, boxShadow: open ? `0 4px 24px ${c.border}22` : "0 1px 3px #00000008", transition: "all 0.2s" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", cursor: "pointer", backgroundColor: open ? c.bg : "white", borderBottom: open ? `1px solid ${c.border}33` : "none", transition: "background 0.2s" }}>
        <span style={{ fontSize: "18px", color: c.border }}>{section.icon}</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "14px", fontWeight: "700", color: T.inkMid, fontFamily: "Georgia, serif" }}>{section.label}</span>
          {reflection && <span style={{ marginLeft: "8px", fontSize: "9px", color: c.border, fontFamily: "monospace", backgroundColor: c.bg, border: `1px solid ${c.border}44`, borderRadius: "100px", padding: "1px 7px" }}>notes saved</span>}
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: T.inkFaint, fontFamily: "Georgia, serif", lineHeight: 1.4 }}>{section.desc}</p>
        </div>
        <span style={{ color: T.inkGhost, fontSize: "12px", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </div>
      {open && (
        <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "white" }}>
          <div style={{ backgroundColor: c.bg, borderRadius: "8px", padding: "12px 14px", borderLeft: `3px solid ${c.border}` }}>
            <p style={{ margin: "0 0 6px", fontSize: "10px", color: c.border, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>Reflection prompts</p>
            {section.prompts.map((p, i) => <p key={i} style={{ margin: "4px 0 0", fontSize: "12px", color: c.text, fontFamily: "Georgia, serif", lineHeight: 1.6 }}>· {p}</p>)}
          </div>
          <textarea value={reflection} onChange={e => { setReflection(e.target.value); save(e.target.value); }}
            placeholder="Write your reflection here…" rows={5}
            style={{ width: "100%", border: `1.5px solid ${T.lineFaint}`, borderRadius: "8px", padding: "10px 12px", fontSize: "12.5px", fontFamily: "Georgia, serif", color: T.inkMid, resize: "vertical", outline: "none", backgroundColor: T.bg, boxSizing: "border-box", lineHeight: 1.6 }}/>
        </div>
      )}
    </div>
  );
}

function CaseReflectionView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ padding: "18px 22px", backgroundColor: T.bgDeep, borderRadius: "12px", border: `1px solid ${T.line}` }}>
        <h2 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: "18px", color: T.inkMid, fontWeight: "700" }}>Case Reflection</h2>
        <p style={{ margin: 0, fontSize: "12px", color: T.inkFaint, fontFamily: "Georgia, serif", lineHeight: 1.6 }}>
          A structured reflection on a specific client or session — working through each layer of the SIPM from Way of Being through to the intervention in the room.
        </p>
      </div>
      {CASE_SECTIONS.map(s => <CaseSection key={s.id} section={s}/>)}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

// Load saved data from localStorage or return default
function loadFromStorage(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch { return defaultValue; }
}

export default function App() {
  const [tab, setTab] = useState("map");
  const [allItems, setAllItems] = useState(() => loadFromStorage("pfm_allItems", { values: [], theories: [], approaches: [], influences: [], self: [], context: [] }));
  const [satItems, setSatItems] = useState(() => loadFromStorage("pfm_satItems", { systems: [], foundational: [], epistemology: [], humanrights: [], antioppressive: [], cultural: [], ethics: [], philosophy: [], contemporary: [] }));
  const [notes, setNotes] = useState(() => loadFromStorage("pfm_notes", ""));

  // Auto-save whenever data changes
  const saveTimeout = useRef(null);
  const scheduleSave = useCallback((key, value) => {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }, 500);
  }, []);

  const addItem    = useCallback((d, item) => setAllItems(p => { const n = { ...p, [d]: p[d].includes(item) ? p[d] : [...p[d], item] }; scheduleSave("pfm_allItems", n); return n; }), [scheduleSave]);
  const removeItem = useCallback((d, item) => setAllItems(p => { const n = { ...p, [d]: p[d].filter(x => x !== item) }; scheduleSave("pfm_allItems", n); return n; }), [scheduleSave]);
  const addSat     = useCallback((d, item) => setSatItems(p => { const n = { ...p, [d]: p[d].includes(item) ? p[d] : [...p[d], item] }; scheduleSave("pfm_satItems", n); return n; }), [scheduleSave]);
  const removeSat  = useCallback((d, item) => setSatItems(p => { const n = { ...p, [d]: p[d].filter(x => x !== item) }; scheduleSave("pfm_satItems", n); return n; }), [scheduleSave]);

  const handleNotesChange = useCallback((val) => {
    setNotes(val);
    scheduleSave("pfm_notes", val);
  }, [scheduleSave]);

  const clearAll = useCallback(() => {
    if (!window.confirm("Clear all your saved data? This cannot be undone.")) return;
    localStorage.removeItem("pfm_allItems");
    localStorage.removeItem("pfm_satItems");
    localStorage.removeItem("pfm_notes");
    SAT_DEFS.forEach(s => localStorage.removeItem(`pfm_reflection_${s.id}`));
    Object.keys(RING_PANELS).forEach(k => {
      localStorage.removeItem(`pfm_ring_${k}`);
      localStorage.removeItem(`pfm_ring_gaps_${k}`);
      localStorage.removeItem(`pfm_ring_items_${k}`);
    });
    CASE_SECTIONS.forEach(s => localStorage.removeItem(`pfm_case_${s.id}`));
    setAllItems({ values: [], theories: [], approaches: [], influences: [], self: [], context: [] });
    setSatItems({ systems: [], foundational: [], epistemology: [], humanrights: [], antioppressive: [], cultural: [], ethics: [], philosophy: [], contemporary: [] });
    setNotes("");
  }, []);
  const totalItems  = Object.values(allItems).flat().length + Object.values(satItems).flat().length;

  const tabs = [
    { id: "map",       label: "Visual Map" },
    { id: "editor",    label: "Editor" },
    { id: "summary",   label: "Summary" },
    { id: "questions", label: "Supervision Qs" },
    { id: "case",      label: "Case Reflection" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: T.bg, fontFamily: "Georgia, serif", color: T.inkMid }}>
      <div style={{ background: "linear-gradient(to right, #2E3A28, #1A2818)", padding: "20px 28px 18px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: "10px", color: "#7AAB68", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>Clinical Supervision Tool</p>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "24px", color: "#F0EAE0", fontWeight: "700" }}>Practice Framework Map</h1>
          <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#7A8F74", fontStyle: "italic" }}>Map the theories, values and knowledge bases that shape your clinical practice</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{ display: "flex", gap: "4px", backgroundColor: "#0D1A0B", padding: "4px", borderRadius: "10px" }}>
            {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 16px", borderRadius: "7px", cursor: "pointer", fontSize: "12px", backgroundColor: tab === t.id ? "#2E5020" : "transparent", color: tab === t.id ? "#C0E8A8" : "#587A50", border: "none", fontFamily: "Georgia, serif", transition: "all 0.15s" }}>{t.label}</button>)}
            {totalItems > 0 && <span style={{ padding: "7px 12px", fontSize: "11px", color: "#7AAB68", fontFamily: "monospace", alignSelf: "center" }}>{totalItems} elements</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "10px", color: "#4A6A42", fontFamily: "monospace" }}>● auto-saved to this browser</span>
            <button onClick={clearAll} style={{ fontSize: "10px", color: "#8A6A5A", background: "none", border: "1px solid #4A3A2A", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Clear all data</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "24px 16px" }}>

        {tab === "map" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <h2 style={{ margin: "0 0 2px", fontFamily: "Georgia, serif", fontSize: "18px", color: T.inkMid, fontWeight: "700" }}>Practice Framework Map</h2>
                <p style={{ margin: 0, fontSize: "12px", color: T.inkFaint }}>The SIPM at centre — click any satellite node to open its reflection prompts and build your framework</p>
              </div>
            </div>
            {/* Satellite guide */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {SAT_DEFS.map(s => {
                const count = (satItems[s.id] || []).length;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "100px", backgroundColor: count > 0 ? s.color.bg : "white", border: `1px solid ${s.color.border}`, cursor: "default" }}>
                    <span style={{ fontSize: "11px", color: s.color.border }}>{s.icon}</span>
                    <span style={{ fontSize: "11px", color: s.color.text, fontFamily: "Georgia, serif" }}>{s.title}</span>
                    {count > 0 && <span style={{ fontSize: "9px", color: "white", backgroundColor: s.color.border, borderRadius: "100px", padding: "0px 5px", fontFamily: "monospace" }}>{count}</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: `1.5px solid ${T.lineFaint}`, padding: "12px", boxShadow: "0 2px 16px #00000008", overflow: "visible" }}>
              <MapView satItems={satItems} onSatAdd={addSat} onSatRemove={removeSat}/>
            </div>
          </div>
        )}

        {tab === "editor" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <div>
                <h2 style={{ margin: "0 0 2px", fontFamily: "Georgia, serif", fontSize: "18px", color: T.inkMid, fontWeight: "700" }}>Build Your Framework</h2>
                <p style={{ margin: 0, fontSize: "12px", color: T.inkFaint }}>Open each domain, reflect on the prompts, and add the elements that shape your practice</p>
              </div>
            </div>
            {DOMAINS.map(d => <DomainCard key={d.id} domain={d} items={allItems[d.id]} onAdd={addItem} onRemove={removeItem}/>)}
            <div style={{ marginTop: "8px", borderRadius: "12px", border: `1.5px solid ${T.lineFaint}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 18px", backgroundColor: T.bgDeep, borderBottom: `1px solid ${T.lineFaint}` }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: T.inkMid }}>Supervision Notes</span>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: T.inkFaint }}>Questions to bring to your supervisor, areas of uncertainty, or emerging insights</p>
              </div>
              <textarea value={notes} onChange={e => handleNotesChange(e.target.value)} placeholder="Write any notes, questions or reflections to bring to supervision…" rows={4}
                style={{ width: "100%", border: "none", outline: "none", padding: "14px 18px", fontSize: "13px", fontFamily: "Georgia, serif", color: T.inkMid, backgroundColor: "white", resize: "vertical", boxSizing: "border-box" }}/>
            </div>
          </div>
        )}

        {tab === "summary"   && <SummaryView allItems={allItems} satItems={satItems} notes={notes}/>}
        {tab === "questions" && <SupervisionQView/>}
        {tab === "case"      && <CaseReflectionView/>}
      </div>
    </div>
  );
}
