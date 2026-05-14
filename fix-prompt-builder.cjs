const fs = require('fs');

let code = fs.readFileSync('services/geminiService.ts', 'utf8');

const replacement = `
  } else if (settings.visualStyle === "CONCEPT" || settings.visualStyle === "TECH_PS" || settings.visualStyle === "STUDIO") {
    
    let spaceInstruction = "";
    if (settings.emptySpacePosition && settings.emptySpacePosition.length > 0 && !settings.emptySpacePosition.includes('NONE' as any)) {
      const positions = settings.emptySpacePosition.map((p: any) => {
        if (p === 'TOP') return 'top (upper part)';
        if (p === 'BOTTOM') return 'bottom (lower part)';
        if (p === 'LEFT') return 'left side';
        if (p === 'RIGHT') return 'right side';
        return p;
      }).join(' and ');
      spaceInstruction = \`Leave clear, unobstructed empty negative space on the \${positions} of the image for adding text/logos later.\`;
    } else {
      spaceInstruction = "Center the subject normally.";
    }

    const isStudio = settings.visualStyle === "STUDIO";
    const mode = isStudio ? "minimalist high-end studio product shot" : "high-end commercial product photography shot";
    const propDetails = settings.props && settings.props.length > 0 ? settings.props.map(p => \`\${p.name}\${p.amount ? ' (' + p.amount + ')' : ''}\`).join(', ') : 'None';
    const placementDetails = settings.placement || "Centered";
    const cameraDetails = \`\${settings.camera?.angle || 'Front'}, \${settings.camera?.isMacro ? 'Macro Lens' : 'Standard Lens'}\`;

    const thinkingPrompt = \`
      Act as an expert AI image generation prompt engineer and professional commercial product photographer.
      Write a highly detailed, descriptive, and professional image generation prompt (in English) for a \${mode}.
      
      Product: \${settings.productName}
      Creative Concept/Theme: \${settings.concept}
      Placement and Proportion: \${placementDetails}
      Props to include: \${propDetails}
      \${isStudio ? "Background: Plain paper background that is EXACTLY the same color as the product's primary color (tone-on-tone monochromatic look)." : ""}
      Empty Space Requirement: \${spaceInstruction}
      Composition: The product and props must be neatly arranged and fit entirely within the frame.
      Camera & Lighting Setup: \${cameraDetails}
      
      CORE PHOTOGRAPHY AND DESIGN PRINCIPLES (STRICTLY ENFORCE):
      1. Strict Geometry Preservation: Describe the product exactly as it is without altering dimensions or structures. DO NOT hallucinates shapes, structures, or add extra elements to the product itself.
      2. PBR (Physically Based Rendering): Describe realistic physical light interactions (reflection, refraction, subsurface scattering). NO fake 3D glows.
      3. Shadow Structure: Must include contact shadows (stark black at the base), soft gradient key shadows, and feathered extrusion shadows for handles.
      4. Lighting System: 3-Point Lighting System (Key Light, Fill Light, Rim Light).
      
      MATERIAL GUIDELINES TO APPLY IN PROMPT:
      - Metal (Inox/Aluminum): Fresnel reflection, sharp longitudinal highlights, anisotropic brushed textures.
      - Plastic: Soft subsurface scattering for matte, sharp reflection shape for glossy.
      - Glass/Crystal: Caustics (converging light), dark-field/bright-field rim lighting to emphasize glass edges.
      - Ceramic/Stone: Grazing 45-degree angle light for micro-displacement/pores.
      
      Instructions for the prompt:
      - Describe the product's placement (MANDATORY: you must explicitly describe placing the product as described in "\${placementDetails}"), lighting, shadows, and reflections in vivid technical detail based on the core principles.
      - Describe the background and environment based on the concept and color palette rules. Make sure the props (\${propDetails}) are present.
      - \${isStudio ? "Ensure minimalist, clean, extremely neat layout." : "Follow the rule of thirds for composition. Use an elegant, harmonious color palette."}
      - Ensure the prompt emphasizes photorealism, 8k resolution, and high-end commercial aesthetic.
      - ONLY output the final prompt text (in English), no explanations.
    \`;

    const thinkingResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: thinkingPrompt
    });
    finalPrompt = thinkingResponse.text || "";
  } else if (settings.visualStyle === "TRACK_SOCKET_STAGING") {
`;

code = code.replace(/\} else if \(settings\.visualStyle === "CONCEPT" \|\| settings\.visualStyle === "TECH_PS" \|\| settings\.visualStyle === "STUDIO"\) \{[\s\S]*?\} else if \(settings\.visualStyle === "TRACK_SOCKET_STAGING"\) \{/, replacement.trim());

fs.writeFileSync('services/geminiService.ts', code);
console.log('Fixed prompt builder to include design.md logic');
