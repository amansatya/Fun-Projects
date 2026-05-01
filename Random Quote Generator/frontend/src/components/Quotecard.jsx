import {useState} from "react";

// Icon components
const IconVolume = ({active}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        {active ? (<>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
            </>) : (<>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </>)}
    </svg>);

const IconCopy = ({copied}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {copied ? (<polyline points="20 6 9 17 4 12"/>) : (<>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </>)}
    </svg>);

const IconTwitter = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>);

const synth = window.speechSynthesis;

export default function QuoteCard({quote, loading, error, animKey, onNewQuote}) {
    const [copied, setCopied] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    const handleCopy = () => {
        if (!quote?.content) return;
        navigator.clipboard.writeText(`"${quote.content}" — ${quote.author}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSpeak = () => {
        if (speaking) {
            synth.cancel();
            setSpeaking(false);
            return;
        }
        if (!quote?.content) return;
        const utterance = new SpeechSynthesisUtterance(`${quote.content}, by ${quote.author}`);
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        synth.speak(utterance);
    };

    const handleTwitter = () => {
        const tweetText = encodeURIComponent(`"${quote.content}" — ${quote.author}`);
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
    };

    return (<div
            className="w-full max-w-150 md:max-w-195 rounded-2xl p-7 md:p-14 relative"
            style={{
                background: "#fff",
                boxShadow: "0 20px 60px rgba(26,26,46,0.08), 0 4px 16px rgba(26,26,46,0.04)",
                border: "1px solid var(--color-border)",
            }}
        >
            {/* Top decorative line */}
            <div
                className="absolute top-0 left-8 right-8 h-0.75 rounded-b-full"
                style={{background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-dark))"}}
            />

            {/* Quote content */}
            <div key={animKey} className="quote-animate">
                {/* Big decorative open-quote */}
                <div
                    className="text-[72px] md:text-[110px] leading-none mb-1 md:mb-2 select-none"
                    style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-accent)",
                        opacity: 0.3,
                        lineHeight: "0.8",
                    }}
                >
                    &ldquo;
                </div>

                {error ? (<p className="text-center py-4 text-red-400 text-sm">{error}</p>) : (<p
                        className="text-xl md:text-3xl leading-relaxed md:leading-loose mb-6 md:mb-8"
                        style={{
                            fontFamily: "var(--font-display)",
                            fontStyle: "italic",
                            color: "var(--color-ink)",
                            minHeight: "80px",
                        }}
                    >
                        {loading ? (
                            <span className="inline-flex gap-1 items-center" style={{color: "var(--color-muted)"}}>
                <span className="animate-pulse">Fetching wisdom</span>
                <span className="animate-bounce delay-75">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="animate-bounce delay-300">.</span>
              </span>) : (quote?.content)}
                    </p>)}

                {/* Author */}
                {!loading && !error && (<div className="flex items-center gap-3 mb-8 md:mb-10">
                        <div className="h-px flex-1" style={{background: "var(--color-border)"}}/>
                        <p
                            className="text-sm md:text-base font-medium tracking-widest uppercase"
                            style={{color: "var(--color-accent)", fontFamily: "var(--font-body)"}}
                        >
                            {quote?.author}
                        </p>
                        <div className="h-px w-6" style={{background: "var(--color-border)"}}/>
                    </div>)}
            </div>

            {/* Divider */}
            <div className="h-px mb-6" style={{background: "var(--color-border)"}}/>

            {/* Action row */}
            <div className="flex items-center justify-between gap-4">
                {/* Icon buttons */}
                <div className="flex items-center gap-2 md:gap-3">
                    <ActionButton
                        onClick={handleSpeak}
                        active={speaking}
                        title={speaking ? "Stop speaking" : "Read aloud"}
                        large
                    >
                        <IconVolume active={speaking}/>
                    </ActionButton>
                    <ActionButton onClick={handleCopy} active={copied} title={copied ? "Copied!" : "Copy quote"} large>
                        <IconCopy copied={copied}/>
                    </ActionButton>
                    <ActionButton onClick={handleTwitter} title="Share on X / Twitter" large>
                        <IconTwitter/>
                    </ActionButton>
                </div>

                {/* New Quote button */}
                <button
                    onClick={onNewQuote}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 md:px-7 md:py-3.5 rounded-full text-sm md:text-base font-medium transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                        background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
                        color: "#fff",
                        fontFamily: "var(--font-body)",
                        boxShadow: "0 4px 14px rgba(200, 150, 90, 0.35)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(200, 150, 90, 0.45)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(200, 150, 90, 0.35)";
                    }}
                >
                    {loading ? (<>
                            <span className="spinner"/>
                            <span>Loading...</span>
                        </>) : (<>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                 strokeLinejoin="round">
                                <polyline points="1 4 1 10 7 10"/>
                                <path d="M3.51 15a9 9 0 1 0 .49-3"/>
                            </svg>
                            New Quote
                        </>)}
                </button>
            </div>
        </div>);
}

function ActionButton({children, onClick, active, title, large}) {
    return (<button
            onClick={onClick}
            title={title}
            className={`${large ? "w-10 h-10 md:w-12 md:h-12" : "w-10 h-10"} rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer`}
            style={{
                border: "1.5px solid var(--color-border)",
                color: active ? "#fff" : "var(--color-muted)",
                background: active ? "var(--color-accent)" : "transparent",
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.borderColor = "var(--color-accent)";
                    e.currentTarget.style.color = "var(--color-accent)";
                    e.currentTarget.style.background = "rgba(200,150,90,0.06)";
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.color = "var(--color-muted)";
                    e.currentTarget.style.background = "transparent";
                }
            }}
        >
            {children}
        </button>);
}