import { listApprovedPrompts } from "../../../lib/historyStore";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }
  try {
    const visualStyle = (req.query?.visualStyle as string) || undefined;
    const limit = Math.min(parseInt(req.query?.limit as string, 10) || 5, 20);
    const items = await listApprovedPrompts({ visualStyle, limit });
    return res.status(200).json({ success: true, items });
  } catch (error: any) {
    console.error("Error in /api/history/images/approved:", error.message);
    return res.status(200).json({ success: false, error: error.message, items: [] });
  }
}
