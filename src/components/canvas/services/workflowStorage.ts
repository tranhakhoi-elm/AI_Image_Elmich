import localforage from 'localforage';
import { ElmichNode, ElmichEdge } from '../types';

export interface SavedWorkflow {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  nodes: ElmichNode[];
  edges: ElmichEdge[];
}

const workflowStore = localforage.createInstance({
  name: 'ElmichAIStudio',
  storeName: 'canvas_workflows',
  description: 'Bộ nhớ đệm lưu trữ quy trình Node Canvas Elmich',
});

const WORKFLOWS_INDEX_KEY = 'saved_workflows_list';

/**
 * Lấy danh sách quy trình đã tạo (Ưu tiên lấy từ Server / Git hệ thống, có fallback IndexedDB)
 */
export const getSavedWorkflows = async (): Promise<SavedWorkflow[]> => {
  // 1. Thử gọi API Server để lấy các quy trình lưu trên Server / GitHub
  try {
    const res = await fetch('/api/canvas/workflows');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        // Cập nhật bộ nhớ đệm localforage
        await workflowStore.setItem(WORKFLOWS_INDEX_KEY, data.items);
        return data.items;
      }
    }
  } catch (apiErr) {
    console.warn('Lấy quy trình từ server không thành công, chuyển sang bộ nhớ cục bộ:', apiErr);
  }

  // 2. Fallback: Lấy từ LocalForage
  try {
    const list = await workflowStore.getItem<SavedWorkflow[]>(WORKFLOWS_INDEX_KEY);
    return list || [];
  } catch (err) {
    console.error('Lỗi đọc quy trình từ IndexedDB:', err);
    return [];
  }
};

/**
 * Lưu quy trình lên Server hệ thống (Ghi file vào repo data/workflows/ và đồng bộ Firestore / IndexedDB)
 */
export const saveWorkflow = async (
  name: string,
  nodes: ElmichNode[],
  edges: ElmichEdge[],
  description?: string,
  existingId?: string
): Promise<SavedWorkflow> => {
  const now = Date.now();
  const id = existingId || `wf-${now}-${Math.random().toString(36).substring(2, 7)}`;

  const workflowRecord: SavedWorkflow = {
    id,
    name: name.trim() || 'Quy trình không tên',
    description: description?.trim() || '',
    createdAt: now,
    updatedAt: now,
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
  };

  // 1. Gửi lên Server để lưu vào filesystem (data/workflows/)
  let savedOnServer: SavedWorkflow | null = null;
  try {
    const res = await fetch('/api/canvas/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflowRecord),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.workflow) {
        savedOnServer = data.workflow;
      }
    }
  } catch (apiErr) {
    console.warn('Ghi lên server gặp lỗi, tiếp tục lưu cục bộ:', apiErr);
  }

  const finalWorkflow = savedOnServer || workflowRecord;

  // 2. Cập nhật bộ nhớ cục bộ LocalForage
  try {
    const currentList = (await workflowStore.getItem<SavedWorkflow[]>(WORKFLOWS_INDEX_KEY)) || [];
    const existingIndex = currentList.findIndex((w) => w.id === id);
    let nextList: SavedWorkflow[];
    if (existingIndex >= 0) {
      nextList = [...currentList];
      nextList[existingIndex] = {
        ...finalWorkflow,
        createdAt: currentList[existingIndex].createdAt || finalWorkflow.createdAt,
      };
    } else {
      nextList = [finalWorkflow, ...currentList];
    }
    await workflowStore.setItem(WORKFLOWS_INDEX_KEY, nextList);
  } catch (storeErr) {
    console.warn('Lỗi ghi LocalForage:', storeErr);
  }

  return finalWorkflow;
};

/**
 * Xóa quy trình khỏi Server và bộ nhớ cục bộ
 */
export const deleteSavedWorkflow = async (id: string): Promise<SavedWorkflow[]> => {
  // 1. Gửi lệnh xóa lên Server (thử DELETE, nếu proxy/browser chặn thì fallback POST)
  try {
    const res = await fetch(`/api/canvas/workflows?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      console.warn('Lỗi DELETE quy trình trên server, thử gửi qua POST fallback...');
      await fetch('/api/canvas/workflows/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'delete' }),
      }).catch(() => {});
    }
  } catch (apiErr) {
    console.warn('Xóa trên server qua DELETE gặp lỗi mạng, thử fallback POST:', apiErr);
    try {
      await fetch('/api/canvas/workflows/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'delete' }),
      });
    } catch (postErr) {
      console.warn('Fallback POST cũng gặp lỗi:', postErr);
    }
  }

  // 2. Cập nhật LocalForage ngay lập tức
  const currentList = (await workflowStore.getItem<SavedWorkflow[]>(WORKFLOWS_INDEX_KEY)) || [];
  const nextList = currentList.filter((w) => w.id !== id);
  try {
    await workflowStore.setItem(WORKFLOWS_INDEX_KEY, nextList);
  } catch (storeErr) {
    console.warn('Lỗi ghi LocalForage sau xóa:', storeErr);
  }

  // 3. Lấy lại danh sách mới nhất từ server và đảm bảo chắc chắn loại bỏ id vừa xóa
  try {
    const serverList = await getSavedWorkflows();
    const finalCleanList = (serverList || []).filter((w) => w.id !== id);
    await workflowStore.setItem(WORKFLOWS_INDEX_KEY, finalCleanList);
    return finalCleanList;
  } catch {
    return nextList;
  }
};

/**
 * Xuất quy trình thành file JSON
 */
export const exportWorkflowToFile = (workflow: SavedWorkflow): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(workflow, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const safeName = workflow.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadAnchor.setAttribute('download', `elmich_workflow_${safeName}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

/**
 * Nhập quy trình từ file JSON
 */
export const importWorkflowFromFile = async (file: File): Promise<SavedWorkflow> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          throw new Error('File không đúng định dạng quy trình Canvas Elmich!');
        }
        resolve(parsed as SavedWorkflow);
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file JSON!'));
    reader.readAsText(file);
  });
};
