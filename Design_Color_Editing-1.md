# Product Recoloring & Texture Fidelity Style Guide (Design_Color_Editing.md)

This document establishes the precise technical standards, lighting parameters, surface reflection properties, and material constraints required for high-fidelity **Product Recoloring (Color Editing)** using artificial intelligence across the Elmich appliance ecosystem.

---

## 1. Prerequisite Agent Verification Instruction

- **Mandatory Pre-flight Review:** Before performing any prompt synthesis or API calls involving the Recoloring/Color Editing workflow, the generative model **MUST first read this entire document** (`/Design_Color_Editing.md`). This ensures absolute alignment with structural integrity, luma boundaries, and masking protocols to prevent color-leaking artifacts.

---

## 2. High-Fidelity Commercial Recoloring Philosophy

When re-coating or modifying the color profile of a specific product component (e.g., changing a pan outer shell from soft pastel pink to anodized deep emerald or metallic copper):
- **Geometric Invariance:** Every mechanical seam, screw head, embossed branding element, and outer silhouette contour must be preserved with 100% accuracy in a 1:1 ratio. No smoothing, morphing, or geometric distortion of the physical object shape is permitted.
- **Surface Texture Preservation:** If the original surface is micro-textured matte plastic, the recolored version must preserve that exact diffuse roughness. If the surface is anodized aluminum, the recolored region must retain its native anisotropic satin sheen rather than becoming gloss-lacquered or flat-painted.

---

## 3. Inpainting & Vary-Region Precision Control

Replacing or editing colors dynamically relies heavily on coordinate-aligned **Inpainting / Vary Region** workflows rather than global image generation.
- **Accurate Masking Boundary:** Masking must align precisely with the physical edges of the targeted component. 
- **Non-Target Isolation:** Strictly exclude brand logos (such as "Elmich" inlays), metallic rims, transparent indicator windows, and structural heat-insulating gaskets from the edit mask to prevent catastrophic color spill or logo degradation.

---

## 4. Luminance & Specular Reflection Preservation (Luma Calibration)

To avoid flat, lifeless color surfaces that compromise 3D volume, prompts must incorporate professional optical descriptors:
- **Specular Highlight Retention:**
  - *Principle:* When shifting a surface to a darker tone (e.g., transforming a white porcelain ceramic kettle into matte black finish), the white bright light reflections (specular highlights) cast by the studio softboxes must remain pure white/light-grey. They must not be muddied or tinted by the new dark diffuse color.
  - *Engineering Prompt:* `"Preserve the exact coordinates, shapes, and brightness curves of all specular highlights and studio light reflections from the reference image. Modify only the diffuse/albedo color channel of the material while retaining pure white highlights."`
- **Tinted Reflection Highlights (Specular Tinting):**
  - *Principle:* High-gloss metallic or lacquer coats exhibit a subtle color tilt in their Fresnel edges. High-gloss anodized surfaces must show extremely subtle color-tinted reflections along the rim to mimic high-end manufacturing coating.

---

## 5. Advanced Material Texture Lock Keywords

To block AI's tendency to mutate underlying materials during color transfers, apply specialized physical texture descriptors:
- **Matte Polymer / Textured Plastic:** `matte finish, micro-textured non-slip polymer, high diffuse roughness, zero gloss coat, non-reflective`.
- **Anodized or Brushed Metal:** `brushed metal texture, anisotropic reflections, metallic satin sheen, stainless steel core, linear grain finish`.
- **Premium Gloss Lacquer & Car Paint:** `high-gloss clear coat finish, specular highlight retention, dual-layer automotive paint, sharp highlight borders`.

---

## 6. Color Bleeding & Global Illumination (GI Bounce)

- **Chromatic Spill Realism:**
  - *Principle:* A large saturated recolored object (e.g., a dark crimson frying pan) will naturally scatter colored photons onto neighboring surfaces, such as polished stainless steel handles or white marble countertops beneath it.
  - *Engineering Prompt:* `"Calculate soft indirect global illumination (bounce lighting) from the newly colored surfaces, casting a subtle, physically accurate color bleed (chromatic reflection) onto adjacent metallic trims or ground planes."`
  - *Goal:* This physical light interaction is the ultimate anchor that makes recolored product renders indistinguishable from direct studio photographs.

---

## 7. Standard Recoloring Prompt Blueprint

Construct inpainted prompts utilizing this precise spatial hierarchy:
`[Command Interface Trigger] + [Target Component Specifics] + [New Hex/Pantone Color Description] + [Advanced Surface Material and Finish Lock] + [Specular and Luma Preservation Protocol] + [GI Bounce Directive] + [Negative Parameter Restrictions]`

*Photorealistic Example:* `"Inpaint target component to PANTONE 19-4052 Classic Blue with a high-end matte polymer finish. Retain the original micro-texture and diffuse roughness. Keep the exact spatial coordinates of all specular highlights and studio softbox light reflections. Ensure a soft, physically accurate chromatic color bleed onto the neighboring chrome handle. --no glossy, metallic sheen, shape mutation, blurry logo."*

---

## 8. Defect Prevention Checklist (Negative Guidelines)

- **Flat Paint Bucket Artifacts (No Flatness):** The recolored area must never look like a flat, uniform 2D brush stroke. It must preserve all gradients, shadows, and subtle micro-shadowing that define its 3D depth.
- **Color Over-bleeding (Leakage):** Brand logos (such as "Elmich"), indicator LED panels, touch sensors, and handle rivets must remain untouched by the color-shifting algorithm.
- **Material Transmutation:** A plastic knob must not transform into polished metal or ceramic unless explicitly requested.
- **White Balance Tilting:** Recoloring should be locally confined and never skew the overall ambient color temperature of the background or non-mask environments.
