import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AudioLines, Building2, Layers, MapPin, MessageCircle, Mic, MicOff, Send, Sparkles, Square, Volume2, VolumeX, X } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import useVoiceConversation from '../hooks/useVoiceConversation';
import dinsoniLogo from '../assets/dinsoni-ai-mark.svg';

const copy = {
  sq: {
    title: 'Dinsoni', greeting: 'Përshëndetje! Unë jam Dinsoni. Mund të kërkoj në katalogun real dhe t’ju dërgoj te faqja që kërkoni.',
    hint: 'Shkruani ose flisni për bizneset, kategoritë, vendbanimet apo faqen e administratorit.',
    placeholder: 'Shkruani pyetjen tuaj…', send: 'Dërgo', open: 'Hape', listening: 'Po ju dëgjoj…',
    micUnsupported: 'Shfletuesi nuk e mbështet diktimin me zë.', micDenied: 'Lejoni mikrofonin në shfletues për të folur me asistentin.',
    newChat: 'Bisedë e re', voiceOn: 'Përgjigjet me zë aktive', voiceOff: 'Aktivizo përgjigjet me zë',
    stopVoice: 'Ndalo të folurit', stopMic: 'Ndalo mikrofonin', mic: 'Fol me asistentin', close: 'Mbyll asistentin',
    you: 'Ju', error: 'Nuk u lidhëm me asistentin. Provoni përsëri.',
    voiceMode: 'Bisedë zanore e vazhdueshme', voiceModeOff: 'Çaktivizo bisedën zanore', mute: 'Hesht përgjigjet zanore', unmute: 'Aktivizo zërin',
    statusListening: 'Po ju dëgjoj', statusProcessing: 'Po përpunoj kërkesën', statusSpeaking: 'Dinsoni po flet', statusReady: 'Biseda zanore aktive',
    voicePrivacy: 'Shfletuesi njeh të folurin; vetëm transkriptimi dërgohet te asistenti. Kjo faqe nuk ruan audion.',
    voiceErrors: {
      'recognition-unsupported': 'Ky shfletues nuk e mbështet njohjen e të folurit. Mund të shkruani mesazhin.',
      'speech-unsupported': 'Ky shfletues nuk e mbështet leximin zanor.', 'speech-language-unsupported': 'Nuk u gjet zë shqip në shfletues. Përgjigjja mbetet e lexueshme në tekst.', 'permission-denied': 'Lejoni qasjen te mikrofoni në cilësimet e shfletuesit dhe provoni përsëri.',
      'microphone-unavailable': 'Nuk u gjet mikrofon. Kontrolloni pajisjen dhe lidhjen e tij.', 'language-unsupported': 'Njohja zanore nuk e mbështet këtë gjuhë në shfletuesin tuaj.',
      'empty-transcription': 'Nuk u dëgjua të folur. Provoni përsëri.', 'recognition-network': 'Njohja zanore dështoi për shkak të rrjetit. Kontrolloni lidhjen dhe provoni përsëri.',
      'recognition-failed': 'Mikrofoni nuk mundi të niste. Kontrolloni lejet dhe provoni përsëri.', 'speech-failed': 'Përgjigjja nuk mund të lexohej me zë.'
    },
    suggestions: ['Gjej kafene në Lipjan', 'Hap kategoritë', 'Bizneset në Gadime'],
    routes: {
      admin: ['Paneli i administratorit po hapet. Hyrja dhe lejet e llogarisë mbeten të mbrojtura.', '/admin'],
      addBusiness: ['Po ju dërgoj te formulari për regjistrimin e biznesit.', '/shto-biznes'],
      businesses: ['Po ju dërgoj te bizneset.', '/bizneset'],
      categories: ['Po ju dërgoj te kategoritë.', '/kategorite'],
      settlements: ['Po ju dërgoj te vendbanimet.', '/vendbanimet'],
      home: ['Po ju dërgoj te ballina.', '/'],
    },
  },
  en: {
    title: 'Dinsoni', greeting: 'Hello! I’m Dinsoni. I can search the live directory and take you to the page you need.',
    hint: 'Type or speak about businesses, categories, settlements, or the administrator page.',
    placeholder: 'Type your question…', send: 'Send', open: 'Open', listening: 'Listening…',
    micUnsupported: 'Speech recognition is not supported in this browser.', micDenied: 'Allow microphone access in your browser to speak to the assistant.',
    newChat: 'New chat', voiceOn: 'Voice replies on', voiceOff: 'Turn on voice replies',
    stopVoice: 'Stop speaking', stopMic: 'Stop microphone', mic: 'Speak to the assistant', close: 'Close assistant',
    you: 'You', error: 'Could not reach the assistant. Please try again.',
    voiceMode: 'Continuous voice conversation', voiceModeOff: 'Turn off voice conversation', mute: 'Mute spoken replies', unmute: 'Unmute spoken replies',
    statusListening: 'Listening to you', statusProcessing: 'Processing your request', statusSpeaking: 'Dinsoni is speaking', statusReady: 'Voice conversation is active',
    voicePrivacy: 'Your browser handles speech recognition; only the text transcript is sent to the assistant. This site does not save audio.',
    voiceErrors: {
      'recognition-unsupported': 'Speech recognition is not supported in this browser. You can type your message instead.',
      'speech-unsupported': 'Text-to-speech is not supported in this browser.', 'speech-language-unsupported': 'No voice for this language was found in the browser. The reply is still available as text.', 'permission-denied': 'Allow microphone access in your browser settings, then try again.',
      'microphone-unavailable': 'No microphone was found. Check that one is connected and available.', 'language-unsupported': 'Speech recognition for this language is not available in this browser.',
      'empty-transcription': 'No speech was detected. Please try again.', 'recognition-network': 'Speech recognition failed because of a network issue. Check your connection and retry.',
      'recognition-failed': 'The microphone could not start. Check its permission and try again.', 'speech-failed': 'The reply could not be spoken aloud.'
    },
    suggestions: ['Find cafés in Lipjan', 'Show categories', 'Businesses in Gadime'],
    routes: {
      admin: ['Opening the administrator page. Account sign-in and permissions remain protected.', '/admin'],
      addBusiness: ['Taking you to the business registration form.', '/shto-biznes'],
      businesses: ['Taking you to businesses.', '/bizneset'],
      categories: ['Taking you to categories.', '/kategorite'],
      settlements: ['Taking you to settlements.', '/vendbanimet'],
      home: ['Taking you to the home page.', '/'],
    },
  },
};

function navigationIntent(text) {
  const normalized = text.toLocaleLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = normalized.split(' ');
  const actionWords = ['dergo', 'drego', 'derguar', 'dergoma', 'shko', 'shkoj', 'hap', 'kalo', 'co', 'qo', 'qit', 'send', 'take', 'bring', 'navigate', 'open'];
  const fuzzyAction = words.some((word) => actionWords.some((action) => word === action
    || (action.length >= 5 && (action.startsWith(word) || word.startsWith(action)))
    || (action.length >= 5 && word.length >= 5 && editDistance(word, action) <= (action.length >= 7 ? 2 : 1))));
  const clearDirection = fuzzyAction || /\b(go to|send me|take me|bring me|ma hap|me dergo|me drego|me dergu|me co|me qo|me qit)\b/.test(normalized);
  const openPage = /\b(open|show me)\b/.test(normalized)
    && /\b(page|screen|tab|panel|faqe|faqen|seksion|menu|businesses|categories|settlements|admin)\b/.test(normalized);
  const directAdminRequest = /\b(dashboard|dashbor\w*|admin panel|administrator panel|control panel|paneli admin)\b/.test(normalized);
  const hasDirection = clearDirection || openPage || directAdminRequest;
  const has = (...terms) => terms.some((term) => normalized.includes(term) || words.some((word) => {
    const candidates = term.split(' ');
    return candidates.some((candidate) => word === candidate
      || (candidate.length >= 5 && (candidate.startsWith(word) || word.startsWith(candidate)))
      || (candidate.length >= 5 && word.length >= 5 && editDistance(word, candidate) <= (candidate.length >= 8 ? 2 : 1)));
  }));
  if (directAdminRequest || has('admin', 'administrator', 'administrative', 'administrata', 'dashboard', 'dashbord')) return 'admin';
  if (has('shto biznes', 'regjistro biznes', 'register business', 'add a business', 'add business')) return 'addBusiness';
  if (has('kategori', 'categor', 'katergoru', 'katergori', 'kateguri')) return 'categories';
  if (has('vendban', 'vedban', 'venban', 'fshat', 'settlement', 'village', 'town', 'lokalitet')) return 'settlements';
  if (has('biznes', 'business')) return 'businesses';
  if (has('ballina', 'kryefaqe', 'faqja kryesore', 'home', 'homepage')) return 'home';
  if (!hasDirection) return null;
  return 'lookup';
}

const categoryAliases = [
  { aliases: ['gastronomi', 'gasterenomi', 'gasternoim', 'gastronomy', 'kaffe', 'kafe', 'cafe', 'restaurant', 'restorant'], matches: ['gastronomi', 'kafe'] },
  { aliases: ['supermarket', 'supermarekt', 'supermarkete', 'market', 'dyqan', 'dyqane', 'shop', 'grocery'], matches: ['supermarket', 'dyqane'] },
  { aliases: ['auto', 'automotive', 'mekanik', 'mekanike', 'mechanic', 'car', 'servis'], matches: ['auto', 'mekanik'] },
  { aliases: ['shendetesi', 'shendetsi', 'shendetesia', 'health', 'healthcare', 'farmaci', 'fermaci', 'pharmacy', 'pharmacies', 'barnatore', 'klinike'], matches: ['shendetesi', 'farmaci'] },
  { aliases: ['teknologji', 'teknologjie', 'technology', 'elektronike', 'elektrike', 'electronic', 'electronics', 'kompjuter', 'computer'], matches: ['teknologji', 'elektronik'] },
  { aliases: ['ndertim', 'ndertimi', 'construction', 'mobilieri', 'mobileri', 'mobileria', 'furniture'], matches: ['ndertim', 'mobilieri'] },
  { aliases: ['bukuri', 'beauty', 'fitnes', 'fitness', 'estetike', 'salon'], matches: ['bukuri', 'fitnes'] },
  { aliases: ['sherbime', 'sherbimer', 'sherbimeve', 'profesionale', 'profesonale', 'professional', 'professionale', 'avokat', 'noteri'], matches: ['sherbime', 'profesionale'] },
];

function normalizeWords(value) {
  return value.toLocaleLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function editDistance(left, right) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[right.length];
}

function categoryIntent(text) {
  const words = normalizeWords(text);
  const matches = categoryAliases.map((group) => {
    const positions = [];
    words.forEach((word, index) => {
      if (group.aliases.some((alias) => word === alias || (word.length >= 5 && alias.startsWith(word))
        || editDistance(word, alias) <= (Math.max(word.length, alias.length) >= 10 ? 2 : 1))) positions.push(index);
    });
    return { group, positions };
  }).filter((item) => item.positions.length > 0)
    .sort((left, right) => left.positions[0] - right.positions[0] || right.positions.length - left.positions.length);
  return matches[0]?.group || null;
}

function resolveCategory(categories, intent) {
  if (!intent) return null;
  return categories.find((category) => {
    const name = normalizeWords(category.name).join(' ');
    return intent.matches.some((match) => name.includes(match));
  }) || null;
}

function resolveNamedRecord(records, query) {
  const queryWords = normalizeWords(query).filter((word) => !['me', 'te', 'tek', 'ne', 'dergo', 'derguar', 'shko', 'shkoj', 'hap', 'ma', 'please', 'take', 'send', 'go', 'to', 'the', 'me', 'at', 'in'].includes(word));
  if (!queryWords.length) return null;
  return records.map((record) => {
    const nameWords = normalizeWords(record.name);
    const score = queryWords.filter((word) => nameWords.some((name) => name === word
      || (word.length >= 5 && (name.startsWith(word) || word.startsWith(name)))
      || (word.length >= 5 && name.length >= 5 && editDistance(word, name) <= (name.length >= 9 ? 2 : 1)))).length;
    return { record, score };
  }).filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)[0]?.record || null;
}

function scrollPageToTopAfterNavigation() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  });
}

function requestErrorMessage(error, language, fallback) {
  if (error instanceof TypeError) return language === 'en' ? 'Network error. Check your connection and try again.' : 'Gabim në rrjet. Kontrolloni lidhjen dhe provoni përsëri.';
  if (error?.status >= 500) return language === 'en' ? 'The server could not complete the request. Please try again.' : 'Serveri nuk mundi ta përfundojë kërkesën. Provoni përsëri.';
  return error?.message || fallback;
}

export default function SiteAiAssistant() {
  const { language } = useLanguage();
  const text = copy[language] || copy.sq;
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const restored = JSON.parse(sessionStorage.getItem('katalogu-ai-chat-v1') || '[]');
      return Array.isArray(restored)
        ? restored.filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string').slice(-16)
        : [];
    } catch { return []; }
  });
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const requestLockRef = useRef(false);
  const endRef = useRef(null);
  const voice = useVoiceConversation({ language, onTranscript: (transcript) => sendText(transcript, true), onInterim: setDraft });

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  useEffect(() => {
    const openAssistant = () => setOpen(true);
    window.addEventListener('katalogu:open-ai-assistant', openAssistant);
    return () => window.removeEventListener('katalogu:open-ai-assistant', openAssistant);
  }, []);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, open]);

  useEffect(() => {
    try { sessionStorage.setItem('katalogu-ai-chat-v1', JSON.stringify(messages.slice(-16))); } catch { /* Session storage may be unavailable. */ }
  }, [messages]);

  const sendText = async (value = draft, fromVoice = false) => {
    const content = value.trim();
    if (!content || busy || requestLockRef.current) return;
    if (!fromVoice && voice.listening) voice.stopListening();
    setDraft('');
    setError('');
    const userMessage = { id: crypto.randomUUID(), role: 'user', content };
    setMessages((current) => [...current, userMessage]);
    const destination = navigationIntent(content);

    const matchedCategoryIntent = categoryIntent(content);
    if (matchedCategoryIntent) {
      setBusy(true);
      try {
        const categories = await api.public.getCategories();
        const category = resolveCategory(categories || [], matchedCategoryIntent);
        if (category) {
          const reply = language === 'en'
            ? `Opening ${category.name} businesses for you.`
            : `Po hap bizneset e kategorisë ${category.name} për ju.`;
          setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: reply }]);
          await voice.speak(reply);
          voice.stopVoiceMode();
          setOpen(false);
          window.setTimeout(() => {
            navigate(`/bizneset?kategoria=${encodeURIComponent(category.id)}`);
            scrollPageToTopAfterNavigation();
          }, 350);
        } else if (!destination) {
          setError(language === 'en' ? 'I could not find that category in the directory.' : 'Nuk e gjeta këtë kategori në katalog.');
        }
      } catch (requestError) {
        if (!destination) setError(requestError.message || text.error);
      } finally {
        setBusy(false);
      }
      if (matchedCategoryIntent) {
        if (!fromVoice && voice.voiceMode && !voice.listening) voice.startListening();
        return;
      }
    }

    if (destination) {
      let path = text.routes[destination]?.[1] || '/bizneset';
      let reply = text.routes[destination]?.[0] || (language === 'en' ? 'Taking you to the requested page.' : 'Po ju dërgoj te faqja e kërkuar.');

      if (destination === 'businesses' || destination === 'lookup') {
        setBusy(true);
        try {
          const settlements = await api.public.getSettlements();
          const settlement = resolveNamedRecord(settlements || [], content);
          if (settlement) {
            path = `/bizneset?vendbanimi=${encodeURIComponent(settlement.id)}`;
            reply = language === 'en' ? `Opening businesses in ${settlement.name}.` : `Po hap bizneset në ${settlement.name}.`;
          } else {
            const result = await api.public.getBusinesses({ q: content, page: 1 });
            const business = resolveNamedRecord(result?.data || [], content);
            if (business) {
              path = `/bizneset/${encodeURIComponent(business.slug || business.id)}`;
              reply = language === 'en' ? `Opening ${business.name}.` : `Po hap ${business.name}.`;
            } else if (destination === 'lookup') {
              setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: language === 'en' ? 'I could not identify that page or directory item. Try a page name, business, category, or settlement.' : 'Nuk e identifikova faqen ose elementin. Provoni emrin e faqes, biznesit, kategorisë ose vendbanimit.' }]);
              return;
            }
          }
        } catch {
          // A general directory page still works if name lookup is temporarily unavailable.
        } finally {
          setBusy(false);
        }
      }

      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: reply }]);
      await voice.speak(reply);
      voice.stopVoiceMode();
      setOpen(false);
      window.setTimeout(() => {
        navigate(path);
        scrollPageToTopAfterNavigation();
      }, 450);
      return;
    }

    requestLockRef.current = true;
    setBusy(true);
    try {
      const history = [...messages, userMessage].slice(-15).map(({ role, content: message, thought_signature }) => ({
        role,
        content: message,
        ...(thought_signature ? { thought_signature } : {}),
      }));
      const response = await api.public.directoryAssistantChat(history, language);
      setMessages((current) => [...current, {
        id: crypto.randomUUID(), role: 'assistant', content: response.message,
        thought_signature: response.thought_signature || null,
        businesses: Array.isArray(response.businesses) ? response.businesses : [],
        categories: Array.isArray(response.categories) ? response.categories : [],
        settlements: Array.isArray(response.settlements) ? response.settlements : [],
      }]);
      await voice.speak(response.message);
    } catch (requestError) {
      setError(requestErrorMessage(requestError, language, text.error));
    } finally {
      requestLockRef.current = false;
      setBusy(false);
      if (!fromVoice && voice.voiceMode && !voice.listening) voice.startListening();
    }
  };

  const reset = () => {
    if (busy) return;
    setMessages([]); setDraft(''); setError('');
    try { sessionStorage.removeItem('katalogu-ai-chat-v1'); } catch { /* Session storage may be unavailable. */ }
    voice.stopVoiceMode();
  };

  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) return null;

  return (
    <div className="site-ai" data-theme="inherit">
      {open && <section className="site-ai-panel" aria-label={text.title}>
        <header className="site-ai-header">
          <div className="site-ai-brand"><span><img className="site-ai-logo" src={dinsoniLogo} alt="" /></span><div><strong>{text.title}</strong><small>{language === 'en' ? 'Lipjan Directory' : 'Katalogu i Lipjanit'}</small></div></div>
          <div className="site-ai-header-actions">
            <button type="button" onClick={reset} title={text.newChat} aria-label={text.newChat}><MessageCircle size={16} /></button>
            <button type="button" onClick={() => { setOpen(false); voice.stopVoiceMode(); }} aria-label={text.close}><X size={18} /></button>
          </div>
        </header>
        {(voice.voiceMode || voice.listening || busy || voice.speaking) && <div className={`site-ai-voice-status ${voice.listening ? 'is-listening' : ''} ${busy ? 'is-processing' : ''} ${voice.speaking ? 'is-speaking' : ''}`} role="status" aria-live="polite">
          <span className="site-ai-waveform" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6].map((bar) => <i key={bar} />)}</span>
          <span>{voice.listening ? text.statusListening : voice.speaking ? text.statusSpeaking : busy ? text.statusProcessing : text.statusReady}</span>
          <small>{text.voicePrivacy}</small>
        </div>}
        <div className="site-ai-thread" aria-live="polite">
          {messages.length === 0 && <div className="site-ai-welcome">
            <span className="site-ai-welcome-icon"><img className="site-ai-logo" src={dinsoniLogo} alt="" /></span>
            <span className="site-ai-welcome-label"><Sparkles size={13} /> {language === 'en' ? 'YOUR LIPJAN ASSISTANT' : 'ASISTENTI JUAJ NË LIPJAN'}</span>
            <strong>{text.greeting}</strong>
            <p>{text.hint}</p>
            <div className="site-ai-suggestions">
              {text.suggestions.map((suggestion) => (
                <button type="button" key={suggestion} onClick={() => sendText(suggestion)} disabled={busy}>
                  {suggestion}<span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>}
          {messages.map((message) => <article className={`site-ai-message ${message.role}`} key={message.id}>
            {message.role === 'assistant' && <span className="site-ai-avatar"><img className="site-ai-logo" src={dinsoniLogo} alt="" /></span>}
            <div className="site-ai-bubble"><small>{message.role === 'assistant' ? text.title : text.you}</small><p>{message.content}</p>
              {message.businesses?.map((business) => <Link className="site-ai-result" key={business.id} to={`/bizneset/${business.slug || business.id}`} onClick={() => { setOpen(false); scrollPageToTopAfterNavigation(); }}>
                <Building2 size={15} /><span><strong>{business.name}</strong><small><MapPin size={11} /> {[business.settlement, business.category].filter(Boolean).join(' · ')}</small></span><b>{text.open} ↗</b>
              </Link>)}
              {message.categories?.map((category) => <Link className="site-ai-result" key={category.id} to={`/bizneset?kategoria=${encodeURIComponent(category.id)}`} onClick={() => { setOpen(false); scrollPageToTopAfterNavigation(); }}>
                <Layers size={15} /><span><strong>{category.name}</strong><small>{category.business_count} {language === 'en' ? 'published businesses' : 'biznese të publikuara'}</small></span><b>{text.open} ↗</b>
              </Link>)}
              {message.settlements?.map((settlement) => <Link className="site-ai-result" key={settlement.id} to={`/bizneset?vendbanimi=${encodeURIComponent(settlement.id)}`} onClick={() => { setOpen(false); scrollPageToTopAfterNavigation(); }}>
                <MapPin size={15} /><span><strong>{settlement.name}</strong><small>{settlement.business_count} {language === 'en' ? 'published businesses' : 'biznese të publikuara'}</small></span><b>{text.open} ↗</b>
              </Link>)}
            </div>
          </article>)}
          {busy && <div className="site-ai-thinking" role="status"><span /><span /><span /> {language === 'en' ? 'Thinking…' : 'Po mendoj…'}</div>}
          <div ref={endRef} />
        </div>
        {(error || voice.voiceError) && <div className="site-ai-error" role="alert">{error || text.voiceErrors[voice.voiceError] || text.error}<button type="button" onClick={() => { setError(''); voice.clearVoiceError?.(); }}>×</button></div>}
        <form className="site-ai-composer" onSubmit={(event) => { event.preventDefault(); sendText(); }}>
          <label className="site-ai-composer-label" htmlFor="site-ai-message-input">
            {language === 'en' ? 'Your message' : 'Mesazhi juaj'}
            <span>{language === 'en' ? 'Enter to send' : 'Enter për dërgim'}</span>
          </label>
          <textarea
            id="site-ai-message-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                sendText();
              }
            }}
            placeholder={voice.listening ? text.listening : text.placeholder}
            rows={2}
            maxLength={4000}
            disabled={busy}
            aria-label={text.placeholder}
          />
          <div className="site-ai-tools">
            <div>
              <button type="button" className={voice.listening ? 'active is-recording' : ''} disabled={busy} onClick={voice.listening ? voice.stopVoiceMode : voice.startListening} aria-label={voice.listening ? text.stopMic : text.mic} title={voice.listening ? text.stopMic : text.mic}>
                {voice.listening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
              <button type="button" className={voice.voiceMode ? 'active' : ''} onClick={() => voice.voiceMode ? voice.stopVoiceMode() : !busy && voice.startListening()} aria-pressed={voice.voiceMode} aria-label={voice.voiceMode ? text.voiceModeOff : text.voiceMode} title={voice.voiceMode ? text.voiceModeOff : text.voiceMode}>
                <AudioLines size={17} />
              </button>
              <button type="button" className={voice.muted ? '' : 'active'} onClick={voice.toggleMute} aria-pressed={voice.muted} aria-label={voice.muted ? text.unmute : text.mute} title={voice.muted ? text.unmute : text.mute}>
                {voice.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              {voice.speaking && <button type="button" onClick={voice.stopSpeaking} aria-label={text.stopVoice} title={text.stopVoice}><Square size={15} fill="currentColor" /></button>}
            </div>
            <button className="site-ai-send" type="submit" disabled={busy || !draft.trim()}><Send size={15} />{text.send}</button>
          </div>
        </form>
      </section>}
      <button type="button" className={`site-ai-launcher ${open ? 'open' : ''}`} onClick={() => setOpen((value) => !value)} aria-label={open ? text.close : text.title} aria-expanded={open}>
        {open ? <X size={23} /> : <><Sparkles size={18} /><span>AI {text.title}</span></>}
      </button>
    </div>
  );
}
