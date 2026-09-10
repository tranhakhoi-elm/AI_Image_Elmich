# Technical Line Art & Vector Drafting Style Guide (Design_Line_Art.md)

This engineering manual defines the explicit line weight hierarchies, coordinate monochrome rules, and scene sanitization standards for the **Technical Line Art (Line Art Mode)** in the Elmich AI application.

---

## 1. Prerequisite Agent Verification Instruction

- **Mandatory Pre-flight Review:** Before generating or refining prompts for the Technical Line Art style, the AI system **MUST read this entire document** (`/Design_Line_Art.md`). This ensures absolute alignment with structural geometric limits, stroke weights, and background sanitization criteria.

---

## 2. High-Performance Technical Drafting Philosophy

The Technical Line Art workflow converts photographic product images into crisp, clean, vectorized 2D outlines suitable for user instruction manuals (User Guides), patent drafting (Patent Illustrations), or minimalist catalog diagrams:
- **Absolute Background Sanitization:** The background must be flat, seamless, solid white (`#FFFFFF`) from edge to edge. No contact shadows, ground shadows, slate or marble texturing, or gradient vignetting are permitted.
- **Strict Geometric Precision:** Retain the exact curves, proportions, mechanical joints, interfaces, and branding elements of the physical reference model on a 1:1 scale. Outlines must be continuous, crisp, and mathematically clean.

---

## 3. Structural Line Weight Hierarchy

To ensure depth and legibility, the line drafting must follow standardized technical drawing line weights:
- **Primary Outer Silhouette (Silhouette Outlines):**
  - The outermost boundary defining the complete product envelope must have the thickest line weight (approx. `1.5pt`), forming a continuous, unbroken, crisp line devoid of sketchy overlaps or micro-segmentation.
- **Secondary Mechanical & Joint Boundaries (Assembly Lines):**
  - Inner structural boundaries, overlapping assemblies, panel joints, kettle lids, base rims, and handle intersections are rendered with a medium line weight (approx. `1.0pt`) for clear physical separation.
- **Tertiary Detail Lines & Micro-Markings (Tick Marks & Inlays):**
  - Decorative texturing, brand logos (e.g., "Elmich"), liquid tick level indexes, temperature gauges, and control indicators are drafted with a delicate, razor-thin line weight (approx. `0.5pt`) to maintain structural readability.

---

## 4. Absolute Monochrome & No-Shading Rules

- **Pure Flat Monochrome Aesthetic:**
  - The drafting canvas must restrict itself exclusively to two tones: Pure Solid Black Ink (`#000000`) on a Pure Seamless White Background (`#FFFFFF`).
  - No hand-drawn shading, gray gradient fills, airbrushed textures, carbon-pencil textures, or hatching (halftones/cross-hatching) are allowed. The interior space of parts must be unfilled, solid white.

---

## 5. Background & Edge Noise Elimination (Core Sanitization)

To ensure the resulting vector representation reads as a professional CAD or patent diagram, the image margins must be completely clean:
- **No Vignetting or Radial Falloff:** The border and corners of the image must have an absolute color value of `#FFFFFF`. There must be zero dark or gray vignette leaking from the edges.
- **Complete Environment Purge:** Eliminate all marble veins, wood grains, reflections, tiles, and floor boards from the original scene. Ensure zero grey halos, shadow remnants, or noisy artifacts from the source image.
- *Engineering Prompt:* `"Mechanically erase, purge, and sanitize all original background elements, shadows, gradients, and edge vignetting. There must be absolutely zero leakage of the previous floor, marble veins, kitchen cabinets, or dirty noise. The background must be a flat, 100% solid, pure seamless white (#FFFFFF) from edge to edge with absolutely no vignetting, gray streaks, or dirty noise remnants."`

---

## 6. Technical Drafting Keywords

Use these standardized modifiers to guide the model towards crisp, professional technical drafting and away from sketchy hand-drawn aesthetics:
- **Style Drafting Identifiers:** `clean crisp outlines, vector line art, patent illustration style, CAD schematic drawing, technical blueprint line-work, mechanical engraving style`.
- **Canvas Control Modifiers:** `isolated on pure white background (#FFFFFF), absolute solid backdrop, flat black ink on white`.
- **Negative Exclusions:** `--no realistic textures, colors, background shading, shadows, gray gradients, sketch lines, artistic hand-drawn sketches, hatching, cross-hatching, colors, photorealistic details`.

---

## 7. Standard Line Art Prompt Blueprint

Assemble Technical Line Art inputs using this structured formula:
`[Technical Drafting Style] + [Principal Model Name & Viewing Angle] + [Mechanical Component Detail Descriptions] + [Pure Background Sanitization Directive] + [Line Weight Consistency Rules] + [Negative Exclusions]`

*Drafting Blueprint Example:* `"Technical clean patent drawing of an Elmich smart electric kettle. Pure black vector-style line art on a solid white background (#FFFFFF). Isometric blueprint layout, showing distinct mechanical parts, handle joints, and precise circular control dials. Clean crisp outlines, high-contrast, zero shading, flat vector graphic with no hand-drawn sketches. Fully sanitize the background with zero shadow leakage. --no shading, shadows, colors, textures, realistic detail, sketchy look."`

---

## 8. Defect Prevention Checklist (Negative Guidelines)

- **Artistic Hand-Drawn Sketch Slop (Loose Sketches):** No overlapping, fuzzy pencil lines, sketchy eraser marks, or varying brush pressures that look like organic hand-sketches. Lines must behave like mechanical bezier curves.
- **Dirty Shading Gradients (Noise Shading):** Do not render light falloffs or shadows as gray airbrushed zones. No charcoal or pencil shading.
- **Overlapping Detail Clutter (Line Merging):** In highly complex parts (such as mesh filters or digital dials), ensure the lines do not merge into a black blob. Retain space between lines to preserve technical clarity.
