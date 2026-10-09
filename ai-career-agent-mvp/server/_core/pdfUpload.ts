import type { Express, Request, Response } from "express";
import multer from "multer";
// @ts-ignore - pdf-parse has no default export in its types but works at runtime
import pdfParse from "pdf-parse";

// Configure multer for memory storage (no saving to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export function registerPdfUploadRoute(app: Express) {
  app.post("/api/upload-cv", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Check if it's a PDF
      if (req.file.mimetype !== "application/pdf") {
        res.status(400).json({ error: "Only PDF files are supported right now" });
        return;
      }

      // Parse the PDF
      const pdfData = await pdfParse(req.file.buffer);
      
      // Return the extracted text
      res.json({ text: pdfData.text });
    } catch (error) {
      console.error("[PDF Upload] Error parsing PDF:", error);
      res.status(500).json({ error: "Failed to parse PDF file" });
    }
  });
}
