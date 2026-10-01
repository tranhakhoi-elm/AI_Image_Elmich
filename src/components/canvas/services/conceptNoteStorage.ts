import localforage from 'localforage';

export type ConceptNoteCategory = 'CONCEPT' | 'STUDIO' | 'TECH' | 'CUSTOM';

export interface ConceptStyleNote {
  id: string;
  title: string;
  category: ConceptNoteCategory;
  description: string;
  paletteHint?: string;
  lightingHint?: string;
  additionalNotes?: string;
  createdAt: number;
  updatedAt: number;
}

const noteStore = localforage.createInstance({
  name: 'ElmichAIStudio',
  storeName: 'canvas_concept_notes',
  description: 'Lưu trữ các bộ note định hướng phong cách cá nhân hóa của người dùng',
});

const NOTES_INDEX_KEY = 'saved_concept_style_notes_list';
const LOCAL_STORAGE_FALLBACK_KEY = 'elmich_concept_style_notes_backup';

// Starter templates provided ONLY when user explicitly asks to seed/load starter templates
export const STARTER_STYLE_NOTES: Omit<ConceptStyleNote, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Japandi / Bắc Âu Tối Giản',
    category: 'CONCEPT',
    description: 'Tủ gỗ sồi sáng, mặt bàn đá marble trắng vân xám thanh nhẹ, tường be ấm áp, thoáng đãng không tì vết.',
    paletteHint: 'Gỗ sồi sáng, be ấm, trắng ngà',
    lightingHint: 'Ánh sáng ban mai dịu len qua khung cửa sổ bên',
    additionalNotes: 'Cây xanh nhỏ phong cách bonsai, không có người, gọn gàng',
  },
  {
    title: 'Luxury Penthouse / Sang Trọng Đẳng Cấp',
    category: 'CONCEPT',
    description: 'Mặt đá thạch anh trắng cao cấp, kính cường lực, đảo bếp hiện đại, đèn chùm thiết kế sang trọng đẳng cấp.',
    paletteHint: 'Trắng thạch anh, kim loại bóng, xám sáng',
    lightingHint: 'Ánh sáng rọi spotlight & ánh sáng tự nhiên cao cấp',
    additionalNotes: 'Cửa kính nhìn ra toàn cảnh thành phố hiện đại',
  },
  {
    title: 'Modern Industrial / Kim Loại Than Chì',
    category: 'CONCEPT',
    description: 'Bê tông mài, đá phiến xám đậm, ốp gạch mosaic than chì, phong cách xưởng bếp cao cấp mạnh mẽ.',
    paletteHint: 'Xám bê tông, than chì, inox mờ',
    lightingHint: 'Ánh sáng low-key góc cạnh, viền rim light sắc sảo',
    additionalNotes: 'Tôn vinh chất kim loại Inox 304 nguyên bản',
  },
  {
    title: 'Studio Khối Đá Travertine Tối Giản',
    category: 'STUDIO',
    description: 'Bục đá phiến hoặc travertine xốp tự nhiên cắt khối hình học, phông nền tiệp màu cao cấp chuẩn catalog thương mại.',
    paletteHint: 'Đá travertine be nhạt, cát vàng nhạt, xám ấm',
    lightingHint: 'Đèn key light 45° tạo bóng đổ gradient tinh tế, 5 đèn softbox',
    additionalNotes: 'Bố cục trung tâm tĩnh lặng, không vật trang trí thừa',
  },
  {
    title: 'Studio Kim Loại Satin & Trụ Tròn',
    category: 'STUDIO',
    description: 'Trụ tròn kim loại xước mờ satin, viền phản xạ ánh bạc tinh tế dành cho đồ gia dụng Inox cao cấp.',
    paletteHint: 'Bạc satin, xám chrome mờ, xám đậm',
    lightingHint: 'Đèn kicker đôi tạo vệt sáng viền razor-sharp',
    additionalNotes: 'Độ sắc nét viền sản phẩm tuyệt đối',
  },
  {
    title: 'Hiệu Ứng Luồng Nhiệt Đối Lưu 360°',
    category: 'TECH',
    description: 'Tia phát quang màu cam/đỏ mô phỏng luồng nhiệt đối lưu 360° bao quanh thân và đáy nồi chảo/nồi chiên.',
    paletteHint: 'Nền tối than chì, luồng phát quang cam/đỏ',
    lightingHint: 'Tương phản cao với quầng sáng tỏa nhiệt rực rỡ',
    additionalNotes: 'Bóc tách trực quan cơ chế truyền nhiệt siêu tốc',
  },
];

/**
 * Lấy danh sách bộ note đã lưu. Mặc định trả về rỗng [] nếu người dùng chưa tạo bộ note nào.
 */
export const getSavedConceptNotes = async (): Promise<ConceptStyleNote[]> => {
  try {
    const list = await noteStore.getItem<ConceptStyleNote[]>(NOTES_INDEX_KEY);
    if (list && Array.isArray(list)) {
      return list;
    }
    // Fallback to localStorage
    const local = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
    return [];
  } catch (err) {
    console.error('Error loading saved concept notes:', err);
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
      if (local) return JSON.parse(local);
    } catch {}
    return [];
  }
};

/**
 * Lưu hoặc cập nhật một bộ note.
 */
export const saveConceptNote = async (
  noteData: Omit<ConceptStyleNote, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<{ note: ConceptStyleNote; allNotes: ConceptStyleNote[] }> => {
  const currentList = await getSavedConceptNotes();
  const now = Date.now();

  const id = existingId || `note-${now}-${Math.random().toString(36).substring(2, 7)}`;
  const existingNote = currentList.find((n) => n.id === id);

  const updatedNote: ConceptStyleNote = {
    ...noteData,
    id,
    createdAt: existingNote ? existingNote.createdAt : now,
    updatedAt: now,
  };

  let nextList: ConceptStyleNote[];
  if (existingNote) {
    nextList = currentList.map((n) => (n.id === id ? updatedNote : n));
  } else {
    // Add to beginning of list
    nextList = [updatedNote, ...currentList];
  }

  try {
    await noteStore.setItem(NOTES_INDEX_KEY, nextList);
  } catch (err) {
    console.warn('LocalForage setItem failed, using localStorage fallback', err);
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(nextList));
  } catch {}

  // Dispatch event so all canvas components or nodes update reactively
  window.dispatchEvent(
    new CustomEvent('elmich:concept-notes-updated', {
      detail: { allNotes: nextList, updatedNote },
    })
  );

  return { note: updatedNote, allNotes: nextList };
};

/**
 * Xóa một bộ note theo ID.
 */
export const deleteConceptNote = async (id: string): Promise<ConceptStyleNote[]> => {
  const currentList = await getSavedConceptNotes();
  const nextList = currentList.filter((n) => n.id !== id);

  try {
    await noteStore.setItem(NOTES_INDEX_KEY, nextList);
  } catch {}

  try {
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(nextList));
  } catch {}

  window.dispatchEvent(
    new CustomEvent('elmich:concept-notes-updated', {
      detail: { allNotes: nextList, deletedId: id },
    })
  );

  return nextList;
};

/**
 * Nhân bản (duplicate) một bộ note.
 */
export const duplicateConceptNote = async (id: string): Promise<ConceptStyleNote[]> => {
  const currentList = await getSavedConceptNotes();
  const target = currentList.find((n) => n.id === id);
  if (!target) return currentList;

  const now = Date.now();
  const cloned: ConceptStyleNote = {
    ...target,
    id: `note-${now}-${Math.random().toString(36).substring(2, 7)}`,
    title: `${target.title} (Bản sao)`,
    createdAt: now,
    updatedAt: now,
  };

  const nextList = [cloned, ...currentList];
  try {
    await noteStore.setItem(NOTES_INDEX_KEY, nextList);
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(nextList));
  } catch {}

  window.dispatchEvent(
    new CustomEvent('elmich:concept-notes-updated', {
      detail: { allNotes: nextList, updatedNote: cloned },
    })
  );

  return nextList;
};

/**
 * Nạp các bộ note mẫu tham khảo (Chỉ khi người dùng chủ động bấm yêu cầu nạp).
 */
export const seedStarterStyleNotes = async (): Promise<ConceptStyleNote[]> => {
  const currentList = await getSavedConceptNotes();
  const now = Date.now();
  const newStarters: ConceptStyleNote[] = STARTER_STYLE_NOTES.map((s, idx) => ({
    ...s,
    id: `starter-${idx}-${now}`,
    createdAt: now + idx,
    updatedAt: now + idx,
  }));

  const nextList = [...currentList, ...newStarters];
  try {
    await noteStore.setItem(NOTES_INDEX_KEY, nextList);
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(nextList));
  } catch {}

  window.dispatchEvent(
    new CustomEvent('elmich:concept-notes-updated', {
      detail: { allNotes: nextList },
    })
  );

  return nextList;
};
