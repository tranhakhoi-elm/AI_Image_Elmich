// Markdown Skill Registry for AI Studio Elmich Canvas
// Imports all guideline files directly via Vite's ?raw import

import designLifestyleConcept from '../../../../Design_Lifestyle_Concept.md?raw';
import designStudioCreative from '../../../../Design_Studio_Creative.md?raw';
import designStudioPropsGuide from '../../../../Design_Studio_Props_Guide.md?raw';
import designTechEffects from '../../../../Design_Tech_Effects.md?raw';
import designPackagingMockup from '../../../../Design_Packaging_Mockup.md?raw';
import designWhiteBGRetouch from '../../../../Design_WhiteBG_Retouch.md?raw';
import designColorEditing from '../../../../Design_Color_Editing.md?raw';
import designLineArt from '../../../../Design_Line_Art.md?raw';
import render3DToPhoto from '../../../../3DRender_To_Photo.md?raw';
import chatAssistantHandbook from '../../../../ChatAssistant_Handbook.md?raw';
import geminiGuide from '../../../../GEMINI.md?raw';
import handbook from '../../../../HANDBOOK.md?raw';

export interface MarkdownSkillDoc {
  id: string;
  fileName: string;
  title: string;
  category: 'photography' | 'effects' | 'commercial' | 'materials' | 'brand';
  categoryLabel: string;
  summary: string;
  keyPrinciples: string[];
  recommendedModels: string;
  rawContent: string;
  charCount: number;
}

export const MARKDOWN_SKILL_DOCS: MarkdownSkillDoc[] = [
  {
    id: 'lifestyle_concept',
    fileName: 'Design_Lifestyle_Concept.md',
    title: 'Lifestyle Concept Cao Cấp',
    category: 'photography',
    categoryLabel: 'Nhiếp Ảnh Bối Cảnh',
    summary: 'Quy chuẩn không gian nội thất sang trọng (Japandi, Industrial, Cozy Farmhouse), ánh sáng tự nhiên, góc chụp 30-45°, chừa 30% khoảng trống âm.',
    keyPrinciples: [
      'Bố cục 1/3, sản phẩm chiếm 40-55% diện tích khung hình',
      'Ánh sáng tự nhiên (nắng sớm / hoàng hôn / qua rèm)',
      'Đạo cụ logic với công năng (thực phẩm tươi, gia vị)',
      'Không gian ngăn nắp chuẩn Aesthetic Order',
    ],
    recommendedModels: 'gemini-3.1-flash-image / gemini-3.8-flash',
    rawContent: designLifestyleConcept,
    charCount: designLifestyleConcept.length,
  },
  {
    id: 'studio_creative',
    fileName: 'Design_Studio_Creative.md',
    title: 'Studio Sáng Tạo Bục Chụp',
    category: 'photography',
    categoryLabel: 'Studio Catalog',
    summary: 'Phông nền trơn tone-on-tone đồng màu sản phẩm, bục đỡ luân phiên (đá marble, travertine, gỗ sồi, mica trong), ánh sáng 3 điểm softbox.',
    keyPrinciples: [
      'Phông nền Plain Paper tone-sur-tone với sản phẩm',
      'Bục Plinth phù hợp chất liệu (đá / gốm / kim loại / gỗ)',
      'Ánh sáng Key / Fill / Rim light phân định viền sắc nét',
      'Đổ bóng chân đế mượt mà, chân thực',
    ],
    recommendedModels: 'gemini-3.1-flash-image',
    rawContent: designStudioCreative,
    charCount: designStudioCreative.length,
  },
  {
    id: 'studio_props',
    fileName: 'Design_Studio_Props_Guide.md',
    title: 'Cẩm Nang Đạo Cụ 10 Ngành Hàng',
    category: 'photography',
    categoryLabel: 'Đạo Cụ Chuẩn Hóa',
    summary: 'Ma trận phối hợp đạo cụ chuẩn mực cho 10 dòng sản phẩm gia dụng Elmich (Chảo chống dính, Nồi Inox, Nồi cơm, Bình giữ nhiệt, Nồi chiên không dầu...).',
    keyPrinciples: [
      'Đạo cụ kích cỡ tỉ lệ chuẩn, không lấn át sản phẩm chính',
      'Nguyên liệu tươi sạch (cắt lát mỏng, còn giọt sương ẩm)',
      'Bố cục cân bằng âm dương trước - sau - nền',
      'Tuyệt đối tránh chi tiết thừa không liên quan món ăn',
    ],
    recommendedModels: 'gemini-3.8-flash / gemini-3.1-flash-image',
    rawContent: designStudioPropsGuide,
    charCount: designStudioPropsGuide.length,
  },
  {
    id: 'tech_effects',
    fileName: 'Design_Tech_Effects.md',
    title: 'Bóc Tách Kỹ Thuật & Hiệu Ứng Tech',
    category: 'effects',
    categoryLabel: 'Kỹ Thuật Công Nghệ',
    summary: 'Hiệu ứng kỹ thuật bóc tách công nghệ cao: phân rã linh kiện 3D explode, luồng nhiệt đối lưu 360°, x-ray thấu thị, vi mạch điện tử vi mô.',
    keyPrinciples: [
      'Tia nhiệt đối lưu màu cam đỏ/vàng ấm 360°',
      'Linh kiện phân rã đồng tâm, giữ nguyên trục đối xứng',
      'Mặt cắt kim loại Inox nhiều lớp (đáy 3 lớp / 5 lớp)',
      'Hiệu ứng ánh sáng khoa học công nghệ chân thực',
    ],
    recommendedModels: 'gemini-3.1-flash-image',
    rawContent: designTechEffects,
    charCount: designTechEffects.length,
  },
  {
    id: 'white_bg_retouch',
    fileName: 'Design_WhiteBG_Retouch.md',
    title: 'Ảnh Nền Trắng Thương Mại Điện Tử',
    category: 'commercial',
    categoryLabel: 'Thương Mại & E-com',
    summary: 'Retouch sản phẩm trên nền trắng tinh khiết chuẩn #FFFFFF, giữ nguyên vệt xước satin kim loại Inox 304, độ khúc xạ kính và bóng tiếp xúc.',
    keyPrinciples: [
      'Nền trắng sạch 100% #FFFFFF, không ám vàng hay xám',
      'Inox 304 xước satin (brushed finish) không bị cháy sáng',
      'Bóng đổ chân đế contact shadow mỏng, êm',
      'Cạnh viền sắc nét, không bị lem màu hay răng cưa',
    ],
    recommendedModels: 'gemini-3.1-flash-image',
    rawContent: designWhiteBGRetouch,
    charCount: designWhiteBGRetouch.length,
  },
  {
    id: 'packaging_mockup',
    fileName: 'Design_Packaging_Mockup.md',
    title: 'Mockup Bao Bì Hộp & Túi 3D',
    category: 'commercial',
    categoryLabel: 'Bao Bì Thương Hiệu',
    summary: 'Dựng hình khối bao bì 3D từ bản thiết kế phẳng hoặc dieline, góc nhìn phối cảnh 3/4 isometric, tái hiện chất liệu giấy Kraft, Ivory cán mờ.',
    keyPrinciples: [
      'Chính xác tỉ lệ kích thước DxRxC của hộp',
      'Đường cấn gập, nếp gấp sắc cạnh như hộp thực tế',
      'Chữ và logo in ấn rõ nét, không bị biến dạng góc nhìn',
      'Ánh sáng studio làm nổi bật đường nét bao bì',
    ],
    recommendedModels: 'gemini-3.1-flash-image',
    rawContent: designPackagingMockup,
    charCount: designPackagingMockup.length,
  },
  {
    id: 'gemini_materials',
    fileName: 'GEMINI.md',
    title: 'Quy Chuẩn Vật Liệu Gia Dụng Chuẩn Elmich',
    category: 'materials',
    categoryLabel: 'Vật Liệu PBR',
    summary: 'Tiêu chuẩn vật liệu PBR cho 3 nhóm chính: Kim loại Inox 304 vân xước satin, Lớp chống dính micro-granite/gốm sứ, Thủy tinh borosilicate chịu nhiệt.',
    keyPrinciples: [
      'Inox 304: Brushed satin finish, specular highlight sắc nét',
      'Lòng chống dính: Vi hạt matte micro-texture than chì',
      'Thủy tinh: Khúc xạ caustics chân thật, viền sáng mềm',
      'Logo Elmich: Giữ đúng vị trí và font nhận diện',
    ],
    recommendedModels: 'gemini-3.1-flash-image',
    rawContent: geminiGuide,
    charCount: geminiGuide.length,
  },
  {
    id: 'color_editing',
    fileName: 'Design_Color_Editing.md',
    title: 'Đổi Màu Sắc & Biến Thể Sản Phẩm',
    category: 'effects',
    categoryLabel: 'Biến Thể Màu Sắc',
    summary: 'Chuyển đổi màu vỏ sản phẩm theo mã Pantone hoặc mẫu màu, giữ nguyên chất liệu kim loại bóng bẩy và các chi tiết phụ trợ.',
    keyPrinciples: [
      'Giữ 100% chi tiết cơ khí và chất liệu gốc',
      'Đổi màu đúng vùng chỉ định, không lem sang Inox/kính',
      'Chuyển sắc mượt mà theo hướng phản quang của nguồn sáng',
    ],
    recommendedModels: 'gemini-3.1-flash-image',
    rawContent: designColorEditing,
    charCount: designColorEditing.length,
  },
  {
    id: 'line_art',
    fileName: 'Design_Line_Art.md',
    title: 'Bản Vẽ Nét Kỹ Thuật Line Art',
    category: 'effects',
    categoryLabel: 'Bản Vẽ Kỹ Thuật',
    summary: 'Chuyển hình ảnh sản phẩm thành bản vẽ nét kỹ thuật vector sắc gọn, phong cách blueprint hoặc sơ đồ cấu tạo phục vụ sách HDSD.',
    keyPrinciples: [
      'Đường nét mảnh, liền mạch, đồng nhất độ dày',
      'Loại bỏ nhiễu nền, giữ cấu trúc tổng thể và tỉ lệ',
      'Thích hợp in ấn sách hướng dẫn sử dụng và bao bì carton',
    ],
    recommendedModels: 'gemini-3.1-flash-image',
    rawContent: designLineArt,
    charCount: designLineArt.length,
  },
  {
    id: '3d_to_real',
    fileName: '3DRender_To_Photo.md',
    title: 'Chuyển Render 3D Thô Sang Ảnh Thật',
    category: 'photography',
    categoryLabel: 'Chuyển Đổi 3D',
    summary: 'Nâng cấp mô hình render 3D CAD thô ráp thành bức ảnh chụp studio hoàn hảo, bổ sung vi bề mặt chân thực và ánh sáng thực tế.',
    keyPrinciples: [
      'Khử bỏ độ giả lập, khối cứng thô của render 3D',
      'Bổ sung vi vân xước, bóng đổ môi trường tự nhiên',
      'Giữ nguyên 100% hình khối và kiểu dáng thiết kế gốc',
    ],
    recommendedModels: 'gemini-3.1-flash-image',
    rawContent: render3DToPhoto,
    charCount: render3DToPhoto.length,
  },
  {
    id: 'brand_handbook',
    fileName: 'ChatAssistant_Handbook.md',
    title: 'Sổ Tay Giám Đốc Sáng Tạo & Nhận Diện Elmich',
    category: 'brand',
    categoryLabel: 'Định Vị Thương Hiệu',
    summary: 'Bộ quy chuẩn toàn diện về tầm nhìn thiết kế gia dụng Châu Âu cao cấp, ngôn ngữ thẩm mỹ, cảm xúc sang trọng và giá trị an toàn sức khỏe.',
    keyPrinciples: [
      'Thương hiệu chuẩn Châu Âu (Cộng hòa Séc), an toàn sức khỏe',
      'Tông màu trang nhã, công năng vượt trội, thẩm mỹ bền vững',
      'Hướng dẫn AI giao tiếp và định hướng hình ảnh chuẩn Giám Đốc Sáng Tạo',
    ],
    recommendedModels: 'gemini-3.1-pro-preview / gemini-3.1-flash-image',
    rawContent: chatAssistantHandbook,
    charCount: chatAssistantHandbook.length,
  },
];

export function getMarkdownSkillById(id: string): MarkdownSkillDoc | undefined {
  return MARKDOWN_SKILL_DOCS.find((d) => d.id === id);
}

export function compileSelectedSkillsGuidance(
  selectedIds: string[],
  customNote?: string
): { guidance: string; title: string; count: number } {
  const docs = MARKDOWN_SKILL_DOCS.filter((d) => selectedIds.includes(d.id));
  if (docs.length === 0 && !customNote?.trim()) {
    return { guidance: '', title: '', count: 0 };
  }

  const titles = docs.map((d) => d.title).join(', ');

  let content = `*** TÀI LIỆU QUY CHUẨN ĐỊNH HƯỚNG AI (ELMICH MARKDOWN SKILLS) ***\n`;
  content += `Tổng số tài liệu áp dụng: ${docs.length} tài liệu (${titles})\n\n`;

  if (customNote && customNote.trim()) {
    content += `[GHI CHÚ CHỈ THỊ RIÊNG TỪ NGƯỜI DÙNG]:\n${customNote.trim()}\n\n`;
  }

  docs.forEach((doc, idx) => {
    content += `=== TÀI LIỆU ${idx + 1}: ${doc.title.toUpperCase()} (${doc.fileName}) ===\n`;
    content += `Danh mục: ${doc.categoryLabel}\n`;
    content += `Tóm tắt cốt lõi:\n${doc.summary}\n`;
    content += `Nguyên tắc bắt buộc tuân thủ:\n`;
    doc.keyPrinciples.forEach((kp) => {
      content += ` - ${kp}\n`;
    });
    // Append condensed raw content (first 1800 chars of each skill to keep token usage within optimal limits)
    const excerpt = doc.rawContent.slice(0, 1800);
    content += `Chi tiết trích lục kỹ thuật:\n${excerpt}${doc.rawContent.length > 1800 ? '\n...[trích lục chuẩn hóa]' : ''}\n\n`;
  });

  content += `CHỈ THỊ THỰC THI: AI BẮT BUỘC phải đọc và áp dụng chặt chẽ toàn bộ các nguyên tắc nhiếp ảnh, ánh sáng, chất liệu PBR và bố cục trong các tài liệu trên vào ảnh sản phẩm!\n`;
  content += `***********************************************************************************`;

  return {
    guidance: content,
    title: titles || 'Chỉ thị tùy chỉnh',
    count: docs.length,
  };
}
