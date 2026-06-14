# North Hills Narwhals — Brand Spec

Single source of truth for the website build. Use these values verbatim. Do not invent or approximate colors, fonts, or copy tone.

---

## Colors

| Role | Name | Hex |
|------|------|-----|
| Primary | Navy | `#132A52` |
| Depth / backgrounds | Deep navy | `#09213A` |
| Secondary | Ice blue | `#B2D5E4` |
| Tint | Ice light | `#CFE7F4` |
| Trim / accent | Gold | `#B5933F` |
| Sheen / gradient highlight | Gold light | `#DDB060` |

**Usage rules**
- Theme all UI (backgrounds, buttons, text, borders) off these six flat colors only.
- The mascot file (`Narwhals-Primary.svg`) contains internal gradient and shading tints. Those are illustration, not UI tokens. Never pull UI colors from inside the mascot.
- Gold is trim, not a workhorse text color. Use it for borders, dividers, small accents, and the primary button fill. If gold text ever feels weak on navy, switch body labels to ice blue and keep gold for structure.
- Navy `#132A52` is the dominant surface. Deep navy `#09213A` adds depth and section contrast. Ice blue carries secondary text and accents. Cream/white only as needed for legibility.

---

## Type

| Role | Typeface | Source | Notes |
|------|----------|--------|-------|
| Display + labels | Oswald | Google Fonts | Headlines in uppercase. Eyebrows and labels uppercase with wide letter-spacing (~0.12–0.18em). |
| Body | Inter | Google Fonts | Paragraphs, form fields, FAQ answers. |

- Two-font system. Oswald handles every uppercase display and label role through weight and spacing, so no third utility face is needed.
- Suggested scale: hero headline very large and condensed, section heads large, body 16–17px, labels small and spaced.

---

## Logo files

| File | Where it goes |
|------|---------------|
| `Narwhals-Primary.svg` | Hero. The mascot, given room to breathe. |
| `Narwhals-Wordmark.svg` | Header lockup. |
| `Narwhals-Monogram.svg` | Favicon. Also works as a small footer or section accent. |

Use the actual SVG files. Do not redraw or substitute placeholder marks.

---

## Voice and copy

Tongue-in-cheek, grounded, founder-to-peer. The joke is a pro-grade identity for a beer league that does not exist yet, played straight. Self-aware about age without being self-deprecating to the point of sad.

**Writing conventions**
- Sentence case for body copy. Reserve uppercase for display headlines and labels.
- No em-dashes. Use periods, commas, or parentheses.
- No corporate or AI-sounding filler. Plain verbs, specific over clever.
- Keep the running gags consistent: "Season 0," "0–0 all-time and undefeated," roster spots open.

---

## Functional notes

- Single responsive static page. Plain HTML, CSS, vanilla JS. No framework, no build step. Must deploy to Netlify or Vercel with zero config.
- Sign-up form fields: name, email, best position, last played, neighborhood (optional). POST to a Formspree endpoint defined in one place at the top of the JS, with an inline success state and no page reload.
- Quality floor: responsive to mobile, visible keyboard focus, respects `prefers-reduced-motion`, semantic HTML, strong contrast on navy.
