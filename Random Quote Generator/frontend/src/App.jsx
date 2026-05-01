import {useCallback, useState} from "react";
import QuoteCard from "./components/QuoteCard";
import "./index.css";

const DEFAULT_QUOTE = {
    content: "Never give up because you never know if the next try is going to be the one that works.",
    author: "Mary Kay Ash",
};

export default function App() {
    const [quote, setQuote] = useState(DEFAULT_QUOTE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [animKey, setAnimKey] = useState(0);

    const fetchQuote = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/quote");
            if (!res.ok) throw new Error("Server error");
            const data = await res.json();
            setQuote(data);
            setAnimKey((k) => k + 1); // re-trigger animation on new quote
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Couldn't fetch a quote. Try again!");
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 md:py-16">
            {/* Decorative background circles — bigger on desktop */}
            <div
                className="fixed -top-35 -right-35 w-105 h-105 md:w-150 md:h-150 rounded-full opacity-10 pointer-events-none"
                style={{background: "radial-gradient(circle, var(--color-accent), transparent 70%)"}}
            />
            <div
                className="fixed -bottom-30 -left-30 w-[320px] h-80 md:w-125 md:h-125 rounded-full opacity-10 pointer-events-none"
                style={{background: "radial-gradient(circle, var(--color-ink), transparent 70%)"}}
            />

            {/* Header */}
            <div className="mb-8 md:mb-12 text-center">
                <p
                    className="text-[10px] md:text-xs uppercase tracking-[0.35em] mb-2 md:mb-3"
                    style={{color: "var(--color-accent)", fontFamily: "var(--font-body)"}}
                >
                    Daily Wisdom
                </p>
                <h1
                    className="text-3xl md:text-6xl font-bold"
                    style={{fontFamily: "var(--font-display)", color: "var(--color-ink)"}}
                >
                    Quote of the Day
                </h1>
                {/* Decorative underline */}
                <div className="flex items-center justify-center gap-2 mt-3 md:mt-4">
                    <div className="h-px w-10 md:w-16" style={{background: "var(--color-border)"}}/>
                    <div className="w-1.5 h-1.5 rounded-full" style={{background: "var(--color-accent)"}}/>
                    <div className="h-px w-10 md:w-16" style={{background: "var(--color-border)"}}/>
                </div>
            </div>

            {/* Card */}
            <QuoteCard
                quote={quote}
                loading={loading}
                error={error}
                animKey={animKey}
                onNewQuote={fetchQuote}
            />

            {/* Footer */}
            <p className="mt-6 md:mt-10 text-xs" style={{color: "var(--color-muted)"}}>
                Powered by DummyJSON Quotes API
            </p>
        </div>
    );
}