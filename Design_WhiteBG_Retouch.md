# White BG Studio Retouching & Cleansing Guide (Design_WhiteBG_Retouch.md)

This technical guide regulates the precise photographic requirements, studio lighting properties, structural tolerances, and edge sanitization protocols required to generate flawless, premium **White Background Retouching (White BG Retouch)** images for Elmich products.

---

## 1. High-Fidelity White BG Retouching Philosophy

The ultimate goal of commercial product isolation is to **conserve 100% of the physical design** (original contours, mechanical silhouettes, logos, and textures) of the appliance, using artificial intelligence exclusively to **reconstruct professional studio lighting and realistic physical shadows**:
- **Pristine Studio Canvas:** The background must be flat, solid, seamless white (`#FFFFFF`) with absolute uniform illumination, zero color casting, and zero gradients. It must fully replace the entire original background with a pristine, seamless white background.
- **Perspective Distortion-Free:** Emulate a telephoto lens compression (Focal lengths ranging from `70mm to 105mm`) to completely negate raw wide-angle lens bloating.
- **Deep Field Sharpness (Deep DOF):** Replicate a tight narrow aperture range (`f/8 to f/11`) to ensure the entire product is in tack-sharp focus from front to back (deep/infinite depth of field).

---

## 2. Geometric Consistency & Axis Controls

To prevent AI from introducing unwanted organic curves or asymmetrical bloating into cylindrical appliances (such as electric kettles, thermoses, or stainless pots):
- **Orthogonal Axis Alignment:**
  - *Engineering Prompt:* `"Maintain absolute verticality for all cylindrical products. Ensure the base and lid are perfectly parallel to the horizon."`
  - *Goal:* Keep the product standing perfectly vertical, with handles and lids accurately aligned.
- **Logo Preservation:**
  - *Engineering Prompt:* `"Apply logo as a precise vector-based decal. No warping or distortion on curved surfaces. Strictly adhere to the brand placement."`
  - *Goal:* Prevent the "Elmich" brand text from bending, dissolving, or shifting positions.
- **Symmetric Handle Proportions:**
  - *Engineering Prompt:* `"Ensure handle-to-body proportion follows exact product design standards, avoiding unnatural scaling or floating artifacts."`

---

## 3. Advanced Material Rendering Specifications

### 3.1. Brushed & Polished Metals (Stainless Steel, Chrome, Aluminum)
- **Fresnel Physics:** Ensure strong, bright specular reflections along the high-curvature profile edges, fading to soft diffuse values on surfaces perpendicular to the camera angle.
- **Structured Specular Highlights:** Cylindrical bodies must exhibit sharp, vertical highlights (longitudinal reflections) that outline the 3D form.
- **Anisotropic Metal Luster:** Apply smooth, uniform anisotropic reflections characteristic of premium brushed stainless steel:
  - *Engineering Prompt:* `"Use smooth Anisotropic reflections with a blurriness factor of 0.05. Metallic surfaces must be impeccably clean, pristine, perfectly uniform, highly polished, and seamless."`
- **Tonal Contrast:** Retain deep, clean shadows under body joints, balanced with bright softbox highlights for maximum metallic impact.

### 3.2. Polymers & Premium Synthetics (Matte, Glossy, ABS)
- **Subsurface Scattering (Solid Thickness):** Guard against a thin Paper-mache appearance. Emulate a microscopic plastic light penetration depth (<0.2mm) to convey material weight and density.
- **Premium Food-Safe Matte Plastic:**
  - *Engineering Prompt:* `"Apply a perfectly smooth, immaculate, and pristine matte finish to mimic high-grade food-safe plastic, ensuring a clean, uniform, and flawless surface. Subtle Fresnel effect at the edges to show material thickness."`
- **Sturdy Gloss Acrylics:** Capture smooth, mirrored curves from the softbox lights without creating raw pixelated flares.

### 3.3. Optical Glass & Borosilicate Containers
- **Refraction Index Precision (IOR):**
  - *Engineering Prompt:* `"Set Refraction Index (IOR) to 1.5 for borosilicate glass. Ensure the internal walls of the container are visible through the glass, with slight chromatic aberration at the edges to simulate professional camera optics."`
- **Dark-Field Silhouette Rendering (Isolating Glass Rims):**
  - *Engineering Prompt:* `"Employ subtle dark-field studio lighting setup with black flags to frame the transparent glass silhouette with pristine dark rim edges."`
  - *Goal:* This subtle dark framing ensures transparent glass handles and kettle bodies do not dissolve into the solid white `#FFFFFF` backdrop.

---

## 4. Resolution Reconstruction & Image Denoising

Product images received from mobile phones can be enhanced to professional studio quality. Configure the engine to rebuild premium physical surfaces:
- **Commercial 8K Clarity Restoration:**
  - *Engineering Prompt:* `"Intelligently reconstruct the material surface to produce perfect professional-grade commercial finishes. Elevate the material quality to 8K commercial product photography standard, ensuring pristine, immaculate, and hyper-detailed clean textures."`
- **Specular Flare Cleansing:** Replace messy, bloated smartphone camera flares with clean, linear, and elegant vertical highlights resembling studio softbox reflections.

---

## 5. Absolute Background and Vignette Elimination

To guarantee the canvas remains solid white from edge to edge:
- **Total Environmental Purge:** Replace the original background completely with a flat, solid, seamless white color.
- **Flat Border Thresholds:** The border and corner pixels of the frame must hit pure Hex white (`#FFFFFF`) with absolute flat values. No soft vignette halos or gradient transitions are allowed around the edges.
- *Engineering Prompt:* `"Place the product on a flawless, PURE #FFFFFF SOLID WHITE STUDIO BACKGROUND. The entire background surrounding the isolated product must be a pristine, uniform, seamless, and flat digital white canvas from edge to edge. The background is completely solid, plain, clean, and empty white. The border and corner pixels of the image must be perfect flat #FFFFFF white. The product and background are exceptionally clean, pristine, and uniform."`

---

## 6. Physical Shadow Integration (Contact & Soft Ground Shadows)

- **Overhead Softbox Lighting:** Maintain a professional overhead and key strobe setup for a balanced, premium volumetric feel.
- **Contact Shadow (Ambient Occlusion):** Establish a very tight, dark, sharp shadow directly at the grounding base of the appliance. This anchors the product firmly to the floor so it does not appear to be floating.
- **Soft Ground Shadow:** Add a gentle, single-direction shadow that softens and diffuses outward, aligning with the Key Light angle.
