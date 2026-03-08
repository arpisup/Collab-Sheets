import type { NextApiRequest, NextApiResponse } from "next"

interface Doc {
  id: string
  title: string
  author: string
  lastModified: string
  starred: boolean
}

const documents: Doc[] = [
  { id: "sheet1", title: "Project Budget", author: "Admin", lastModified: "2026-03-07T10:30:00Z", starred: true },
  { id: "sheet2", title: "Expenses Report", author: "Admin", lastModified: "2026-03-06T14:20:00Z", starred: false },
  { id: "sheet3", title: "Sprint Tracker", author: "Admin", lastModified: "2026-03-05T09:15:00Z", starred: true },
  { id: "sheet4", title: "Q1 Revenue Report", author: "Admin", lastModified: "2026-03-04T16:45:00Z", starred: false },
  { id: "sheet5", title: "Inventory Log", author: "Admin", lastModified: "2026-03-03T11:00:00Z", starred: false },
]

export default function handler(_req: NextApiRequest, res: NextApiResponse<Doc[]>) {
  res.status(200).json(documents)
}
