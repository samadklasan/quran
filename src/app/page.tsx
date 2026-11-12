"use client";

import { useEffect, useMemo, useState } from "react";
import { QURANIC_DUAS, type DuaReference } from "@/lib/duas";
import { SURAHS, type Surah } from "@/lib/surahs";

type ArabicPayload = { data: Record<string, string> };
type Translation = { text: string; footnotes?: string[] };
type TranslationPayload = Record<string, Translation>;
type QuranRange = { s: number; a1: number; a2: number };
type QuranIndex = Record<string, QuranRange[]>;

type Verse = {
  key: string;
  number: number;
  arabic: string;
  english: string;
  romanUrdu: string;
  urduDr: string;
};

type DuaItem = DuaReference & { surahInfo: Surah; startVerse: number; arabic: string; english: string; romanUrdu: string; urduDr: string };

const MADNI_SURAHS = new Set([2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 110]);
function findIndexValue(index: QuranIndex | null, surah: number, ayah: number, fallback: number) {
  if (!index) return fallback;
  const match = Object.entries(index).find(([, ranges]) => ranges.some((range) => range.s === surah && ayah >= range.a1 && ayah <= range.a2));
  return match ? Number(match[0]) : fallback;
}

function getPageBoundary(index: QuranIndex | null, page: number) {
  const ranges = index?.[String(page)];
  if (!ranges?.length) return null;
  const range = ranges[0];
  return { surah: range.s, ayah: range.a1 };
}

function getSurah(surahNumber: number): Surah {
  return SURAHS[surahNumber - 1] ?? SURAHS[0];
}

function cleanTranslation(text: string) {
  return text.replace(/<sup[^>]*>(.*?)<\/sup>/gi, "[$1]");
}

function buildVerses(
  arabic: Record<string, string>,
  english: TranslationPayload,
  romanUrdu: TranslationPayload,
  urduDr: TranslationPayload,
  surahNumber: number,
) {
  return Object.keys(arabic)
    .filter((key) => key.startsWith(`${surahNumber}:`))
    .sort((a, b) => Number(a.split(":")[1]) - Number(b.split(":")[1]))
    .map((key): Verse => ({
      key,
      number: Number(key.split(":")[1]),
      arabic: arabic[key],
      english: cleanTranslation(english[key]?.text ?? "English translation unavailable."),
      romanUrdu: romanUrdu[key]?.text ?? "Roman Urdu translation unavailable.",
      urduDr: urduDr[key]?.text ?? "Urdu translation unavailable.",
    }));
}

function RevelationIcon({ madni }: { madni: boolean }) {
  return madni ? <svg className="revelation-icon madni-icon" viewBox="-5 -10 110 110" fill="currentColor" aria-hidden="true"><path d="m80.699 69.102c0-14.699-22.898-30.699-29.199-34.699v-5.6992-0.10156c3.6016-0.39844 6.5-2.8008 7.8008-6-1.1016 0.39844-2.3008 0.69922-3.6016 0.69922-5.3008 0-9.6992-4.3984-9.6992-9.6992 0-1.3008 0.19922-2.5 0.69922-3.6016-3.6016 1.3984-6.1016 4.8984-6.1016 9 0 4.6992 3.3984 8.6016 7.8984 9.5v0.19922 5.6992c-6.1992 4.1016-29.199 20.102-29.199 34.699 0 3.8008 0.69922 7.5 2 10.898h-8.6016v10.004h74.602v-10.102h-8.6016c1.3008-3.2969 2-7 2-10.797z" /></svg> : <svg className="revelation-icon makki-icon" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="M4.53 81.42l45 15s0 0 0 0c.15.05.31.08.47.08s.32-.03.47-.08c0 0 0 0 0 0l45-15c.61-.2 1.03-.78 1.03-1.42V20c0-.14-.03-.28-.07-.42-.01-.04-.03-.08-.04-.12-.04-.09-.08-.18-.14-.27-.02-.04-.04-.07-.07-.11-.07-.1-.16-.18-.25-.26-.02-.01-.03-.03-.04-.04 0 0 0 0 0 0-.11-.08-.24-.14-.37-.19-.01 0-.02-.01-.03-.02L50.47 3.58c-.31-.1-.64-.1-.95 0L4.53 18.58s-.02.01-.03.02c-.13.05-.25.11-.37.19 0 0 0 0 0 0-.02.01-.03.03-.04.04-.1.08-.18.16-.25.26-.03.03-.05.07-.07.11-.06.09-.1.17-.14.27-.02.04-.03.08-.04.12-.04.14-.07.28-.07.42v60c0 .65.41 1.22 1.03 1.42Zm35.96 8.82L29 86.4V61.23l11.49 3.84v25.17Zm8.01-40.41v4.34l-42-14v-4.34l42 14Zm45-9.66-42 14v-4.34l42-14v4.34Zm-43.5-6.75L9.74 20 50 6.58 90.26 20 50 33.42Z" /></svg>;
}

function HomeIcon() {
  return <svg className="home-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 24H5c-2.757 0-5-2.243-5-5V9.724c0-1.665.824-3.215 2.204-4.145L9.203.855c1.699-1.146 3.895-1.146 5.594 0l7 4.724c1.379.93 2.203 2.479 2.203 4.145v9.276c0 2.757-2.243 5-5 5Z" /></svg>;
}

function SettingsIcon() {
  return <svg className="settings-svg" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="M34.283 384c17.646 30.626 56.779 41.148 87.405 23.502l9.555-5.519c17.92 15.332 38.518 27.222 60.757 35.072V448c0 35.346 28.654 64 64 64s64-28.654 64-64v-10.944c22.242-7.863 42.841-19.767 60.757-35.115l9.536 5.504c30.633 17.673 69.794 7.167 87.467-23.467 17.673-30.633 7.167-69.794-23.467-87.467l-9.472-5.461c4.264-23.201 4.264-46.985 0-70.187l9.472-5.461c30.633-17.673 41.14-56.833 23.467-87.467-17.673-30.633-56.833-41.14-87.467-23.467l-9.493 5.483C362.862 94.638 342.25 82.77 320 74.944V64c0-35.346-28.654-64-64-64s-64 28.654-64 64v10.944c-22.242 7.863-42.841 19.767-60.757 35.115l-9.536-5.525C91.073 86.86 51.913 97.367 34.24 128s-7.167 69.794 23.467 87.467l9.472 5.461c-4.264 23.201-4.264 46.985 0 70.187l-9.472 5.461C27.158 314.296 16.686 353.38 34.283 384ZM256 170.667c47.128 0 85.333 38.205 85.333 85.333S303.128 341.333 256 341.333 170.667 303.128 170.667 256 208.872 170.667 256 170.667Z" /></svg>;
}

function ChevronDownIcon({ up = false }: { up?: boolean }) {
  return <svg className="chevron-down" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={up ? "m5 16 7-7 7 7" : "m5 8 7 7 7-7"} /></svg>;
}

function DuasIcon() {
  return <svg className="duas-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m22 21c0 1.657-1.343 3-3 3H7c-2.761 0-5-2.239-5-5v-1h17c1.657 0 3 1.343 3 3ZM22 4.973v12.052c-.699-.527-1.525-.86-2.395-.964-.199-.041-.402-.061-.605-.061H2V5C2 2.239 4.239 0 7 0h10.033C19.777 0 22.001 2.229 22 4.973Zm-9.614 7.297c-1.342-.831-2.386-2.269-2.386-4.269s1.044-3.438 2.386-4.269c.307-.19.183-.665-.177-.704-.293-.032-.594-.036-.903-.007-2.487.237-4.445 2.486-4.306 4.98-.139 2.494 1.82 4.743 4.306 4.98.309.029.61.026.903-.007.359-.04.484-.514.177-.704Zm4.64-5.022c0-.137-.111-.248-.248-.248h-1.596l-.449-1.718c-.031-.118-.137-.2-.259-.2s-.228.082-.259.2l-.45 1.718h-1.607c-.137 0-.248.111-.248.248 0 .09.049.173.127.216l1.289.717-.499 1.56c-.034.106.003.221.092.288.094.071.224.07.317-.002l1.238-.957 1.237.956c.091.07.218.074.312.008.095-.067.136-.188.099-.299l-.504-1.531 1.283-.742c.077-.044.124-.126.124-.214Z" /></svg>;
}

function ChevronRightIcon() {
  return <svg className="chevron-right-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>;
}

function SearchIcon() {
  return <svg className="search-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
}

function BackArrowIcon() {
  return <svg className="back-arrow-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" /></svg>;
}

function ControlArrowIcon({ direction }: { direction: "left" | "right" }) {
  return <svg className={`control-arrow ${direction === "right" ? "control-arrow-right" : ""}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d={direction === "left" ? "M13.729 5.575c1.304-1.074 3.27-.146 3.27 1.544v9.762c0 1.69-1.966 2.618-3.27 1.544l-5.927-4.881a2 2 0 0 1 0-3.088l5.927-4.88Z" : "M10.271 5.575C8.967 4.501 7 5.43 7 7.12v9.762c0 1.69 1.967 2.618 3.271 1.544l5.927-4.881a2 2 0 0 0 0-3.088l-5.927-4.88Z"} clipRule="evenodd" /></svg>;
}

export default function Home() {
  const [arabic, setArabic] = useState<Record<string, string> | null>(null);
  const [english, setEnglish] = useState<TranslationPayload | null>(null);
  const [romanUrdu, setRomanUrdu] = useState<TranslationPayload | null>(null);
  const [urduDr, setUrduDr] = useState<TranslationPayload | null>(null);
  const [pageIndex, setPageIndex] = useState<QuranIndex | null>(null);
  const [juzIndex, setJuzIndex] = useState<QuranIndex | null>(null);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [activeVerse, setActiveVerse] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSurahPickerOpen, setIsSurahPickerOpen] = useState(false);
  const [isMenuSurahsOpen, setIsMenuSurahsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showRomanUrdu, setShowRomanUrdu] = useState(true);
  const [showEnglishSource, setShowEnglishSource] = useState(true);
  const [showRomanUrduSource, setShowRomanUrduSource] = useState(true);
  const [showUrduDr, setShowUrduDr] = useState(true);
  const [showUrduDrSource, setShowUrduDrSource] = useState(true);
  const [fontScale, setFontScale] = useState(1);
  const [isDuasMode, setIsDuasMode] = useState(false);
  const [duaSearch, setDuaSearch] = useState("");
  const [toast, setToast] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollHeaderVisible, setIsScrollHeaderVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/data/quran_arabic.json").then((response) => response.json() as Promise<ArabicPayload>),
      fetch("/data/quran_english.json").then((response) => response.json() as Promise<TranslationPayload>),
      fetch("/data/quran_roman_urdu.json").then((response) => response.json() as Promise<TranslationPayload>),
      fetch("/data/quran_urdu_dr_israr_ahmed.json").then((response) => response.json() as Promise<TranslationPayload>),
      fetch("/data/quran_index_pages.json").then((response) => response.json() as Promise<QuranIndex>),
      fetch("/data/quran_index_juz.json").then((response) => response.json() as Promise<QuranIndex>),
    ]).then(([arabicPayload, englishPayload, romanUrduPayload, urduDrPayload, pages, juz]) => {
      setArabic(arabicPayload.data);
      setEnglish(englishPayload);
      setRomanUrdu(romanUrduPayload);
      setUrduDr(urduDrPayload);
      setPageIndex(pages);
      setJuzIndex(juz);
    });
  }, []);

  useEffect(() => {
    let previousScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 96);
      setIsScrollHeaderVisible(currentScrollY > 70 && currentScrollY < previousScrollY);
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollableHeight > 0 ? Math.min(100, Math.max(0, (currentScrollY / scrollableHeight) * 100)) : 0);
      previousScrollY = currentScrollY;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const verses = useMemo(() => {
    if (!arabic || !english || !romanUrdu || !urduDr) return [];
    return buildVerses(arabic, english, romanUrdu, urduDr, selectedSurah);
  }, [arabic, english, romanUrdu, urduDr, selectedSurah]);

  const duas = useMemo<DuaItem[]>(() => {
    if (!arabic || !english || !romanUrdu || !urduDr) return [];
    return QURANIC_DUAS.map((reference) => {
      const [startText, endText] = reference.ayah.split("-");
      const startVerse = Number(startText);
      const endVerse = Number(endText ?? startText);
      const keys = Array.from({ length: endVerse - startVerse + 1 }, (_, index) => `${reference.surah}:${startVerse + index}`);
      return {
        ...reference,
        surahInfo: getSurah(reference.surah),
        startVerse,
        arabic: keys.map((key) => arabic[key]).filter(Boolean).join(" "),
        english: keys.map((key) => cleanTranslation(english[key]?.text ?? "")).filter(Boolean).join(" "),
        romanUrdu: keys.map((key) => romanUrdu[key]?.text ?? "").filter(Boolean).join(" "),
        urduDr: keys.map((key) => urduDr[key]?.text ?? "").filter(Boolean).join(" "),
      };
    });
  }, [arabic, english, romanUrdu, urduDr]);

  const currentSurah = getSurah(selectedSurah);
  const currentVerse = verses.find((verse) => verse.number === activeVerse) ?? verses[0];
  const isLoaded = Boolean(arabic && english && romanUrdu && urduDr);
  const currentPage = findIndexValue(pageIndex, selectedSurah, activeVerse, 1);
  const currentJuz = findIndexValue(juzIndex, selectedSurah, activeVerse, 1);
  const pageNumbers = useMemo(() => pageIndex ? Object.keys(pageIndex).map(Number).sort((a, b) => a - b) : [], [pageIndex]);
  const firstPage = pageNumbers[0] ?? 1;
  const lastPage = pageNumbers[pageNumbers.length - 1] ?? 1;
  const canGoPreviousPage = Boolean(pageIndex && currentPage > firstPage && !isDuasMode);
  const canGoNextPage = Boolean(pageIndex && currentPage < lastPage && !isDuasMode);

  const filteredSurahs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return SURAHS.filter((surah) => `${surah.number} ${surah.name} ${surah.arabicName}`.toLowerCase().includes(query));
  }, [searchTerm]);

  const filteredDuas = useMemo(() => {
    const query = duaSearch.trim().toLowerCase();
    return duas.filter((dua) => `${dua.id} ${dua.surahInfo.name} ${dua.surahInfo.arabicName} ${dua.ayah}`.toLowerCase().includes(query));
  }, [duaSearch, duas]);

  function announce(message: string) {
    setToast(message);
  }

  function selectSurah(number: number) {
    setSelectedSurah(number);
    setActiveVerse(1);
    setIsMenuOpen(false);
    setIsSurahPickerOpen(false);
    setIsMenuSurahsOpen(false);
    setIsDuasMode(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDua(dua: DuaItem) {
    setSelectedSurah(dua.surah);
    setActiveVerse(dua.startVerse);
    setIsDuasMode(false);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    announce(`Opened Dua ${dua.id}`);
  }

  function changePage(direction: -1 | 1) {
    if (isDuasMode || !pageIndex) return;
    const targetPage = currentPage + direction;
    const boundary = getPageBoundary(pageIndex, targetPage);
    if (!boundary) return;
    setSelectedSurah(boundary.surah);
    setActiveVerse(boundary.ayah);
    setIsMenuOpen(false);
    setIsSurahPickerOpen(false);
    setIsMenuSurahsOpen(false);
    window.setTimeout(() => {
      document.getElementById(`verse-${boundary.surah}:${boundary.ayah}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function closePopovers() {
    setIsSettingsOpen(false);
    setIsSurahPickerOpen(false);
  }

  return (
    <main className="quran-app" onClick={closePopovers}>
      <div className={`sticky-reading-bar ${isScrolled && !isScrollHeaderVisible ? "is-visible" : ""}`} aria-hidden={!isScrolled || isScrollHeaderVisible}>
        <div className="sticky-reading-inner"><span className="sticky-surah-label">{isDuasMode ? <DuasIcon /> : null}<span className="sticky-surah-mark">▣</span>{isDuasMode ? "Quranic Duas" : `${currentSurah.name}${currentSurah.number === 1 ? " (The Opening)" : ` (${currentSurah.arabicName})`}`}</span><span>{isDuasMode ? "75" : <>Page {currentPage} <b>•</b> Juz {currentJuz}</>}</span></div>
        <div className="sticky-reading-progress"><span style={{ width: `${scrollProgress}%` }} /></div>
      </div>
      <div className={`scroll-menu-header ${isScrollHeaderVisible ? "is-visible" : ""}`} aria-hidden={!isScrollHeaderVisible} onClick={(event) => event.stopPropagation()}><div className="scroll-menu-inner"><button className="scroll-home-button" onClick={() => selectSurah(1)}><HomeIcon /><span>Home</span></button><button className="scroll-title-button" disabled={isDuasMode} onClick={() => setIsSurahPickerOpen((value) => !value)}>{isDuasMode ? <><DuasIcon />Quranic Duas</> : `${currentSurah.name}${currentSurah.number === 1 ? " (The Opening)" : ` (${currentSurah.arabicName})`}`} {!isDuasMode && <ChevronDownIcon up={isSurahPickerOpen} />}</button><button className="scroll-menu-button" onClick={() => setIsMenuOpen((value) => !value)}>Menu <span className="grid-icon"><i /><i /><i /><i /></span></button></div><div className="scroll-menu-meta">{isDuasMode ? <><span>Quranic Duas</span><span>75</span></> : <><span className="revelation-label"><RevelationIcon madni={MADNI_SURAHS.has(selectedSurah)} />{MADNI_SURAHS.has(selectedSurah) ? "Madni" : "Makki"}</span><span>Page {currentPage} <b>•</b> Juz {currentJuz}</span></>}</div><div className="scroll-menu-progress"><span style={{ width: `${scrollProgress}%` }} /></div></div>
      <header className="reader-header" onClick={(event) => event.stopPropagation()}>
        <button className="home-button" onClick={() => selectSurah(1)}><HomeIcon /><span>Home</span></button>
        <div className="surah-picker-wrap">
          <button className="current-surah-button" disabled={isDuasMode} onClick={() => setIsSurahPickerOpen((value) => !value)} aria-expanded={isSurahPickerOpen}>
            {isDuasMode && <DuasIcon />}<span>{isDuasMode ? "Quranic Duas" : <>{currentSurah.name} <em>({currentSurah.number === 1 ? "The Opening" : currentSurah.arabicName})</em></>}</span>{!isDuasMode && <ChevronDownIcon up={isSurahPickerOpen} />}
          </button>
          {isSurahPickerOpen && (
            <div className={`surah-picker ${isScrollHeaderVisible ? "from-scroll" : ""}`} onClick={(event) => event.stopPropagation()}>
              <label className="picker-search"><SearchIcon /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search surahs" /></label>
              <div className="picker-list">{filteredSurahs.map((surah) => <button key={surah.number} className={selectedSurah === surah.number ? "selected" : ""} onClick={() => selectSurah(surah.number)}><span>{String(surah.number).padStart(3, "0")}</span><strong>{surah.name}</strong><small dir="rtl">{surah.arabicName}</small></button>)}</div>
            </div>
          )}
        </div>
        <button className="menu-button" onClick={() => setIsMenuOpen((value) => !value)}><span>Menu</span><span className="grid-icon"><i /><i /><i /><i /></span></button>
      </header>

      <div className="reader-subheader">
        {isDuasMode ? <><span>Quranic Duas</span><span>75</span></> : <><span className="revelation-label"><RevelationIcon madni={MADNI_SURAHS.has(selectedSurah)} />{MADNI_SURAHS.has(selectedSurah) ? "Madni" : "Makki"}</span><span>Page {currentPage} <b>•</b> Juz {currentJuz}</span></>}
      </div>
      <div className="reading-progress"><span style={{ width: `${scrollProgress}%` }} /></div>

      <section className="reading-stage" style={{ "--font-scale": fontScale } as React.CSSProperties}>
        {!isLoaded ? <div className="loading-state"><span className="loader" /> Preparing the Quran…</div> : isDuasMode ? (
          <section className="duas-reading-mode"><div className="duas-reading-heading"><div><span className="eyebrow">Supplications from the Quran</span><h2>Quranic Duas</h2><p>Read duas from the Quran with their Arabic text, English meaning, and Roman Urdu.</p></div><span className="duas-count">{filteredDuas.length} of {QURANIC_DUAS.length}</span></div><label className="duas-search"><SearchIcon /><input value={duaSearch} onChange={(event) => setDuaSearch(event.target.value)} placeholder="Search by surah or ayah" /></label><div className="duas-list">{filteredDuas.map((dua) => <article className="dua-card" key={dua.id}><div className="dua-card-heading"><span className="dua-number">Dua {String(dua.id).padStart(2, "0")}</span><span>Surah {dua.surah} · Ayah {dua.ayah}</span></div><div className="dua-surah-name"><strong>{dua.surahInfo.name}</strong><span dir="rtl">{dua.surahInfo.arabicName}</span></div><p className="dua-arabic" dir="rtl">{dua.arabic || "Arabic text unavailable."}</p>{showEnglish && <div className="dua-translation"><p>{dua.english || "English translation unavailable."}</p>{showEnglishSource && <small>— The Clear Quran (Mustafa Khattab)</small>}</div>}{showRomanUrdu && <div className="dua-translation dua-urdu"><p>{dua.romanUrdu || "Roman Urdu translation unavailable."}</p>{showRomanUrduSource && <small>— Abul A&apos;la Maududi (Roman Urdu)</small>}</div>}{showUrduDr && <div className="dua-translation dua-urdu-dr" dir="rtl"><p>{dua.urduDr || "Urdu translation unavailable."}</p>{showUrduDrSource && <small>— بیان القرآن (ڈاکٹر اسرار احمد)</small>}</div>}<button className="open-dua-button" onClick={() => openDua(dua)}>Open in reader <ControlArrowIcon direction="right" /></button></article>)}{filteredDuas.length === 0 && <p className="no-duas">No Quranic Duas found.</p>}</div></section>
        ) : (
          <>
            <div className="verse-stream" style={{ "--font-scale": fontScale } as React.CSSProperties}>
              {verses.map((verse) => {
                const isActive = currentVerse?.key === verse.key;
                return (
                  <article id={`verse-${verse.key}`} className={`reading-verse ${isActive ? "is-active" : ""}`} key={verse.key} onClick={() => setActiveVerse(verse.number)}>
                    <div className="verse-toolbar">
                      <button className="ayah-number" data-tooltip={`Ayah ${selectedSurah}:${verse.number}`} onClick={(event) => { event.stopPropagation(); setActiveVerse(verse.number); }}>{selectedSurah}:{verse.number}</button>
                    </div>
                    <div className="verse-main">
                      <p className="arabic-verse" dir="rtl">{verse.arabic}</p>
                      {showUrduDr && <div className="translation-line urdu-dr-line" dir="rtl"><p>{verse.urduDr}</p>{showUrduDrSource && <span>— بیان القرآن (ڈاکٹر اسرار احمد)</span>}</div>}
                      <div className="translation-lines">
                        {showEnglish && <div className="translation-line english-line"><p>{verse.english}</p>{showEnglishSource && <span>— The Clear Quran (Mustafa Khattab)</span>}</div>}
                        {showRomanUrdu && <div className="translation-line urdu-line"><p>{verse.romanUrdu}</p>{showRomanUrduSource && <span>— Abul A&apos;la Maududi (Roman Urdu)</span>}</div>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <div className="reader-controls" onClick={(event) => event.stopPropagation()}>
        <button disabled={!canGoNextPage} onClick={() => changePage(1)} aria-label="Next page"><ControlArrowIcon direction="left" /></button>
        <div className="settings-wrap">
          <button className={`settings-button ${isSettingsOpen ? "selected" : ""}`} onClick={() => setIsSettingsOpen((value) => !value)} aria-label="Open reading settings"><SettingsIcon /></button>
          {isSettingsOpen && <div className="settings-popover" onClick={(event) => event.stopPropagation()}><div className="popover-heading"><strong>Reading settings</strong><button onClick={() => setIsSettingsOpen(false)}>×</button></div><label>Text size <input type="range" min=".75" max="1.75" step=".05" value={fontScale} onChange={(event) => setFontScale(Number(event.target.value))} /></label><label className="toggle-row">English translation <input type="checkbox" checked={showEnglish} onChange={(event) => setShowEnglish(event.target.checked)} /></label><label className="toggle-row">English translator name <input type="checkbox" checked={showEnglishSource} onChange={(event) => setShowEnglishSource(event.target.checked)} /></label><label className="toggle-row">Roman Urdu translation <input type="checkbox" checked={showRomanUrdu} onChange={(event) => setShowRomanUrdu(event.target.checked)} /></label><label className="toggle-row">Roman Urdu translator name <input type="checkbox" checked={showRomanUrduSource} onChange={(event) => setShowRomanUrduSource(event.target.checked)} /></label><label className="toggle-row">Urdu translation <input type="checkbox" checked={showUrduDr} onChange={(event) => setShowUrduDr(event.target.checked)} /></label><label className="toggle-row">Urdu translator name <input type="checkbox" checked={showUrduDrSource} onChange={(event) => setShowUrduDrSource(event.target.checked)} /></label></div>}
        </div>
        <button disabled={!canGoPreviousPage} onClick={() => changePage(-1)} aria-label="Previous page"><ControlArrowIcon direction="right" /></button>
      </div>

      {isMenuOpen && <aside className="menu-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><h2>{isMenuSurahsOpen ? "All Surahs" : "Menu"}</h2></div><button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">×</button></div>{isMenuSurahsOpen ? <div className="drawer-surah-browser"><button className="drawer-back-button" onClick={() => setIsMenuSurahsOpen(false)}><BackArrowIcon /><span>Back to menu</span></button><label className="picker-search drawer-search"><SearchIcon /><input autoFocus value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search surahs" /></label><div className="picker-list drawer-surah-list">{filteredSurahs.map((surah) => <button key={surah.number} className={selectedSurah === surah.number ? "selected" : ""} onClick={() => selectSurah(surah.number)}><span>{String(surah.number).padStart(3, "0")}</span><strong>{surah.name}</strong><small dir="rtl">{surah.arabicName}</small></button>)}</div></div> : <><button onClick={() => setIsMenuSurahsOpen(true)}><span className="grid-icon drawer-grid-icon"><i /><i /><i /><i /></span><span>Browse All Surahs</span><ChevronRightIcon /></button><button onClick={() => { setIsDuasMode(true); setIsMenuOpen(false); setIsMenuSurahsOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}><DuasIcon /><span>Quranic Duas</span><b>{QURANIC_DUAS.length}</b></button><div className="drawer-note">Search the Quran, open Quranic Duas, and adjust the normal reading view from Settings.</div></>}</aside>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
