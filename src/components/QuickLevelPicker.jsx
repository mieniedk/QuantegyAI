import React from 'react';
import LoopContinueButton from './LoopContinueButton';
import { PRIMARY_BTN_STYLE, SECONDARY_BTN_STYLE } from '../utils/quickGameStyles';

export default function QuickLevelPicker({ options, onSelect, returnUrl, goBack, rowStyle }) {
  return (
    <>
      <div style={rowStyle}>
        {options.map((opt, idx) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            style={idx === 0 ? PRIMARY_BTN_STYLE : SECONDARY_BTN_STYLE}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </>
  );
}
