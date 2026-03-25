# Math notation in content and UI

## Display format: exponents

**Write all exponents using the `^(expression)` form** so they render as proper superscripts.

- In **question banks, explanations, and key concepts** use: `2^(3x)`, `x^(2)`, `2^(5x)`, etc.
- The app converts `^( ... )` to `<sup>...</sup>` when rendering (see `src/utils/mathFormat.js`).

### Examples (store and display like this)

| Meaning        | Write as           | Renders as   |
|----------------|--------------------|--------------|
| 2 to the power 5x | `2^(5x)`        | 2⁵ˣ         |
| Product rule  | `2^(3x) · 2^(2x) = 2^(3x + 2x) = 2^(5x)` | Proper superscripts |
| x squared      | `x^(2)` or `x²`   | x²          |

### Rule to remember

**When multiplying powers with the same base, add exponents:**  
`2^(3x) · 2^(2x) = 2^(3x + 2x) = 2^(5x)`.

- Use `·` for multiplication when appropriate.
- Use `^(...)` for any exponent; parentheses can contain multi-term expressions like `3x + 2x`.

## Where formatting is applied

- **Practice Loop:** quiz questions, choices, “What to remember” explanations, and key concept text.
- **Any new screen that shows equations:** use `formatMathHtml()` from `src/utils/mathFormat.js` and render the result with `sanitizeHtml()` + `dangerouslySetInnerHTML`.

## Adding new equation forms

To support more notation (e.g. fractions, square roots), extend `formatMathHtml()` in `src/utils/mathFormat.js` and keep storing content in a simple, readable form (e.g. `sqrt(x)`, `1/2`).
