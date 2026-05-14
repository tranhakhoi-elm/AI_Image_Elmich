const fs = require('fs');

let serviceCode = fs.readFileSync('services/geminiService.ts', 'utf8');

// For CONCEPT and TECH_PS
const newConceptPrompt = `
    const thinkingPrompt = \`
      Act as an expert AI image generation prompt engineer and professional commercial product photographer.
      Write a highly detailed, descriptive, and professional image generation prompt (in English) for a high-end commercial product photography shot.
      
      Product: \${settings.productName}
      Creative Concept/Theme: \${settings.concept}
      Placement and Proportion: \${settings.placement}
      Props to include: \${formatProps(settings.props)}
      Camera & Lighting Setup: \${formatCameraSettings(settings.camera)}
      
      CORE PRINCIPLES (STRICTLY ENFORCE):
      1. Strict Geometry Preservation: Describe the product exactly as it is. DO NOT hallucinates shapes, structures, or add extra elements to the product itself.
      2. Physically Based Rendering (PBR): Describe realistic physical light interactions (reflection, refraction, subsurface scattering). NO fake 3D glows.
      3. Shadow Structure: Describe 3-part shadows: stark black contact shadow, gradient key shadow, and feathered extrusion shadows.
      4. Lighting: Use a 3-point lighting setup (Key Light, Fill Light, Rim Light) to add depth.
      5. Lifestyle Framing: 
         - Ensure negative space for text overlay.
         - Follow the rule of thirds for composition.
         - Use an elegant, harmonious color palette (Analogous, Soft Complementary, Natural Woods/Stones, Neutrals, Scandinavian). No cluttered/garish colors.
      6. Materials:
         - Metal: Describe Fresnel reflection, sharp longitudinal highlights, and anisotropic brushed textures if applicable.
         - Plastic: Subsurface scattering for softer look, sharp highlights for glossy, diffused highlights for matte.
         - Glass: Caustics (converging light patterns), high refraction, and dark-field/bright-field edge rims.
         - Ceramic/Stone: Grazing side light to emphasize micro-displacement/pores.
      
      Instructions for the prompt:
      - Describe the product's placement, lighting, shadows, and reflections in vivid technical detail based on the core principles.
      - Describe the background and environment based on the concept and color palette rules.
      - Ensure the prompt emphasizes photorealism, 8k resolution, and high-end commercial aesthetic.
      - ONLY output the final prompt text, no explanations.
    \`;
`;

serviceCode = serviceCode.replace(
  /const thinkingPrompt = `[\s\S]*?Act as an expert AI image generation prompt engineer and professional product photographer\.[\s\S]*?ONLY output the final prompt text, no explanations\.[\s\S]*?`;/m,
  newConceptPrompt.trim()
);

// For STUDIO
const newStudioPrompt = `
    const thinkingPrompt = \`
      Act as an expert AI image generation prompt engineer and professional commercial product photographer.
      Write a highly detailed, descriptive, and professional image generation prompt (in English) for a minimalist high-end studio product shot.
      
      Product: \${settings.productName}
      Creative Concept: \${settings.concept}
      Placement and Proportion: \${settings.placement}
      Props to include: \${formatProps(settings.props)}
      Background: Plain paper background that is EXACTLY the same color as the product's primary color (tone-on-tone monochromatic look).
      Empty Space Requirement: \${spaceInstruction}
      Composition: The product and props must be neatly arranged and fit entirely within the frame.
      Camera & Lighting Setup: \${formatCameraSettings(settings.camera)}
      
      CORE STUDIO PRINCIPLES (STRICTLY ENFORCE):
      1. Strict Geometry Preservation: Describe the product exactly as it is without altering dimensions or structures.
      2. PBR Lighting: Describe realistic reflections based on the material (Metal: Fresnel, scattered highlights; Plastic: subsurface scattering; Glass: caustics, rim light).
      3. Shadow Structure: Must include contact shadows (stark black at the base) and soft gradient key shadows.
      4. Composition: Minimalist, clean, extremely neat layout.
      
      Instructions for the prompt:
      - Emphasize clean, minimalist, high-end tone-on-tone studio photography.
      - Describe the soft, professional studio lighting and multi-layered subtle shadows.
      - Ensure the prompt emphasizes photorealism, 8k resolution, and commercial aesthetic.
      - ONLY output the final prompt text, no explanations.
    \`;
`;

serviceCode = serviceCode.replace(
  /const thinkingPrompt = `[\s\S]*?Act as an expert AI image generation prompt engineer and professional product photographer\.[\s\S]*?for a minimalist studio product shot\.[\s\S]*?ONLY output the final prompt text, no explanations\.[\s\S]*?`;/m,
  newStudioPrompt.trim()
);

fs.writeFileSync('services/geminiService.ts', serviceCode);
console.log('Fixed prompt engineering');
