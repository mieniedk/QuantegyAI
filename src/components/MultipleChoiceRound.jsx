import React from 'react';
import { END_CARD_STYLE, FEEDBACK_STYLE, PRIMARY_BTN_STYLE, REVIEW_STYLE } from '../utils/quickGameStyles';

export default function MultipleChoiceRound({
  topSlot = null,
  done,
  prompt,
  options = [],
  selected,
  onSelect,
  onSubmit,
  submitDisabled = false,
  renderOptionLabel = (opt) => String(opt),
  submitLabel = 'Submit',
  endTitle = 'Complete',
  score,
  total,
  onRestart,
  restartLabel = 'Play Again',
  feedback,
  history = [],
  renderHistoryItem = (item, idx) => `${idx + 1}. ${String(item)}`,
  promptStyle = {},
  answersStyle = {},
  optionStyle = {},
  selectedOptionStyle = {},
  endCardStyle = {},
  feedbackStyle = {},
  reviewStyle = {},
}) {
  const percent = Math.round(((score || 0) / Math.max(1, total || 1)) * 100);

  return (
    <>
      {topSlot}

      {!done && Boolean(prompt) && (
        <div style={promptStyle}>{prompt}</div>
      )}

      {!done && options.length > 0 && (
        <div style={answersStyle}>
          {options.map((opt) => {
            const isSelected = selected === opt;
            return (
              <button
                key={String(opt)}
                type="button"
                onClick={() => onSelect(opt)}
                style={isSelected ? { ...optionStyle, ...selectedOptionStyle } : optionStyle}
              >
                {renderOptionLabel(opt)}
              </button>
            );
          })}
        </div>
      )}

      {!done ? (
        <button type="button" onClick={onSubmit} disabled={submitDisabled} style={PRIMARY_BTN_STYLE}>
          {submitLabel}
        </button>
      ) : (
        <div style={{ ...END_CARD_STYLE, ...endCardStyle }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{endTitle}</div>
          <div style={{ marginTop: 6 }}>Final score: {score}/{total} ({percent}%)</div>
          <button type="button" onClick={onRestart} style={{ ...PRIMARY_BTN_STYLE, marginTop: 12 }}>
            {restartLabel}
          </button>
        </div>
      )}

      <p style={{ ...FEEDBACK_STYLE, ...feedbackStyle }}>{feedback}</p>
      {done && (
        <div style={{ ...REVIEW_STYLE, ...reviewStyle }}>
          {history.map((item, idx) => (
            <div key={`h-${idx}`}>
              {renderHistoryItem(item, idx)}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
