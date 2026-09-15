import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStampThreshold, getCustomerProgressWithThreshold } from "@/lib/loyalty";

type ExportRow = {
  name: string;
  email: string;
  phone: string;
  verified: string;
  progress: string;
  eligible: string;
};

async function loadRows(q: string): Promise<ExportRow[]> {
  const [threshold, customers] = await Promise.all([
    getStampThreshold(),
    prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { email: { contains: q, mode: "insensitive" as const } },
                { phone: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return Promise.all(
    customers.map(async (c) => {
      const progress = await getCustomerProgressWithThreshold(c.id, threshold);
      return {
        name: c.name,
        email: c.email,
        phone: c.phone ?? "",
        verified: c.emailVerified ? "Terverifikasi" : "Belum Verifikasi",
        progress: `${progress.stamps}/${progress.threshold}`,
        eligible: progress.eligible ? "Ya" : "Tidak",
      };
    })
  );
}

const COLUMNS = [
  { key: "name", header: "Nama" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Nomor HP" },
  { key: "verified", header: "Status Verifikasi" },
  { key: "progress", header: "Progres Stempel" },
  { key: "eligible", header: "Siap Diklaim" },
] as const;

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: ExportRow[]): string {
  const header = COLUMNS.map((c) => csvEscape(c.header)).join(",");
  const lines = rows.map((row) =>
    COLUMNS.map((c) => csvEscape(row[c.key])).join(",")
  );
  return [header, ...lines].join("\r\n");
}

async function buildXlsx(rows: ExportRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Pelanggan");
  sheet.columns = COLUMNS.map((c) => ({
    header: c.header,
    key: c.key,
    width: 24,
  }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function buildPdf(rows: ExportRow[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).text("Daftar Pelanggan — Handai Coffee", { align: "left" });
    doc.fontSize(9).fillColor("#666").text(new Date().toLocaleString("id-ID"));
    doc.moveDown();

    const colWidths = [140, 190, 90, 110, 90, 80];
    const startX = doc.x;
    let y = doc.y;

    function drawRow(values: string[], bold: boolean) {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor("#000");
      let x = startX;
      values.forEach((value, i) => {
        doc.text(value, x, y, { width: colWidths[i], ellipsis: true });
        x += colWidths[i];
      });
      y += 18;
      if (y > doc.page.height - 50) {
        doc.addPage({ margin: 30, size: "A4", layout: "landscape" });
        y = doc.y;
      }
    }

    drawRow(COLUMNS.map((c) => c.header), true);
    rows.forEach((row) => drawRow(COLUMNS.map((c) => row[c.key]), false));

    doc.end();
  });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const rows = await loadRows(q);
  const filenameBase = `pelanggan-handai-coffee-${new Date().toISOString().slice(0, 10)}`;

  if (format === "xlsx") {
    const buffer = await buildXlsx(rows);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await buildPdf(rows);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
      },
    });
  }

  const csv = "﻿" + buildCsv(rows); // BOM so Excel opens UTF-8 correctly
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
    },
  });
}
