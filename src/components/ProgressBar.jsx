import { useEffect, useState } from 'react';
import './ProgressBar.css';

const STEPS = [
  { label: 'File Reading...', percent: 15 },
  { label: 'Text Extracting...', percent: 30 },
  { label: 'AI Processing...', percent: 55 },
  { label: 'Web Searching...', percent: 75 },
  { label: 'Comparing Sources...', percent: 90 },
  { label: 'Generating Report...', percent: 100 },
];

export default function ProgressBar({ active }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      setPercent(0);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i < STEPS.length) {
        setStepIndex(i);
        setPercent(STEPS[i].percent);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 900);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="progress-wrapper">
      {/* Step label */}
      <div className="progress-top">
        <span className="progress-label">
          <span className="progress-dot" />
          {STEPS[stepIndex]?.label}
        </span>
        <span className="progress-percent">{percent}%</span>
      </div>

      {/* Bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Steps indicators */}
      <div className="progress-steps">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`step-dot ${i <= stepIndex ? 'done' : ''}`}
            title={step.label}
          />
        ))}
      </div>
    </div>
  );
}
