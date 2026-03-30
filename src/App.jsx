import { useState, useRef, useCallback } from "react";
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
    tagline: "From parts to wholes — understanding the web of relationships, patterns, context and circularity",
    description: [
      { label: "Relationship", body: "A system is not the sum of its parts — it is the product of their interaction. Key question: What does this part influence, and what influences it?" },
      { label: "Pattern", body: "Recurring behaviours and underlying structures reveal root causes rather than isolated incidents. Key question: What is happening over time — why do we keep facing the same issue?" },
      { label: "Context", body: "A situation cannot be understood in isolation — it must be understood within its environment. Key question: How does shifting the boundary of our investigation change how we understand this problem?" },
      { label: "Circularity", body: "Events are interconnected feedback loops, not straight lines with a single root cause. Key question: What are the reinforcing or balancing feedback loops driving this behaviour?" },
    ],
    color: { bg: "#E6F0F8", border: "#3A68B0", text: "#162848" },
    prompts: [
      // Relationship / interconnectedness
      "How do you move beyond focusing on isolated individuals to holding the interactions and relationships between them? What does this part influence — and what influences it?",
      // Pattern
      "How do you look for recurring patterns and underlying structures rather than isolated incidents? When you see the same issue repeating, what questions do you ask about what is driving it over time?",
      // Context
      "How do you hold the broader environment — family, community, culture, history, social context — as essential to understanding what you are seeing? How does shifting the boundary of your investigation change how you understand a problem?",
      // Circularity
      "How do you move from linear thinking (A causes B) to circular causality — seeing the feedback loops where A influences B, which influences C, which comes back to influence A? What reinforcing or balancing loops can you identify?",
      // Holism vs reductionism
      "Where does your training pull you toward a mechanistic or reductionist view — breaking things into parts — and how do you actively cultivate a more holistic, relational lens?",
      // Systems frameworks
      "What systems frameworks — structural, Milan, ecological, complexity science, Bateson — sit at the heart of how you think, and how do they show up in your practice?",
      // Indigenous knowledge
      "How does Indigenous systems wisdom and relational thinking inform your understanding of people, community and change — and whose ways of knowing are you centring?",
      // Disciplinary tension
      "How does your professional discipline's dominant paradigm sit alongside systemic thinking — where does it fit naturally, and where is there genuine tension?",
    ],
    suggestions: [
      "Relationship & interconnectedness","Pattern recognition","Context as essential","Circular causality","Feedback loops","Holistic vs reductionist","Non-linear causality","Complexity science","Chaos theory",
      "Structural FT (Minuchin)","Milan Systemic Therapy","Ecological / ecosystems thinking","Bowen Family Systems","Bateson's ecology of mind","Goodchild's relational systems","General Systems Theory","Indigenous relational systems","Family as emotional unit","Irreducible wholeness",
    ],
  },
  {
    id: "foundational", angle: -50,
    title: "Foundational Theories", icon: "◈",
    tagline: "The developmental, neuroscience, attachment & diagnostic formulation frameworks underpinning your practice",
    color: { bg: "#EAF5EC", border: "#3A8A58", text: "#163820" },
    prompts: [
      // Attachment & neuroscience
      "How do attachment theory and developmental psychology shape how you understand your clients — and how does this show up in practice?",
      "How does nervous system science and neurobiology inform how you create safety in the room?",
      "How do you draw on polyvagal theory, interpersonal neurobiology or DDP in your clinical thinking?",
      // Multi-level diagnostic formulation (O'Keeffe & Macaulay)
      "How do you hold a multi-level understanding of your clients — moving beyond presenting symptoms to consider the neuropsychological processes, biological factors and environmental systems that interact to create and maintain the presenting concern?",
      "How do you think about the neuropsychological constructs underlying a client's behaviour — areas like executive function, attention control, emotional regulation, social competence, language and memory — rather than defaulting to categorical diagnostic labels?",
      "How do you hold the temporal axis in your formulation — what predisposed this person (biological and environmental risk factors), what precipitated the current presentation, and what is perpetuating it? What is your prognosis with and without intervention?",
      "How explicitly do you assess and document the environmental systems — family patterns, school, community, broader ecology — as part of your formulation, rather than focusing primarily on the individual?",
      "How strengths-focused is your assessment and formulation? Are you as thorough in identifying resilience factors, affinities and protective factors as you are in identifying deficits and difficulties?",
      // Biopsychosocial & beyond labels
      "How do you hold the limitations of categorical diagnostic labels alongside their utility — and how do you advocate for a more individualised, functional formulation rather than diagnosis-as-endpoint?",
      // Disciplinary training
      "How does your professional discipline's training shape what you foreground in assessment and what you overlook — and where does that create blind spots?",
    ],
    suggestions: [
      "Attachment Theory (Bowlby)","Polyvagal Theory (Porges)","Interpersonal Neurobiology (Siegel)","Developmental Psychology","Dyadic Developmental Psychotherapy (DDP)","Mentalization (Fonagy)","Trauma-Informed Practice","PACE framework","Window of tolerance (Ogden)","ACEs framework","Circle of Security (COS)","Triple P (PPP)",
      "Multi-level diagnostic formulation (O'Keeffe & Macaulay)","Biopsychosocial model (Engel)","Bronfenbrenner's ecological theory","Neuropsychological constructs","Temporal axis (predisposing · precipitating · perpetuating)","Strengths & resilience focus","Beyond categorical diagnosis","Behavioural level","Neuropsychological level","Biological level","Environmental/family level",
    ],
  },
  {
    id: "epistemology", angle: -10,
    title: "Epistemological Frameworks", icon: "◉",
    tagline: "How you know what you know — and how that shapes your position in the room",
    color: { bg: "#F0EBF8", border: "#7048B0", text: "#2A1050" },
    description: [
      { label: "Expert / Rationalist stance", body: "The therapist holds privileged knowledge — they diagnose, prescribe and act from a position of authority. Knowledge is objective and knowable; the clinician's expertise is what creates change." },
      { label: "Not-Knowing stance", body: "The therapist approaches with genuine curiosity and openness, without fixed assumptions about the client's meaning. Knowledge is co-constructed in conversation — the client is the expert on their own life (Anderson & Goolishian, 1992)." },
      { label: "Critical Not-Knowing", body: "A third position — holding not-knowing and knowing together. The therapist contributes meaning, interpretation and expertise while remaining genuinely open to being changed by the client's perspective. Neither pure expert nor absence of expertise." },
      { label: "Your epistemic style shapes everything", body: "Research shows therapist epistemological approach predicts therapeutic method, working alliance emphasis, and intervention use. A rationalist stance predicts directive, advice-giving interventions; a constructivist stance predicts collaborative, meaning-making approaches." },
    ],
    prompts: [
      // Expert vs not-knowing
      "Where do you sit on the spectrum between expert and not-knowing — and does that position shift across clients, presentations or contexts?",
      "How comfortable are you with not knowing — with sitting in uncertainty, ambiguity and complexity without rushing to an answer or a label?",
      "When do you find yourself taking an expert stance — diagnosing, prescribing, directing — and when is that appropriate vs. when does it close down the client's own knowing?",
      "How do you hold the tension between contributing your expertise and remaining genuinely open to being changed by what the client brings? What does 'critical not-knowing' look like in your practice?",
      // Epistemic style and method
      "How does your epistemological position predict the kinds of interventions you reach for — and are those aligned with what this client needs?",
      "How does your training's dominant paradigm — rationalist or constructivist — shape what you privilege as 'knowledge' and what you dismiss?",
      // Power and authority
      "How does the expert position locate power in the therapeutic relationship — and what are the ethical implications of that for you?",
      "Whose knowledge and meaning-making gets privileged in the room — yours or your client's? How do you actively work to centre the client's own knowing?",
      // Broader epistemology
      "What is your theory of knowledge — how do you understand truth, reality and meaning in your practice?",
      "Where does your practice sit in relation to modernist and postmodern ways of knowing — and how do you hold that tension?",
      "How has your thinking about knowledge, certainty and clinical authority shifted over your professional life?",
    ],
    suggestions: [
      "Not-knowing stance (Anderson & Goolishian)","Critical not-knowing","Expert vs collaborative position","Rationalist epistemology","Constructivist epistemology","Social constructionism","Postmodernism","Critical realism","Phenomenology","Second-order cybernetics",
      "Collaborative language systems","Reflecting processes (Andersen)","Narrative epistemology","Multiple realities","Epistemic humility","Power in therapeutic relationship","Client as expert on own life","Uncertainty & ambiguity tolerance","Conscious use of expertise",
    ],
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
    tagline: "Your internal architecture — the synthesis of values, beliefs and identity that guides you when nobody is watching",
    color: { bg: "#E8F5F0", border: "#208870", text: "#083828" },
    prompts: [
      // Internalized professionalism
      "How have you moved from complying with professional rules to genuinely embodying the values and ethics of your field as your own — what does that look like in practice?",
      // Portable sense of self
      "How would you describe your 'portable' professional identity — the consistent way of being, thinking and acting that you carry with you regardless of role, organisation or context?",
      // Integration of personal and professional
      "How have your life experiences, cultural background, family of origin and personality been deliberately woven into your professional identity — not set aside, but integrated?",
      // Unique value proposition
      "What unique perspective, skill set or way of being do you bring to your field — what do clients, colleagues and systems get from you that they wouldn't get from someone else?",
      // Epistemology of practice
      "How do you know what you know? How do you weigh research, theory, experience, intuition and the wisdom of clients in your decision-making?",
      // Ethical anchors
      "Which core ethical principles — justice, autonomy, integrity, dignity — do you refuse to compromise even under organisational pressure or ambiguity?",
      // The 3 R's
      "How do reflection, relationships and resilience show up as active practices in your professional life — not just ideals, but lived habits?",
      // Community of practice
      "How do your personal values harmonise — or sit in tension — with the professional norms and expectations of your discipline and organisation?",
      // Evolution
      "How has your philosophy of practice evolved over your career — what has shifted, what has deepened, and what have you had to let go of?",
    ],
    suggestions: [
      "Internalized professionalism","Portable professional identity","Personal-professional integration","Unique value proposition","Epistemology of practice","Ethical anchors","Virtue ethics","Relational ethics","Theory of the person","Theory of change",
      "Reflection as practice","Resilience & burnout prevention","Community of practice alignment","Existentialism","Phenomenology","Humanistic psychology","Meaning-making","Conscious competence","The 3 R's: Reflection, Relationships, Resilience","Disciplinary identity",
    ],
  },
  {
    id: "contemporary", angle: 230,
    title: "Contemporary Social Context", icon: "◑",
    tagline: "The broader social, political and cultural water your clients — and you — are swimming in",
    color: { bg: "#EEF0F8", border: "#485898", text: "#181830" },
    prompts: [
      "How does the instability and pace of contemporary life — liquid modernity — show up in your clinical room?",
      "How do you hold the social, political and economic context of your clients' lives in your thinking, not just their individual stories?",
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
  const [descOpen, setDescOpen] = useState(true);
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
      <div style={{ backgroundColor: c.bg, borderBottom: `2px solid ${c.border}`, padding: "16px 22px 14px", position: "sticky", top: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
              <span style={{ fontSize: "20px", color: c.border }}>{sat.icon}</span>
              <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: "700", color: c.text }}>{sat.title}</h2>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: c.border, fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.4 }}>{sat.tagline}</p>

            {/* Collapsible description */}
            {sat.description && (
              <div style={{ marginTop: "10px" }}>
                <button onClick={() => setDescOpen(o => !o)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: `1px solid ${c.border}66`, borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "10px", color: c.border, fontFamily: "monospace", letterSpacing: "0.06em" }}>
                  <span style={{ transform: descOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▶</span>
                  {descOpen ? "Hide framework overview" : "Show framework overview"}
                </button>
                {descOpen && (
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "7px" }}>
                    {sat.description.map((d, i) => (
                      <div key={i} style={{ borderLeft: `2px solid ${c.border}`, paddingLeft: "10px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: c.text, fontFamily: "Georgia, serif" }}>{d.label} — </span>
                        <span style={{ fontSize: "11px", color: c.text, fontFamily: "Georgia, serif", lineHeight: 1.55 }}>{d.body}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
      "How are broader societal factors — structural oppression, racism, poverty, housing, systemic disadvantage — present in this person's situation, and how are these held in your formulation rather than located within the individual?",
      "What are the behavioural sequences (the 'dances') around the problem — and what function might the symptom serve in the system?",
      "What are the strengths, resources and resilience in this system that you can build on?",
      "How are you actively considering anti-oppressive practice in this work — how are you attending to power, privilege, structural oppression and the risk of imposing Western frameworks in ways that may not fit this client's culture, context or knowledge systems?",
      "What primary, secondary and rejected pictures are shaping your formulation — and what might you be missing?",
    ],
    gaps: [
      "Where does your systemic formulation feel thin or underdeveloped — what are you not yet seeing?",
      "How explicitly are you holding broader societal and structural factors in your formulation — or are you inadvertently locating the problem within the individual or family?",
      "What training or practice would most strengthen your systemic assessment, formulation and anti-oppressive practice skills?",
    ],
    suggestions: ["Systemic hypothesis","Genogram findings","Ecosystem mapping","Behavioural sequences","Function of symptom","Meaning & narrative","Strengths & resilience","Vertical stressors","Family Life Cycle stage","Multigenerational patterns","Broader societal factors","Structural oppression","Anti-oppressive practice","Primary picture named"],
  },
  therapy: {
    title: "Therapy & Intervention in the Room",
    tagline: "Grounded in Way of Being · Alliance · Systemic Formulation",
    color: { bg: "#EAF5EC", border: "#3A8A58", text: "#163820" },
    prompts: [
      "Before reflecting on technique — how were your Way of Being, the alliance, and your systemic formulation present and active in this session?",
      "What was your theory of change for this session — and did your interventions align with it?",
      "What did you actually do in the room — which approaches, techniques or modalities did you draw on, and why those?",
      "How did you attend to the self of the therapist in your decision-making — your wobble points, your theory of change preferences, your reactions to this client or family?",
      "How intentional vs intuitive were your choices in session — and what does that tell you about your conscious competence?",
      "How did you consider anti-oppressive practice in your intervention decisions — were you alert to power dynamics, cultural fit, and the risk of imposing frameworks that may not suit this client's context, identity or knowledge systems?",
      "What was the client's response to your interventions — what worked, what landed, what didn't?",
      "How did you sequence and time your interventions — what shaped your decisions about when to move and when to wait?",
      "What would you do differently — and what does that illuminate about your developing practice?",
      "How did the layers beneath — Way of Being, Alliance, Systemic Formulation — support or constrain your interventions?",
    ],
    gaps: [
      "Where do you notice your intervention choices becoming narrow, habitual or reactive rather than intentional?",
      "How well do you attend to the self of the therapist in your decision-making — your wobble points, contagious anxiety, and theory of change preferences?",
      "What would more conscious competence and anti-oppressive practice look like in your intervention choices — what would you be doing differently?",
    ],
    suggestions: ["Theory of change applied","Self of therapist","Wobble points managed","Anti-oppressive practice","Intentional intervention","Technique selection rationale","Client response observed","Timing & sequencing","Conscious competence","Intuitive vs deliberate","What worked & why","What didn't land","Would do differently","Integration of layers","Ongoing review process"],
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
          {T2({ x: CX, y: CY - 147, rows: ['"The Helicopter View"'], size: 11, fill: "#444", italic: true })}

          {/* Left side — x between CX-252 and CX-128 */}
          {T2({ x: CX - 172, y: CY - 100, rows: ["Structural", "Consideration:", "Family &", "Stakeholder", "Systems"], size: 9, fill: "#222" })}
          {T2({ x: CX - 186, y: CY - 4, rows: ["Family", "Life Cycle"], size: 9, fill: "#222" })}
          {T2({ x: CX - 186, y: CY + 46, rows: ["Vertical &", "Horizontal", "Stressors"], size: 9, fill: "#222" })}
          {T2({ x: CX - 178, y: CY + 82, rows: ["Broader Societal", "Factors e.g.,", "structural", "oppression"], size: 8.5, fill: "#222", dy: 11 })}
          {T2({ x: CX - 140, y: CY + 138, rows: ["Strengths,", "Resources", "& Resilience"], size: 9, fill: "#222" })}

          {/* Right side — x between CX+128 and CX+252 */}
          {T2({ x: CX + 182, y: CY - 82, rows: ["Systemic", "Context", "(Genogram", "& Timeline)"], size: 9, fill: "#222" })}
          {T2({ x: CX + 182, y: CY + 16, rows: ["Meaning", "Making"], size: 9, fill: "#222" })}
          {T2({ x: CX + 182, y: CY + 52, rows: ["Emotions"], size: 9, fill: "#222" })}
          {T2({ x: CX + 182, y: CY + 72, rows: ["Client(s)'s", "Ecosystem"], size: 9, fill: "#222" })}
          {T2({ x: CX + 138, y: CY + 110, rows: ['The "Dances":', "Problem &", "Exception", "Patterns"], size: 8.5, fill: "#222", dy: 11 })}

          {/* THERAPY / INTERVENTION — inner ellipse rx=128 ry=106 */}
          {/* Decision Making box — top — taller to fit title + 5 rows at dy=9 */}
          <rect x={CX-62} y={CY-106} width={124} height={68} rx={4} fill="white" stroke="#333" strokeWidth="1.5" style={{ pointerEvents: "none" }}/>
          {T2({ x: CX, y: CY - 93, rows: ["Decision Making:"], size: 8.5, bold: true })}
          {T2({ x: CX, y: CY - 82, rows: ["Theory of Change,", "context, resources,", "timing & staging,", "decolonizing,", "self of therapist"], size: 7, fill: "#444", dy: 9 })}

          {/* Down arrow */}
          <polygon points={`${CX-9},${CY-37} ${CX+9},${CY-37} ${CX+9},${CY-26} ${CX+16},${CY-26} ${CX},${CY-14} ${CX-16},${CY-26} ${CX-9},${CY-26}`} fill="#333" opacity="0.85" style={{ pointerEvents: "none" }}/>

          {/* Therapy label + list */}
          {T2({ x: CX, y: CY - 7, rows: ["Therapy/Intervention"], size: 9.5, bold: true })}
          {T2({ x: CX, y: CY + 5, rows: ["Systemic FT (1st, 2nd, 3rd Gen),", "Psychoeducation, ACT, DDP,", "MBT, Play Therapy, CBT,", "DBT, PPP, COS, Art Therapy,", "Somatic Approaches."], size: 7, fill: "#333", dy: 10 })}

          {/* Up arrow */}
          <polygon points={`${CX-9},${CY+56} ${CX+9},${CY+56} ${CX+9},${CY+67} ${CX+16},${CY+67} ${CX},${CY+79} ${CX-16},${CY+67} ${CX-9},${CY+67}`} fill="#333" opacity="0.85" style={{ pointerEvents: "none" }}/>

          {/* Ongoing Review box — bottom */}
          <rect x={CX-58} y={CY+81} width={116} height={24} rx={4} fill="white" stroke="#333" strokeWidth="1.5" style={{ pointerEvents: "none" }}/>
          {T2({ x: CX, y: CY + 90, rows: ["Ongoing Review:"], size: 8, bold: true })}
          {T2({ x: CX, y: CY + 100, rows: ["Circular & Collaborative"], size: 7, fill: "#444" })}

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

          <text x={W - 14} y={H - 10} textAnchor="end" fontSize="8" fill="#B8A898" fontFamily="monospace">Systemic Meta-Framework for Integrative Practice · Dr Leonie White · Therapywell</text>
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
      "What stage of the work are you at — beginning, middle, ending — and what does that mean for this session?",
      "What is the broader system context — who else is involved, what services, what pressures, what mandates?",
      "What were the questions for this assessment or session — what were you trying to understand or address?",
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
      "How would you describe the alliance in this session — customer, complainant, visitor or mandated? How did this shape your approach?",
      "Were there moments of rupture or disconnection — and how did you respond?",
      "How safe did the client feel — what told you this neurobiologically and relationally?",
      "How well-aligned were you and the client on the goals and tasks of the session?",
    ],
  },
  {
    id: "formulation_case",
    label: "Multi-Level Formulation",
    icon: "◎",
    color: { bg: "#EAF5EC", border: "#3A8A58", text: "#163820" },
    desc: "A multi-level understanding: observable behaviours · neuropsychological constructs · biological factors · environmental systems",
    prompts: [
      "What are the presenting symptoms and functional skills — both difficulties (weaknesses) and competencies (strengths)? What are the observable behaviours and functional concerns that brought this person to you?",
      "What neuropsychological constructs help explain what you are observing? Consider: attention control, executive function (planning, impulse control, self-monitoring), emotional regulation, social competence, language, memory, higher order cognition. What is the underlying process beneath the surface behaviour?",
      "What biological factors — genetic, neurological, developmental, medical — may be predisposing or contributing to this presentation? Are there biological red flags requiring further investigation?",
      "What does the environmental and family assessment reveal? How are family interaction patterns, beliefs, parenting, sibling dynamics, and broader social systems (school, community, services) contributing to and maintaining the presenting concern?",
      "How are broader societal factors — structural oppression, racism, poverty, housing instability, systemic disadvantage — present in this person's situation? How are these held in your formulation rather than located within the individual or family?",
      "What predisposed this person to this difficulty (early biological or environmental risk factors)? What precipitated the current presentation (acute stressors or events)? What is perpetuating it (biological, psychological or environmental maintaining factors)?",
      "What is your systemic hypothesis about what is maintaining the presenting problem — what is keeping this from being resolved? How are you holding the full ecosystem in your formulation?",
      "How are you actively considering anti-oppressive practice in this case — how are you attending to power, privilege, structural oppression and the risk of imposing Western frameworks in ways that may not fit this client's culture, context or knowledge systems?",
      "What are the strengths, affinities, resilience factors and protective elements in this person, their family, school and community — and how are you building these explicitly into the formulation and management plan?",
      "What is your prognosis — with and without intervention? What is likely to happen for this person over time, and what does that mean for your plan?",
    ],
  },
  {
    id: "intervention_case",
    label: "Therapy & Intervention — What You Did",
    icon: "◆",
    color: { bg: "#F5E6F0", border: "#A03880", text: "#481830" },
    desc: "The actual interventions, grounded in all the layers that came before",
    prompts: [
      "Before reflecting on technique — how were your Way of Being, the alliance, and your formulation present and active in this session?",
      "What was your theory of change for this session — and did your interventions align with it?",
      "What did you actually do in the room — which approaches, techniques or modalities did you draw on, and why those?",
      "How did you attend to the self of the therapist in your decision-making — your wobble points, your anxiety, your theory of change preferences, and any pull toward induction?",
      "How intentional vs intuitive were your choices — and what does that tell you about your conscious competence?",
      "How did you consider anti-oppressive practice in your intervention decisions — were you alert to power dynamics, cultural fit, and the risk of imposing frameworks that may not suit this client's context, identity or knowledge systems?",
      "What was the client's response — what worked, what landed, what didn't?",
      "How did you sequence and time your interventions — what shaped when you moved and when you waited?",
      "How did the layers beneath — Way of Being, Alliance, Formulation — support or constrain what you did in the room?",
    ],
  },
  {
    id: "learning_case",
    label: "Learning & Next Steps",
    icon: "○",
    color: { bg: "#F5F0E0", border: "#907020", text: "#3A2C00" },
    desc: "What this session reveals about your developing practice — and what comes next",
    prompts: [
      "What would you do differently — and what does that illuminate about your growth edges?",
      "Where was your formulation thin or incomplete — which level of analysis (behavioural, neuropsychological, biological, environmental) did you attend to least, and why?",
      "Was your assessment sufficiently strengths-focused — or did deficit-thinking dominate? What resilience and protective factors need more attention?",
      "What did this session reveal about gaps in your framework, knowledge or skills — and what do you want to learn more about?",
      "What do you want to bring to supervision from this reflection?",
      "What management goals — including resilience-building goals — are you taking forward, and what is your follow-up plan?",
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

// ─── PASSWORD GATE ───────────────────────────────────────────────────────────
const CORRECT_PASSWORD = "practiceframework2026brookeshakspeare";

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [focused, setFocused] = useState(false);

  const attempt = () => {
    if (input.trim().toLowerCase() === CORRECT_PASSWORD) {
      try { localStorage.setItem("pfm_auth", "1"); } catch {}
      onUnlock();
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1A2818", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: "20px" }}>
      <div style={{ backgroundColor: "#F7F3EE", borderRadius: "16px", padding: "48px 44px", maxWidth: "420px", width: "100%", boxShadow: "0 8px 48px #00000040", textAlign: "center" }}>
        {/* Logo */}
        <div style={{ marginBottom: "24px" }}>
          <img src="/logo.webp" alt="The Practice Map" style={{ width: "140px", height: "140px", objectFit: "contain", display: "block", margin: "0 auto" }}/>
        </div>

        <p style={{ margin: "0 0 4px", fontSize: "10px", color: "#7AAB68", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>Clinical Supervision Tool</p>
        <p style={{ margin: "0 0 32px", fontSize: "13px", color: "#7A6B5C", fontStyle: "italic", lineHeight: 1.5 }}>A living map for intentional clinical practice</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && attempt()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Enter access password"
            style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: `1.5px solid ${error ? "#C03030" : focused ? "#3A8A58" : "#C8B8A2"}`, fontSize: "14px", fontFamily: "Georgia, serif", color: "#3D3128", outline: "none", backgroundColor: "white", boxSizing: "border-box", textAlign: "center", transition: "border-color 0.15s" }}
          />
          {error && <p style={{ margin: 0, fontSize: "12px", color: "#C03030", fontFamily: "Georgia, serif" }}>Incorrect password — please try again</p>}
          <button onClick={attempt} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#2E3A28", color: "#C0E8A8", border: "none", fontSize: "14px", fontFamily: "Georgia, serif", cursor: "pointer", fontWeight: "700", letterSpacing: "0.04em" }}>
            Enter
          </button>
        </div>

        <p style={{ margin: "24px 0 0", fontSize: "11px", color: "#B5A898", fontFamily: "Georgia, serif", lineHeight: 1.6 }}>
          Access is provided by your supervisor.<br/>Contact Brooke Shakspeare for access.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => {
    try { return localStorage.getItem("pfm_auth") === "1"; } catch { return false; }
  });

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)}/>;

  return <AppInner/>;
}

function AppInner() {
  const [tab, setTab] = useState("howto");
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
    localStorage.removeItem("pfm_growth_synthesis");
    localStorage.removeItem("pfm_growth_goals");
    setAllItems({ values: [], theories: [], approaches: [], influences: [], self: [], context: [] });
    setSatItems({ systems: [], foundational: [], epistemology: [], humanrights: [], antioppressive: [], cultural: [], ethics: [], philosophy: [], contemporary: [] });
    setNotes("");
  }, []);
  const totalItems  = Object.values(allItems).flat().length + Object.values(satItems).flat().length;

  const tabs = [
    { id: "howto",     label: "How to Use" },
    { id: "map",       label: "Visual Map" },
    { id: "editor",    label: "Editor" },
    { id: "summary",   label: "Summary" },
    { id: "questions", label: "Supervision Qs" },
    { id: "case",      label: "Case Reflection" },
    { id: "growth",    label: "Growth & Gaps" },
    { id: "refs",      label: "References" },
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
                <p style={{ margin: 0, fontSize: "12px", color: T.inkFaint }}>Systemic Meta-Framework for Integrative Practice — click any ellipse ring or satellite node to open reflection prompts</p>
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
        {tab === "growth"    && <GrowthGapsView/>}
        {tab === "howto"     && <HowToUseView onNavigate={setTab}/>}
        {tab === "refs"      && <ReferencesView/>}
      </div>
    </div>
  );
}

// ─── REFERENCES VIEW ─────────────────────────────────────────────────────────
// ─── GROWTH & GAPS VIEW ──────────────────────────────────────────────────────
// Collates all gaps/growth text from ring panels + case reflection learning section

const RING_GAP_SOURCES = [
  { key: "wob",      label: "Way of Being — Gaps & Growth",                  color: { bg: "#FEF6EE", border: "#C07840", text: "#5A2A10" } },
  { key: "alliance", label: "Therapeutic Alliance — Gaps & Growth",          color: { bg: "#EFF0FA", border: "#5060B8", text: "#1A2060" } },
  { key: "systemic", label: "Systemic Formulation & Practice — Gaps & Growth", color: { bg: "#EAF0F8", border: "#3A68B0", text: "#162848" } },
  { key: "therapy",  label: "Therapy & Intervention — Gaps & Growth",        color: { bg: "#EAF5EC", border: "#3A8A58", text: "#163820" } },
];

function GrowthGapsView() {
  // Read all saved gaps text from localStorage
  const ringGaps = RING_GAP_SOURCES.map(s => ({
    ...s,
    text: (() => { try { return localStorage.getItem(`pfm_ring_gaps_${s.key}`) || ""; } catch { return ""; } })(),
  }));
  const caselearning = (() => { try { return localStorage.getItem("pfm_case_learning_case") || ""; } catch { return ""; } })();
  const hasAny = ringGaps.some(r => r.text.trim()) || caselearning.trim();

  // Synthesis goals — own editable localStorage field
  const synthKey = "pfm_growth_synthesis";
  const goalsKey = "pfm_growth_goals";
  const [synthesis, setSynthesis] = useState(() => { try { return localStorage.getItem(synthKey) || ""; } catch { return ""; } });
  const [goals,     setGoals]     = useState(() => { try { return localStorage.getItem(goalsKey) || ""; } catch { return ""; } });
  const saveTimer = useRef(null);
  const save = (key, val) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { try { localStorage.setItem(key, val); } catch {} }, 500);
  };

  const divider = (label) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0 2px" }}>
      <div style={{ flex: 1, height: "1px", backgroundColor: T.lineFaint }}/>
      <span style={{ fontSize: "9px", color: T.inkGhost, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", backgroundColor: T.lineFaint }}/>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Header */}
      <div style={{ padding: "18px 22px", backgroundColor: T.bgDeep, borderRadius: "12px", border: `1px solid ${T.line}` }}>
        <h2 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: "18px", color: T.inkMid, fontWeight: "700" }}>Growth & Gaps</h2>
        <p style={{ margin: 0, fontSize: "12px", color: T.inkFaint, fontFamily: "Georgia, serif", lineHeight: 1.65 }}>
          A collation of the gaps and growth reflections you have recorded across the SIPM ring panels and Case Reflection. Use this page to identify patterns, name priority areas, and build your supervision and learning goals.
        </p>
      </div>

      {/* Empty state */}
      {!hasAny && (
        <div style={{ padding: "32px 22px", backgroundColor: "white", borderRadius: "12px", border: `1.5px solid ${T.lineFaint}`, textAlign: "center" }}>
          <p style={{ margin: "0 0 6px", fontFamily: "Georgia, serif", fontSize: "16px", color: T.inkGhost }}>No gaps or growth notes recorded yet</p>
          <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "12px", color: T.inkGhost, lineHeight: 1.6 }}>
            Click the ellipse rings on the Visual Map to open each SIPM layer panel — scroll to the bottom of each panel to find the Gaps, Growth & Supervision Goals section. Reflections from the Case Reflection tab also appear here.
          </p>
        </div>
      )}

      {/* Collated ring gaps */}
      {hasAny && (
        <>
          {divider("Collated from SIPM ring panels")}
          {ringGaps.map(r => r.text.trim() ? (
            <div key={r.key} style={{ borderRadius: "10px", overflow: "hidden", border: `1.5px solid ${r.color.border}33` }}>
              <div style={{ backgroundColor: r.color.bg, padding: "10px 16px", borderBottom: `1px solid ${r.color.border}22` }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "700", color: r.color.text }}>{r.label}</span>
              </div>
              <div style={{ padding: "12px 16px", backgroundColor: "white" }}>
                <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "12.5px", color: T.inkMid, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{r.text}</p>
              </div>
            </div>
          ) : null)}

          {/* Case reflection learning */}
          {caselearning.trim() && (
            <>
              {divider("From Case Reflection — Learning & Next Steps")}
              <div style={{ borderRadius: "10px", overflow: "hidden", border: `1.5px solid #90702033` }}>
                <div style={{ backgroundColor: "#F5F0E0", padding: "10px 16px", borderBottom: `1px solid #90702022` }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "700", color: "#3A2C00" }}>Case Reflection — Learning & Next Steps</span>
                </div>
                <div style={{ padding: "12px 16px", backgroundColor: "white" }}>
                  <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "12.5px", color: T.inkMid, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{caselearning}</p>
                </div>
              </div>
            </>
          )}

          {divider("Synthesis & Supervision Goals")}

          {/* Synthesis text */}
          <div style={{ borderRadius: "10px", overflow: "hidden", border: `1.5px solid ${T.line}` }}>
            <div style={{ backgroundColor: T.bgDeep, padding: "10px 16px", borderBottom: `1px solid ${T.line}` }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "700", color: T.inkMid }}>Synthesis — What patterns do I notice?</span>
              <p style={{ margin: "2px 0 0", fontFamily: "Georgia, serif", fontSize: "11px", color: T.inkFaint }}>Looking across everything above — what themes, patterns or recurring gaps do you notice?</p>
            </div>
            <textarea value={synthesis} onChange={e => { setSynthesis(e.target.value); save(synthKey, e.target.value); }}
              placeholder="e.g. I notice that across several layers my formulation stays at the behavioural level — I'm not consistently thinking neuropsychologically. I also notice that I rarely explicitly document strengths and resilience…"
              rows={5}
              style={{ width: "100%", border: "none", outline: "none", padding: "14px 16px", fontSize: "12.5px", fontFamily: "Georgia, serif", color: T.inkMid, backgroundColor: "white", resize: "vertical", boxSizing: "border-box", lineHeight: 1.7 }}/>
          </div>

          {/* Goals */}
          <div style={{ borderRadius: "10px", overflow: "hidden", border: `1.5px solid ${T.line}` }}>
            <div style={{ backgroundColor: T.bgDeep, padding: "10px 16px", borderBottom: `1px solid ${T.line}` }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "700", color: T.inkMid }}>Supervision & Learning Goals</span>
              <p style={{ margin: "2px 0 0", fontFamily: "Georgia, serif", fontSize: "11px", color: T.inkFaint }}>What specific goals do you want to bring to supervision? What will you do to address the gaps you have identified?</p>
            </div>
            <textarea value={goals} onChange={e => { setGoals(e.target.value); save(goalsKey, e.target.value); }}
              placeholder="e.g. 1. Bring a case to supervision to practise multi-level formulation. 2. Read O'Keeffe & Macaulay (2012) on neuropsychological constructs. 3. Ask supervisor to help me develop a more explicit strengths-based lens…"
              rows={5}
              style={{ width: "100%", border: "none", outline: "none", padding: "14px 16px", fontSize: "12.5px", fontFamily: "Georgia, serif", color: T.inkMid, backgroundColor: "white", resize: "vertical", boxSizing: "border-box", lineHeight: 1.7 }}/>
          </div>

          {/* Prompts to support synthesis */}
          <div style={{ backgroundColor: T.bgDeep, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${T.lineFaint}` }}>
            <p style={{ margin: "0 0 8px", fontSize: "10px", color: T.inkGhost, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Questions to support your synthesis</p>
            {[
              "Which gaps appear across more than one layer of the SIPM — what does that tell you about a deeper pattern?",
              "Are your gaps more about knowledge and theory, clinical skill and technique, or personal/reflective development?",
              "What would growth look like in 3 months — what would you be doing differently in the room?",
              "What support, training or reading would most address your priority gaps?",
              "What do you most want your supervisor to know, challenge you on, or help you with?",
              "How will you know when you have made progress — what will be different?",
            ].map((q, i) => (
              <p key={i} style={{ margin: "4px 0 0", fontSize: "12px", color: T.inkFaint, fontFamily: "Georgia, serif", lineHeight: 1.6 }}>· {q}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── HOW TO USE VIEW ─────────────────────────────────────────────────────────
function HowToUseView({ onNavigate }) {
  const USE_CASES = [
    {
      icon: "◎", title: "Mapping your practice framework",
      color: { bg: "#E6F0F8", border: "#3A68B0", text: "#162848" },
      desc: "Use this when starting supervision, beginning with a new supervisor, or at key points in your professional development.",
      steps: [
        { tab: "map", label: "Visual Map", instruction: "Start here. The SIPM diagram sits at the centre — click any of the four ellipse rings (Way of Being, Therapeutic Alliance, Systemic Formulation, Therapy & Intervention) to open a reflection panel for that layer." },
        { tab: "map", label: "Visual Map", instruction: "Then click each of the nine satellite nodes around the outside. Each one represents a knowledge base that informs your practice. Read the framework overview, then work through the reflection prompts." },
        { tab: "editor", label: "Editor", instruction: "Use the Editor tab to add the specific theories, approaches, values and influences that make up your practice. Tap suggestions or type your own." },
        { tab: "summary", label: "Summary", instruction: "The Summary tab collects everything you've added into one view — useful to bring to supervision as a snapshot of your framework." },
      ],
    },
    {
      icon: "◆", title: "Reflecting on a specific client or session",
      color: { bg: "#F5E6F0", border: "#A03880", text: "#481830" },
      desc: "Use this when you want to think through a case in depth — moving layer by layer from your Way of Being to what you actually did in the room.",
      steps: [
        { tab: "case", label: "Case Reflection", instruction: "Go to the Case Reflection tab. Work through the six sections in order — starting with the client context, then your Way of Being, the alliance, the formulation, the intervention, and finally your learning." },
        { tab: "case", label: "Case Reflection", instruction: "You don't need to complete every section. Open the ones most relevant to what you want to bring to supervision. Each section saves automatically." },
        { tab: "map", label: "Visual Map", instruction: "You can also click the SIPM rings on the Visual Map and use those panels to reflect on a specific client — the prompts are framed around live clinical situations." },
        { tab: "questions", label: "Supervision Qs", instruction: "Use the Supervision Questions tab to generate discussion questions to bring to your supervisor after completing your case reflection." },
      ],
    },
    {
      icon: "○", title: "Identifying gaps and setting learning goals",
      color: { bg: "#F5F0E0", border: "#907020", text: "#3A2C00" },
      desc: "Use this periodically — at supervision, at the start of a training year, or when you're feeling stuck or uncertain in your practice.",
      steps: [
        { tab: "map", label: "Visual Map", instruction: "Click each SIPM ring on the Visual Map. At the bottom of each panel you'll find a Gaps, Growth & Supervision Goals section with specific prompts about where your knowledge or practice is thin." },
        { tab: "case", label: "Case Reflection", instruction: "Complete a Case Reflection and pay particular attention to the final section — Learning & Next Steps — which asks what the session revealed about gaps in your framework." },
        { tab: "growth", label: "Growth & Gaps", instruction: "Go to the Growth & Gaps tab. It automatically collects everything you've written in the gaps sections across all panels into one view. Use the Synthesis and Goals sections to identify patterns and build your supervision goals." },
      ],
    },
    {
      icon: "◈", title: "Preparing for a supervision session",
      color: { bg: "#EAF5EC", border: "#3A8A58", text: "#163820" },
      desc: "Use this in the hour before supervision to gather your thinking and identify what you most want to bring.",
      steps: [
        { tab: "summary", label: "Summary", instruction: "Review your Summary tab for an overview of your practice framework — this is useful context for your supervisor." },
        { tab: "growth", label: "Growth & Gaps", instruction: "Check the Growth & Gaps tab to see what gaps and goals you've already identified — bring these to supervision explicitly." },
        { tab: "questions", label: "Supervision Qs", instruction: "Work through one or two Supervision Questions and write brief notes. These give you something concrete to open the supervision conversation." },
        { tab: "editor", label: "Editor", instruction: "Use the Supervision Notes field in the Editor tab to jot down specific questions, dilemmas or areas of uncertainty you want to raise." },
      ],
    },
  ];

  const NAV_TIPS = [
    { icon: "◉", text: "Your data saves automatically as you type — you can close the app and return to find everything where you left it." },
    { icon: "◎", text: "You don't need to use every tab. Start with what's most relevant to you right now — the tool is designed to be used flexibly and in any order." },
    { icon: "◈", text: "On the Visual Map, click the ellipse rings to reflect on each SIPM layer. Click the satellite nodes to explore the knowledge bases informing your practice." },
    { icon: "◇", text: "Panel descriptions can be collapsed — look for the 'Hide framework overview' toggle to bring the reflection prompts into view more quickly." },
    { icon: "◆", text: "The References tab credits all authors and frameworks underpinning the tool — useful for further reading or citing in professional development portfolios." },
  ];

  const Block = ({ uc }) => {
    const [open, setOpen] = useState(false);
    const c = uc.color;
    return (
      <div style={{ borderRadius: "12px", overflow: "hidden", border: `1.5px solid ${open ? c.border : T.lineFaint}`, transition: "border-color 0.2s" }}>
        <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 18px", cursor: "pointer", backgroundColor: open ? c.bg : "white", borderBottom: open ? `1px solid ${c.border}33` : "none", transition: "background 0.2s" }}>
          <span style={{ fontSize: "20px", color: c.border, flexShrink: 0, marginTop: "2px" }}>{uc.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 3px", fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: "700", color: T.inkMid }}>{uc.title}</p>
            <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "11.5px", color: T.inkFaint, lineHeight: 1.5 }}>{uc.desc}</p>
          </div>
          <span style={{ color: T.inkGhost, fontSize: "12px", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", marginTop: "4px" }}>▾</span>
        </div>
        {open && (
          <div style={{ backgroundColor: "white", padding: "4px 18px 16px" }}>
            {uc.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <div style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", backgroundColor: c.bg, border: `1.5px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: c.border, fontWeight: "700" }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <button onClick={() => onNavigate(step.tab)} style={{ marginBottom: "4px", padding: "2px 9px", borderRadius: "100px", border: `1px solid ${c.border}`, backgroundColor: c.bg, color: c.text, fontSize: "10px", fontFamily: "monospace", cursor: "pointer", letterSpacing: "0.04em" }}>
                    → {step.label}
                  </button>
                  <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "12.5px", color: T.inkMid, lineHeight: 1.65 }}>{step.instruction}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Header */}
      <div style={{ padding: "18px 22px", backgroundColor: T.bgDeep, borderRadius: "12px", border: `1px solid ${T.line}` }}>
        <h2 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: "18px", color: T.inkMid, fontWeight: "700" }}>How to Use This Tool</h2>
        <p style={{ margin: 0, fontSize: "12px", color: T.inkFaint, fontFamily: "Georgia, serif", lineHeight: 1.65 }}>
          This tool supports clinical supervision and professional development. It can be used in different ways depending on what you need — below are four common starting points. You don't need to use every feature; start with what's most relevant and explore from there.
        </p>
      </div>

      {/* Use cases */}
      {USE_CASES.map((uc, i) => <Block key={i} uc={uc}/>)}

      {/* General tips */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", border: `1.5px solid ${T.lineFaint}`, padding: "16px 18px" }}>
        <p style={{ margin: "0 0 10px", fontSize: "10px", color: T.inkGhost, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Good to know</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          {NAV_TIPS.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "13px", color: T.inkGhost, flexShrink: 0, marginTop: "1px" }}>{tip.icon}</span>
              <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "12.5px", color: T.inkFaint, lineHeight: 1.6 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Credit */}
      <div style={{ padding: "12px 18px", backgroundColor: T.bgDeep, borderRadius: "10px", border: `1px solid ${T.lineFaint}` }}>
        <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "11px", color: T.inkGhost, lineHeight: 1.7, fontStyle: "italic" }}>
          Built around the <em>Systemic Meta-Framework for Integrative Practice</em> — Dr Leonie White, Therapywell Allied Health and Wellbeing. See the References tab for full attribution.
        </p>
      </div>
    </div>
  );
}

const REFERENCE_GROUPS = [
  {
    heading: "Systemic Meta-Framework for Integrative Practice",
    color: { bg: "#EAF5EC", border: "#3A8A58", text: "#163820" },
    refs: [
      { authors: "White, L.", year: "2025", title: "Systemic Meta-Framework for Integrative Practice", source: "Therapywell Allied Health and Wellbeing. www.drleoniewhite.com" },
      { authors: "White, L.", year: "2025", title: "Embracing Systemic Integrative Practice: A Meta-Framework and Roadmap", source: "Phoenix Family Therapy Academy Blog. Retrieved from https://www.phoenixftacademy.com/post/embracing-systemic-integrative-practice-a-meta-framework-and-roadmap [Updated model including Decision Making, Decolonizing, Self of Therapist, and Broader Societal Factors]" },
      { authors: "White, L. & Owen, K.", year: "2022", title: "Systemic Integrative Practice: A Meta-Framework", source: "Australian and New Zealand Journal of Family Therapy, 43, 33–53." },
      { authors: "White, L.", year: "2022", title: "Editorial: Integrative practice in family therapy", source: "Australian and New Zealand Journal of Family Therapy, 43, 3–8." },
      { authors: "Fife, S., Whiting, J., Bradford, K. & Davis, S.", year: "2014", title: "The therapeutic pyramid: A common factors synthesis of techniques, alliance and way of being", source: "Journal of Marital and Family Therapy, 40(1), 20–33." },
      { authors: "Davis, S. D., Fife, S. T., Whiting, J. B. & Bradford, K. P.", year: "2020", title: "Way of being and the therapeutic pyramid: Expanding the application of a common factors meta-model", source: "Journal of Marital and Family Therapy, 47, 69–84." },
      { authors: "LeBow, J. L.", year: "2019", title: "Current issues in the practice of integrative couple and family therapy", source: "Family Process, 58(3), 610–628." },
      { authors: "LeBow, J. L.", year: "1997", title: "Clinical theory and practice: Integrative family therapy", source: "Family Process, 36, 1–17." },
      { authors: "Kozlowska, K. & Hanney, L.", year: "2003", title: "Maltreated children: A systems approach to treatment planning in clinical settings", source: "Australian and New Zealand Journal of Family Therapy, 24(2), 75–87." },
    ],
  },
  {
    heading: "Therapeutic Alliance",
    color: { bg: "#EFF0FA", border: "#5060B8", text: "#1A2060" },
    refs: [
      { authors: "Bordin, E. S.", year: "1979", title: "The generalisability of the psychoanalytic concept of the working alliance", source: "Psychotherapy: Theory, Research and Practice, 16, 252–260." },
      { authors: "Friedlander, M. L., Escudero, V., Welmers-van de Poll, M. & Heatherington, L.", year: "2018", title: "Meta-analysis of the alliance-outcome relation in couple and family therapy", source: "Psychotherapy, 55(4), 356–371." },
      { authors: "Escudero, V., Friedlander, M. L., Varela, N. & Abascal, A.", year: "2008", title: "Observing the therapeutic alliance in family therapy: associations with participants' perceptions and therapeutic outcomes", source: "Journal of Family Therapy, 30, 194–214." },
    ],
  },
  {
    heading: "Neuroscience, Attachment & Nervous System",
    color: { bg: "#EAF0F8", border: "#3A68B0", text: "#162848" },
    refs: [
      { authors: "Porges, S. W.", year: "2003", title: "The polyvagal theory: phylogenetic contributions to social behaviour", source: "Physiology & Behavior, 79, 503–513." },
      { authors: "Siegel, D. J.", year: "1999", title: "The Developing Mind: How Relationships and the Brain Interact to Shape Who We Are", source: "New York: Guilford Press." },
      { authors: "Bowlby, J.", year: "1969", title: "Attachment and Loss: Vol. 1. Attachment", source: "New York: Basic Books." },
      { authors: "Schore, A. N.", year: "2014", title: "The science of the art of psychotherapy", source: "New York: Norton." },
      { authors: "Badenoch, B.", year: "2008", title: "Being a Brain-Wise Therapist: A Practical Guide to Interpersonal Neurobiology", source: "New York: Norton." },
      { authors: "Beaudoin, M. & Monk, G.", year: "2024", title: "Narrative Practices and Emotions: 40+ Ways to Support the Emergence of Flourishing Identities", source: "New York: Norton Professional Books." },
      { authors: "Goleman, D.", year: "2006", title: "Social Intelligence: The New Science of Human Relationships", source: "London: Hutchinson." },
      { authors: "Hughes, D.", year: "2007", title: "Attachment-Focused Family Therapy", source: "New York: Norton." },
    ],
  },
  {
    heading: "Diagnostic Formulation & Developmental-Behavioural Practice",
    color: { bg: "#FEF6EE", border: "#C07840", text: "#5A2A10" },
    refs: [
      { authors: "O'Keeffe, M. & Macaulay, C.", year: "2012", title: "Diagnosis in developmental–behavioural paediatrics: The art of diagnostic formulation", source: "Journal of Paediatrics and Child Health, 48, E15–E26." },
      { authors: "Engel, G. L.", year: "1977", title: "The need for a new medical model: A challenge for biomedicine", source: "Science, 196, 129–136." },
      { authors: "Bronfenbrenner, U.", year: "1979", title: "The Ecology of Human Development: Experiments by Nature and Design", source: "Cambridge, MA: Harvard University Press." },
      { authors: "Nurcombe, B.", year: "2008", title: "Diagnostic formulation, treatment planning, and modes of treatment in children and adolescents", source: "In: Ebert M., Loosen P., Nurcombe B. & Leckman J. (eds). Psychiatry: Current Diagnosis and Treatment, 2nd edn. London: McGraw Hill Medical, pp. 163–166." },
      { authors: "Winters, N., Hanson, G. & Stoyanova, N.", year: "2007", title: "The case formulation in child and adolescent psychiatry", source: "Child and Adolescent Psychiatric Clinics of North America, 16, 111–113." },
      { authors: "Jellinek, M. S. & McDermott, J. F.", year: "2004", title: "Formulation: putting the diagnosis into a therapeutic context and treatment plan", source: "Journal of the American Academy of Child and Adolescent Psychiatry, 43, 913–916." },
    ],
  },
  {
    heading: "Family Therapy Schools & Systemic Practice",
    color: { bg: "#E6F0F8", border: "#3A68B0", text: "#162848" },
    refs: [
      { authors: "Minuchin, S.", year: "1974", title: "Families and Family Therapy", source: "Cambridge, MA: Harvard University Press." },
      { authors: "Selvini, M. P., Boscolo, L., Cecchin, G. & Prata, G.", year: "1980", title: "Hypothesizing — Circularity — Neutrality: Three guidelines for the conductor of the session", source: "Family Process, 19(1), 3–12." },
      { authors: "Cecchin, G.", year: "1987", title: "Hypothesizing, circularity, and neutrality revisited: An invitation to curiosity", source: "Family Process, 26(4), 405–413." },
      { authors: "White, M. & Epston, D.", year: "1990", title: "Narrative Means to Therapeutic Ends", source: "New York: Norton." },
      { authors: "de Shazer, S.", year: "1985", title: "Keys to Solution in Brief Therapy", source: "New York: Norton." },
      { authors: "Bowen, M.", year: "1978", title: "Family Therapy in Clinical Practice", source: "New York: Aronson." },
      { authors: "Satir, V.", year: "1972", title: "Peoplemaking", source: "Palo Alto, CA: Science and Behavior Books." },
      { authors: "Bertrando, P.", year: "2007", title: "The Dialogical Therapist: Dialogue in Systemic Practice", source: "London: Karnac Books." },
      { authors: "Lowe, R.", year: "2004", title: "Family Therapy: A Constructive Framework", source: "London: Sage Publications." },
      { authors: "Nichols, M. P. & Davis, S.", year: "2019", title: "Family Therapy: Concepts and Methods", source: "Hoboken, NJ: Pearson." },
    ],
  },
  {
    heading: "Mentalizing & Dyadic Developmental Psychotherapy",
    color: { bg: "#F0EBF8", border: "#7048B0", text: "#2A1050" },
    refs: [
      { authors: "Fonagy, P., Gergely, G., Jurist, E. & Target, M.", year: "2002", title: "Affect Regulation, Mentalization, and the Development of the Self", source: "New York: Other Press." },
      { authors: "Hughes, D. A.", year: "2011", title: "Brain-Based Parenting: The Neuroscience of Caregiving for Healthy Attachment", source: "New York: Norton." },
      { authors: "Fuggle, P.", year: "2016", title: "Mentalizing in child and adolescent therapy", source: "In: Bateman, A. & Fonagy, P. (eds). Handbook of Mentalizing in Mental Health Practice. Washington: American Psychiatric Publishing." },
    ],
  },
  {
    heading: "Social Constructionism & Epistemology",
    color: { bg: "#F0EBF8", border: "#7048B0", text: "#2A1050" },
    refs: [
      { authors: "Gergen, K. J.", year: "1999", title: "An Invitation to Social Construction", source: "London: Sage." },
      { authors: "Anderson, H. & Goolishian, H.", year: "1992", title: "The client is the expert: a not-knowing approach to therapy", source: "In: McNamee, S. & Gergen, K. J. (eds). Therapy as Social Construction. London: Sage, pp. 25–39." },
      { authors: "Flaskas, C.", year: "2002", title: "Towards a common ground in psychoanalysis and family therapy: On knowing not to know", source: "Journal of Family Therapy, 24(4), 346–366." },
      { authors: "Macaskie, J., Meekums, B. & Nolan, G.", year: "2021", title: "A not-knowing, values-based and relational approach to counselling education", source: "British Journal of Guidance & Counselling, 51(1), 1–14." },
      { authors: "Winter, D. A. & Metcalfe, C.", year: "2013", title: "The relationship between therapist epistemology, therapy style, working alliance, and intervention use", source: "American Journal of Psychotherapy, 67(4), 323–345." },
      { authors: "Bauman, Z.", year: "2000", title: "Liquid Modernity", source: "Cambridge: Polity Press." },
    ],
  },
  {
    heading: "Anti-Oppressive Practice, Power & Social Justice",
    color: { bg: "#F5E6F0", border: "#A03880", text: "#481830" },
    refs: [
      { authors: "Burnham, J.", year: "1993", title: "Systemic supervision: The evolution of reflexivity in the context of the supervisory relationship", source: "Human Systems, 4, 349–381. [Social GRACES framework]" },
      { authors: "Dominelli, L.", year: "2002", title: "Anti-Oppressive Social Work Theory and Practice", source: "Basingstoke: Palgrave Macmillan." },
      { authors: "Goodchild, M.", year: "2022", title: "Relational Systems Thinking: The Dibaajimowin (Story) of Re-Theorizing 'Systems Thinking' and 'Complexity Science'", source: "Journal of Awareness-Based Systems Change, 1(1), 53–76." },
    ],
  },
  {
    heading: "Supervision",
    color: { bg: "#E4F0F0", border: "#408888", text: "#103838" },
    refs: [
      { authors: "O'Donoghue, K.", year: "2003", title: "Restorying Social Work Supervision", source: "Palmerston North, Aotearoa New Zealand: Dunmore Press." },
      { authors: "Kadushin, A.", year: "1992", title: "Supervision in Social Work (3rd ed.)", source: "New York: Columbia University Press." },
      { authors: "Hawkins, P. & Ryde, J.", year: "2020", title: "Integrative Psychotherapy in Theory and Practice", source: "London: Jessica Kingsley." },
      { authors: "O'Keeffe, M. J. & Shelton, D. C.", year: "2007", title: "Personal supervision for paediatricians", source: "Journal of Paediatrics and Child Health, 43, 103–106." },
      { authors: "Lowe, R., Hunt, C. & Simmons, P.", year: "2008", title: "Towards multi-positioned live supervision in family therapy", source: "Contemporary Family Therapy, 30, 3–14." },
    ],
  },
  {
    heading: "Philosophy of Practice & Professional Identity",
    color: { bg: "#E8F5F0", border: "#208870", text: "#083828" },
    refs: [
      { authors: "Schon, D. A.", year: "1991", title: "The Reflective Practitioner: How Professionals Think in Action", source: "Aldershot: Ashgate." },
      { authors: "Argyris, C. & Schon, D. A.", year: "1974", title: "Theory in Practice: Increasing Professional Effectiveness", source: "San Francisco: Jossey-Bass." },
      { authors: "Masten, A.", year: "2001", title: "Ordinary magic: Resilience processes in development", source: "American Psychologist, 56, 227–238." },
    ],
  },
];

function ReferencesView() {
  const [open, setOpen] = useState({});
  const toggle = id => setOpen(p => ({ ...p, [id]: !p[id] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ padding: "18px 22px", backgroundColor: T.bgDeep, borderRadius: "12px", border: `1px solid ${T.line}` }}>
        <h2 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: "18px", color: T.inkMid, fontWeight: "700" }}>References & Acknowledgements</h2>
        <p style={{ margin: 0, fontSize: "12px", color: T.inkFaint, fontFamily: "Georgia, serif", lineHeight: 1.6 }}>
          The theoretical frameworks, models and authors whose work underpins this supervision tool. Click each heading to expand.
        </p>
      </div>

      <div style={{ padding: "14px 18px", backgroundColor: "white", borderRadius: "12px", border: `1px solid ${T.lineFaint}` }}>
        <p style={{ margin: "0 0 6px", fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "700", color: T.inkMid }}>About This Tool</p>
        <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "12.5px", color: T.inkFaint, lineHeight: 1.7 }}>
          The Practice Map was developed by Brooke Shakspeare, social worker, clinical supervisor and educator. It draws on a rich and layered body of knowledge and experience — including social work practice framework traditions, Brooke's own clinical and supervisory practice, learnings from mentors and clinical supervision across her career, and her experience working within and leading multidisciplinary teams. Particularly formative was her work within <strong style={{ color: T.inkMid }}>Evolve Therapeutic Services</strong>, where an explicitly systemic practice framework was developed collaboratively across the team and across disciplines — an experience that deeply shaped her understanding of what it means to hold a shared theoretical framework in complex MDT settings.
          {"\n\n"}The Systemic Meta-Framework for Integrative Practice forms the visual and reflective practice framework at the centre of this tool. The framework was first published by <strong style={{ color: T.inkMid }}>White, L. & Owen, K. (2022)</strong> in the Australian and New Zealand Journal of Family Therapy, and has been further developed and updated by <strong style={{ color: T.inkMid }}>Dr Leonie White (2025)</strong> through her ongoing teaching, supervision and practice at Therapywell Allied Health and Wellbeing and Phoenix Family Therapy Academy. The broader satellite knowledge bases, reflection prompts, case reflection structure and supervision framework reflect Brooke's own practice framework as a social worker and supervisor, informed by the many authors, theorists and colleagues credited in the reference groups below. The supervision framework also draws on Kieran O'Donoghue's <em>Restorying Social Work Supervision</em> (2003), and the multi-level diagnostic formulation framework is drawn from O'Keeffe & Macaulay (2012).
        </p>
      </div>

      {REFERENCE_GROUPS.map((group, gi) => {
        const isOpen = open[gi];
        const c = group.color;
        return (
          <div key={gi} style={{ borderRadius: "12px", overflow: "hidden", border: `1.5px solid ${isOpen ? c.border : T.lineFaint}`, transition: "border-color 0.2s" }}>
            <div onClick={() => toggle(gi)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", cursor: "pointer", backgroundColor: isOpen ? c.bg : "white", borderBottom: isOpen ? `1px solid ${c.border}33` : "none", transition: "background 0.2s" }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: "700", color: isOpen ? c.text : T.inkMid }}>{group.heading}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "10px", color: T.inkGhost, fontFamily: "monospace" }}>{group.refs.length} source{group.refs.length !== 1 ? "s" : ""}</span>
                <span style={{ color: T.inkGhost, fontSize: "12px", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
              </div>
            </div>
            {isOpen && (
              <div style={{ backgroundColor: "white", padding: "4px 0 8px" }}>
                {group.refs.map((ref, ri) => (
                  <div key={ri} style={{ padding: "10px 18px", borderBottom: ri < group.refs.length - 1 ? `1px solid ${T.lineFaint}` : "none" }}>
                    <p style={{ margin: 0, fontSize: "12.5px", fontFamily: "Georgia, serif", color: T.inkMid, lineHeight: 1.65 }}>
                      <span style={{ fontWeight: "700" }}>{ref.authors}</span>
                      {" "}({ref.year}).{" "}
                      <span style={{ fontStyle: "italic" }}>{ref.title}.</span>
                      {" "}<span style={{ color: T.inkFaint }}>{ref.source}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ padding: "14px 18px", backgroundColor: T.bgDeep, borderRadius: "12px", border: `1px solid ${T.lineFaint}`, marginTop: "4px" }}>
        <p style={{ margin: 0, fontSize: "11px", color: T.inkGhost, fontFamily: "Georgia, serif", lineHeight: 1.7, fontStyle: "italic" }}>
          This tool was developed for clinical supervision purposes. All theoretical frameworks are attributed to their original authors. If you identify a source that should be included or credited differently, please raise this with your supervisor.
        </p>
      </div>
    </div>
  );
}
