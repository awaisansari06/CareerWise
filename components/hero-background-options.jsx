"use client";

import { useState } from "react";
import HeroSection from "@/components/hero";

const options = [
  { id: "spotlight", name: "01 · Focused glow", description: "A soft blue spotlight gives the existing grid depth and draws attention to the headline." },
  { id: "path", name: "02 · Career paths", description: "Fine branching paths and nodes make the background feel specific to CareerWise." },
  { id: "beams", name: "03 · Forward motion", description: "Angled light and a fine dot field add energy without distracting from the copy." },
];

function CareerPaths() {
  return (
    <svg className="hero-option-paths" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path d="M-80 780 C170 790 180 590 415 625 S700 785 920 570 S1190 315 1530 390" />
      <path d="M-120 860 C160 820 280 740 450 720 S760 740 985 645 S1250 525 1520 560" />
      <path d="M-70 640 C150 670 280 470 455 485 S700 620 900 470 S1200 220 1490 260" />
      <circle cx="415" cy="625" r="5" />
      <circle cx="920" cy="570" r="5" />
      <circle cx="455" cy="485" r="4" />
      <circle cx="985" cy="645" r="4" />
      <circle cx="1190" cy="352" r="4" />
    </svg>
  );
}

export default function HeroBackgroundOptions() {
  const [selected, setSelected] = useState("spotlight");
  const active = options.find((option) => option.id === selected);

  return (
    <div className="hero-options-page">
      <div className="hero-options-toolbar">
        <div className="hero-options-intro">
          <span className="hero-options-eyebrow">CareerWise design preview</span>
          <p>Choose a hero background</p>
        </div>
        <div className="hero-options-switcher" role="group" aria-label="Hero background option">
          {options.map((option) => (
            <button key={option.id} type="button" aria-pressed={selected === option.id} className={selected === option.id ? "hero-option-button is-active" : "hero-option-button"} onClick={() => setSelected(option.id)}>
              {option.name}
            </button>
          ))}
        </div>
      </div>
      <div className={`hero-option-stage hero-option-${selected}`}>
        <div className="hero-option-art" aria-hidden="true">{selected === "path" && <CareerPaths />}</div>
        <HeroSection preview />
      </div>
      <div className="hero-options-caption" aria-live="polite">
        <strong>{active.name}</strong>
        <span>{active.description}</span>
      </div>
    </div>
  );
}

