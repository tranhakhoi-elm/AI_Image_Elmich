# Packaging Mockup & 3D Box Rendering Guide (Design_Packaging_Mockup.md)

This styling manual mandates the precise mechanical wrapping specifications, fold physics, structural crease highlighting, and surface material parameters required for high-fidelity **Packaging Mockup** creation using Elmich's AI generator.

---

## 1. High-Fidelity 3D Wrapping Philosophy (Precision Wrapping)

The primary goal of the Packaging Mockup workflow is to wrap flat, 2D vector graphic layouts or raw package assets onto realistic 3D boxes (gift boxes, corrugated shipping cartons, or paperboard containers) while maintaining professional commercial standards:
- **Perspective Plane Mapping:** All technical text, brand markings, barcodes, icons, and product diagrams from the source graphic must warp seamlessly along the 3D perspective lines of the box panels. They must conform precisely to light falloff, three-point perspective, and distortion rules.
- **Typographic Preservation:** The AI must preserve every alphanumeric character, logo font, and symbol of the source artwork. It is strictly forbidden to warp Vietnamese letters into illegible gibberish, messy runes, or distorted symbols.

---

## 2. Structural Crease & Assembly Joint Physics (Seam & Flap Mechanics)

To prevent the 3D mockup from appearing like a flat, computer-generated vector brick, incorporate natural fold mechanics:
- **Paper Thickness Crease Highlights (Folded Crease Highlights):**
  - *Principle:* True premium cardboard boxes exhibit a microscopic thickness along their folded edges (ranging from `1mm` to `1.5mm`). These folded edges catch a very thin, sharp, natural studio rim light (specular crease highlight) that defines the physical 3D box shape.
  - *Engineering Prompt:* `"Model natural paper crease lines with a tiny paper edge thickness of approximately 1mm. Edges must capture soft, realistic studio highlight reflections."`
- **Mechanical Flaps & Slight Seam Gaps:**
  - Where the cardboard box lid folds in or where the paper flaps overlap at the back, introduce a microscopic, natural shadow gap. This soft, tight ambient occlusion line ensures the box looks like an assembled, physical object.

---

## 3. Advanced Box Material Modeling

Prompts must define the physical properties of the paper material:
- **Premium Printed Color Box (Satin/Gloss Color Box):**
  - *Properties:* High-quality, satin or semi-gloss finish. It must catch soft, diffuse studio reflections from softbox lights without creating an overexposed glare.
  - *Prompt:* `"Add premium semi-gloss satin finish with elegant diffuse softbox reflections. Colors must appear saturated and deep with zero ink bleeds or pixelated spots."`
- **Natural Kraft Recycled Cardboard (Kraft/Corrugated Cardboard):**
  - *Properties:* Rough, unfinished texture with visible cellulose micro-fibers. Shows subtle corrugated vertical core ridges.
  - *Prompt:* `"Apply realistic brown kraft paper micro-fibers and corrugated cardboard core texturing to ensure organic material fidelity."`

---

## 4. Defect Prevention Checklist (Negative Guidelines)

- **Perspective Distortion (Warping Clashes):** Ensure the typography and lines of the graphics align perfectly to the vanishing points of the box. Text must not skew awkwardly across plane transitions.
- **Deformed / Rounded Corners (Gel Corners):** Box corners must remain straight and mathematically sharp. Avoid bloated, rounded corners that look like soft gel, wax, or rubber.
- **Legibility Breakdown (Blurry Branding):** The Elmich logo, regulatory symbols, weight specifications, and barcode bars must remain sharp and readable. They must not dissolve into blurry pixels or artifacts.
- **Unstable Box Panels (Dented Surfaces):** All panels of the mockup must be perfectly flat. Ensure there are no unrequested dents, warped surfaces, or crushed edges on the packaging walls.
