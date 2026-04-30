export interface BlockData {
  id: string;
  name: string;
  currentUsage: number;
  target: number;
  trustScore: number;
  creditsEarned: number;
  lastReported: string;
}
export interface ActivityLog {
  id: string;
  block: string;
  action: string;
  units: number;
  timestamp: string;
}
export interface ResidentComment {
  id: string;
  block: string;
  message: string;
  status: "open" | "investigating" | "fixed";
  timestamp: string;
}
export const mockBlocks: BlockData[] = [
  { id: "A", name: "Block A", currentUsage: 72, target: 80, trustScore: 95, creditsEarned: 120, lastReported: "10 mins ago" },
  { id: "B", name: "Block B", currentUsage: 85, target: 80, trustScore: 82, creditsEarned: 90, lastReported: "15 mins ago" },
  { id: "C", name: "Block C", currentUsage: 65, target: 80, trustScore: 98, creditsEarned: 165, lastReported: "5 mins ago" },
  { id: "D", name: "Block D", currentUsage: 92, target: 80, trustScore: 64, creditsEarned: 35, lastReported: "1 hour ago" },
  { id: "E", name: "Block E", currentUsage: 78, target: 80, trustScore: 89, creditsEarned: 110, lastReported: "20 mins ago" },
  { id: "F", name: "Block F", currentUsage: 81, target: 80, trustScore: 85, creditsEarned: 95, lastReported: "2 mins ago" },
  { id: "G", name: "Block G", currentUsage: 60, target: 80, trustScore: 99, creditsEarned: 190, lastReported: "Just now" },
  { id: "H", name: "Block H", currentUsage: 88, target: 80, trustScore: 78, creditsEarned: 55, lastReported: "45 mins ago" },
];
export const ghostGap = 42; // Difference between expected and reported supply
export const mockActivityLogs: ActivityLog[] = Array.from({ length: 20 }, (_, i) => ({
  id: `log-${i}`,
  block: `Block ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`, // Random A-F
  action: ["Water drawn", "Tank filled", "Filter replaced", "Leak reported", "Valve adjusted"][Math.floor(Math.random() * 5)],
  units: Math.floor(Math.random() * 50) + 1,
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(),
}));
export const mockResidentComments: ResidentComment[] = Array.from({ length: 15 }, (_, i) => ({
  id: `comment-${i}`,
  block: `Block ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
  message: [
    "Water pressure is low today.",
    "Solar panel needs cleaning.",
    "Community filter working great!",
    "Suspicious leak near the main pipe.",
    "Credits arrived on time.",
  ][Math.floor(Math.random() * 5)],
  status: ["open", "investigating", "fixed"][Math.floor(Math.random() * 3)] as "open" | "investigating" | "fixed",
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 80000000)).toISOString(),
}));