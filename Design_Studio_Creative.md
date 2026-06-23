# Creative Studio Lighting & Composition Guide (Design_Studio_Creative.md)

This styling manual defines the multi-point studio strobe configurations, multi-tier shadow properties, scene props integration, and editorial canvas layouts for the **Studio Creative Mode** in the Elmich AI application.

---

## 1. High-Performance Studio Creative Philosophy

The Studio Creative Mode transforms raw, informal product photos into premium commercial advertising imagery, combining modern minimalism with precise artistic engineering:
- **Absolute Preservation:** The principal appliance must remain the crisp, central anchor of the image. Its mechanical details, texture boundaries, material finishes, and brand logos must be preserved on a 1:1 scale with zero distortion.
- **Tone-Sur-Tone Seamless Backgrounds:** Elevate the staging using a professional, continuous **seamless paper background roll**. The backdrop color should be meticulously curated to match the product's hue (tone-sur-tone palette) or use a harmonious, sophisticated contrast color (e.g., warm cream backdrop for a sage-green kettle) to highlight the appliance.
- **Accurate Scale Ratio:** Maintain real-world proportional relationships. Props (such as single coffee beans, lemon slices, mint leaves, or ice cubes) must remain naturally proportioned (e.g., a raspberry must not appear larger than a cookware pot handle).

---

## 2. Advanced Multi-Point Studio Lighting Infrastructure

In any generated studio scene, prompts must specify a high-end commercial strobe setup to define object forms and material volumes:
- **1 Main/Key Light (Staging Main Light):** The primary lighting source that defines the overall shape and main shadow directions. Placed at a 45-degree angle. (Soft and diffused for clean concepts; hard and focused for high-contrast, dramatic concepts).
- **1 Overhead Top Light (Nose/Lid Accentuation):** Positioned directly above the product to illuminate kettle lids, pot handles, control buttons, and rims, adding essential vertical depth.
- **1 Fill Light (Shadow Reduction):** A highly diffused secondary light or reflector bounce positioned opposite the Key Light to soften dark cavities, ensuring 100% of the product's textures are readable in shadow areas.
- **2 Rim/Kicker Lights (Silhouette Edge Profiling):** Placed behind the product on both sides, shooting forward to create two bright, sharp, crisp glowing edges along the product's boundaries. This is extremely critical for isolating cylindrical glass, plastic, or metallic appliances from the background.
- **1 Backlight (Seamless Backdrop Halo):** An optional strobe directed at the seamless background paper behind the product to produce a subtle, beautiful gradient glow (Halo Effect), adding three-dimensional space to the render.

---

## 3. High-Fidelity Multi-Tier Shadow Structure

To avoid artificial-looking 3D cutouts, prompts must establish three separate layers of physical shadow interaction:
1. **Ambient Occlusion/Contact Shadow:**
   - A thin, dark, sharp shadow directly beneath the cookware base or appliance legs where they touch the seamless background paper. This anchors the product to the floor.
2. **Key Shadow Gradient:**
   - The primary silhouette shadow cast in the opposite direction of the Key Light, utilizing a soft-focus feathering effect (`gradient falloff`) that diffuses naturally as it extends.
3. **Internal & Extrusion Shadows (Handle/Knob Occlusion):**
   - Precise shadows cast by pot handles, knobs, or lids onto the product's own body. These shadows must curve smoothly along the appliance's surface with clean, feathered edges.

---

## 4. Professional Studio Props Integration

When adding kitchen props (such as cutting boards, fresh herbs, splash effects, or marble stands), the prompt must calculate physical alignment:
- **Focal Plane Depth (DOF):** Props positioned in the close-up foreground or far background should have a subtle out-of-focus blur (creamy bokeh) to guide the viewer's eye back to the sharp principal product.
- **Unified Light Coordinates:** All props and ingredients must share the exact same lighting direction and shadow falloff angles established by the multi-point strobe system.

---

## 5. Defect Prevention Checklist (Negative Guidelines)

- **Product Shape Mutation:** Never warp, stretch, or alter the physical design, dimensions, or aspect ratios of the original appliance or the Elmich logo.
- **Environmental Clutter:** Only use clean, seamless studio paper backdrops or stone plinths. Do not insert chaotic outdoor horizons, skies, trees, or messy domestic backgrounds.
- **Conflicting Shadows (Cross-Shadowing):** Prevent multiple sharp shadows stretching in opposite directions, which ruins lighting logic.
- **Flat Glass or Metallic Glare:** Do not cover the product's textures in solid white overexposed reflections. Highlights should be elegant and structured.
- **Soft Edge Bleeds (Blurry Silhouettes):** The outer metal or plastic silhouette edges of the main product must remain crisp and sharp against the background, even when depth-of-field blur is applied to surrounding props.
- **Digital Noise / Grain:** Ensure smooth, grain-free renders with perfect gradients on the backdrop paper, avoiding digital compression artifacts.
