/**
 * API Route: /api/contracts/[id]/pdf
 * GET - Generate PDF for contract using pdf-lib
 */
import { NextRequest, NextResponse } from 'next/server';
import { getContractByNumber, getCompanySettings } from '@/lib/database';
import { getContratoCompleto } from '@/lib/contracts';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

const GOLD_COLOR = rgb(0.83, 0.69, 0.22); // #D4AF37
const BLACK_COLOR = rgb(0, 0, 0);
const GRAY_COLOR = rgb(0.6, 0.6, 0.6);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const contract = getContractByNumber(id);

        if (!contract) {
            return NextResponse.json(
                { error: 'Contract not found' },
                { status: 404 }
            );
        }

        const companySettings = getCompanySettings();

        // Generate PDF
        const pdfBytes = await generateContractPDF({
            ...contract,
            numero_contrato: contract.contract_number,
            ...companySettings
        });

        const filename = `${contract.contract_number}.pdf`;

        // Convert Uint8Array to Buffer for proper NextResponse handling
        const pdfBuffer = Buffer.from(pdfBytes);

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
                'Content-Length': pdfBuffer.length.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}

interface ContractPDFData {
    nome: string;
    nif: string;
    email: string;
    whatsapp: string;
    endereco: string;
    plano: string;
    numero_contrato: string;
    signature_data?: string;
    contratada_nome: string;
    contratada_nif: string;
    contratada_endereco: string;
}

async function generateContractPDF(data: ContractPDFData): Promise<Uint8Array> {
    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed standard fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Page settings
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 50;
    const contentWidth = pageWidth - 2 * margin;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    let pageNumber = 1;

    // Helper function to add new page
    const addNewPage = () => {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
        pageNumber++;
    };

    // Helper function to check if need new page
    const checkPageBreak = (neededHeight: number) => {
        if (y - neededHeight < margin + 40) {
            addNewPage();
        }
    };

    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number, font: typeof helvetica, fontSize: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    };

    // Header
    y -= 20;
    page.drawText(data.contratada_nome.toUpperCase(), {
        x: margin,
        y,
        size: 18,
        font: helveticaBold,
        color: GOLD_COLOR,
    });

    y -= 18;
    page.drawText('CLUBE + ESTÉTICA 3.0', {
        x: margin,
        y,
        size: 12,
        font: helveticaOblique,
        color: GRAY_COLOR,
    });

    // Gold line
    y -= 15;
    page.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        thickness: 1,
        color: GOLD_COLOR,
    });

    y -= 35;

    // Title
    const title = 'CONTRATO DE ADESÃO';
    const titleWidth = helveticaBold.widthOfTextAtSize(title, 14);
    page.drawText(title, {
        x: (pageWidth - titleWidth) / 2,
        y,
        size: 14,
        font: helveticaBold,
        color: BLACK_COLOR,
    });

    y -= 18;
    const contractNum = `Nº ${data.numero_contrato}`;
    const numWidth = helvetica.widthOfTextAtSize(contractNum, 10);
    page.drawText(contractNum, {
        x: (pageWidth - numWidth) / 2,
        y,
        size: 10,
        font: helvetica,
        color: GOLD_COLOR,
    });

    y -= 30;

    // Client data box
    const boxHeight = 80;
    page.drawRectangle({
        x: margin,
        y: y - boxHeight,
        width: contentWidth,
        height: boxHeight,
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 1,
        color: rgb(0.98, 0.98, 0.98),
    });

    let boxY = y - 15;
    page.drawText('DADOS DO(A) CONTRATANTE', {
        x: margin + 10,
        y: boxY,
        size: 10,
        font: helveticaBold,
        color: BLACK_COLOR,
    });

    boxY -= 15;
    page.drawText(`Nome: ${data.nome}`, { x: margin + 10, y: boxY, size: 9, font: helvetica, color: BLACK_COLOR });
    boxY -= 12;
    page.drawText(`NIF: ${data.nif}`, { x: margin + 10, y: boxY, size: 9, font: helvetica, color: BLACK_COLOR });
    boxY -= 12;
    page.drawText(`Email: ${data.email}`, { x: margin + 10, y: boxY, size: 9, font: helvetica, color: BLACK_COLOR });
    boxY -= 12;
    page.drawText(`WhatsApp: ${data.whatsapp}`, { x: margin + 10, y: boxY, size: 9, font: helvetica, color: BLACK_COLOR });

    // Address on right side
    page.drawText(`Endereço: ${data.endereco.substring(0, 40)}`, {
        x: margin + 250,
        y: y - 30,
        size: 9,
        font: helvetica,
        color: BLACK_COLOR
    });

    y -= boxHeight + 20;

    // Contract text
    const contratoTexto = getContratoCompleto(data);
    const lines = contratoTexto.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip header info already rendered
        if (trimmedLine.includes('CONTRATADA:') || trimmedLine.includes('CONTRATANTE:') ||
            trimmedLine.startsWith('Nome:') || trimmedLine.startsWith('NIF:') ||
            trimmedLine.startsWith('Email:') || trimmedLine.startsWith('E-mail:') ||
            trimmedLine.startsWith('WhatsApp:') || trimmedLine.startsWith('Endereço:')) {
            continue;
        }

        // Empty lines
        if (!trimmedLine) {
            y -= 8;
            continue;
        }

        checkPageBreak(25);

        // Clause titles
        if (trimmedLine.includes('CLÁUSULA') || trimmedLine.includes('CLAUSULA')) {
            y -= 10;
            const wrappedLines = wrapText(trimmedLine, contentWidth, helveticaBold, 10);
            for (const wl of wrappedLines) {
                page.drawText(wl, { x: margin, y, size: 10, font: helveticaBold, color: BLACK_COLOR });
                y -= 13;
            }
            continue;
        }

        // Section titles or uppercase headers
        if (/^\d+\.\d+\./.test(trimmedLine) ||
            (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 60 && trimmedLine.length > 3)) {
            const wrappedLines = wrapText(trimmedLine, contentWidth, helveticaBold, 9);
            for (const wl of wrappedLines) {
                page.drawText(wl, { x: margin, y, size: 9, font: helveticaBold, color: BLACK_COLOR });
                y -= 12;
            }
            continue;
        }

        // Normal text
        const wrappedLines = wrapText(trimmedLine, contentWidth, helvetica, 9);
        for (const wl of wrappedLines) {
            checkPageBreak(15);
            page.drawText(wl, { x: margin, y, size: 9, font: helvetica, color: BLACK_COLOR });
            y -= 11;
        }
    }

    // Signatures section
    checkPageBreak(150);
    y -= 30;

    const sigTitle = 'ASSINATURAS';
    const sigTitleWidth = helveticaBold.widthOfTextAtSize(sigTitle, 10);
    page.drawText(sigTitle, {
        x: (pageWidth - sigTitleWidth) / 2,
        y,
        size: 10,
        font: helveticaBold,
        color: BLACK_COLOR,
    });

    y -= 60;

    // Client signature
    if (data.signature_data) {
        try {
            const base64Data = data.signature_data.split(',')[1] || data.signature_data;
            const signatureBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            const signatureImage = await pdfDoc.embedPng(signatureBytes);

            // Scale to fit max 150x80 px area
            const maxWidth = 150;
            const maxHeight = 80;
            const aspectRatio = signatureImage.width / signatureImage.height;

            let finalWidth = maxWidth;
            let finalHeight = maxWidth / aspectRatio;

            if (finalHeight > maxHeight) {
                finalHeight = maxHeight;
                finalWidth = maxHeight * aspectRatio;
            }

            page.drawImage(signatureImage, {
                x: margin + 30,
                y: y - 10,
                width: finalWidth,
                height: finalHeight,
            });
        } catch (e) {
            console.error('Error adding client signature:', e);
        }
    }

    // Company signature
    const micaelaSignaturePath = path.join(process.cwd(), 'public', 'assets', 'assinatura_micaela.png');
    if (fs.existsSync(micaelaSignaturePath)) {
        try {
            const sigBytes = fs.readFileSync(micaelaSignaturePath);
            const sigImage = await pdfDoc.embedPng(sigBytes);

            // Scale to fit max 150x80 px area
            const maxWidth = 150;
            const maxHeight = 80;
            const aspectRatio = sigImage.width / sigImage.height;

            let finalWidth = maxWidth;
            let finalHeight = maxWidth / aspectRatio;

            if (finalHeight > maxHeight) {
                finalHeight = maxHeight;
                finalWidth = maxHeight * aspectRatio;
            }

            page.drawImage(sigImage, {
                x: pageWidth - margin - finalWidth - 30,
                y: y - 10,
                width: finalWidth,
                height: finalHeight,
            });
        } catch (e) {
            console.error('Error adding company signature:', e);
        }
    }

    y -= 40;

    // Signature lines
    page.drawLine({
        start: { x: margin + 20, y },
        end: { x: margin + 180, y },
        thickness: 0.5,
        color: BLACK_COLOR,
    });
    page.drawLine({
        start: { x: pageWidth - margin - 180, y },
        end: { x: pageWidth - margin - 20, y },
        thickness: 0.5,
        color: BLACK_COLOR,
    });

    y -= 12;
    page.drawText('Cliente (Assinatura Digital)', {
        x: margin + 40,
        y,
        size: 8,
        font: helvetica,
        color: BLACK_COLOR
    });
    page.drawText('Micaela Sampaio - Clube Estética', {
        x: pageWidth - margin - 165,
        y,
        size: 8,
        font: helvetica,
        color: BLACK_COLOR
    });

    y -= 20;
    const dateText = `Assinado digitalmente em: ${new Date().toLocaleString('pt-PT')}`;
    const dateWidth = helvetica.widthOfTextAtSize(dateText, 8);
    page.drawText(dateText, {
        x: (pageWidth - dateWidth) / 2,
        y,
        size: 8,
        font: helvetica,
        color: GRAY_COLOR,
    });

    // Add page numbers and rubricas to all pages
    const pages = pdfDoc.getPages();

    // Prepare Micaela rubrica (small signature for footer)
    let micaelaRubrica: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
    const micaelaSignaturePathRubrica = path.join(process.cwd(), 'public', 'assets', 'assinatura_micaela.png');
    if (fs.existsSync(micaelaSignaturePathRubrica)) {
        try {
            const sigBytes = fs.readFileSync(micaelaSignaturePathRubrica);
            micaelaRubrica = await pdfDoc.embedPng(sigBytes);
        } catch (e) {
            console.error('Error loading Micaela rubrica:', e);
        }
    }

    // Prepare client rubrica
    let clientRubrica: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
    if (data.signature_data) {
        try {
            const base64Data = data.signature_data.split(',')[1] || data.signature_data;
            const signatureBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            clientRubrica = await pdfDoc.embedPng(signatureBytes);
        } catch (e) {
            console.error('Error loading client rubrica:', e);
        }
    }

    for (let i = 0; i < pages.length; i++) {
        const p = pages[i];

        // Add page number
        const pageText = `Página ${i + 1} de ${pages.length}`;
        const pageTextWidth = helvetica.widthOfTextAtSize(pageText, 8);
        p.drawText(pageText, {
            x: (pageWidth - pageTextWidth) / 2,
            y: 30,
            size: 8,
            font: helvetica,
            color: GRAY_COLOR,
        });

        // Add client rubrica (small signature) on left side of footer
        if (clientRubrica) {
            const rubricaHeight = 20;
            const rubricaWidth = (clientRubrica.width / clientRubrica.height) * rubricaHeight;
            p.drawImage(clientRubrica, {
                x: 30,
                y: 25,
                width: rubricaWidth,
                height: rubricaHeight,
            });
        }

        // Add Micaela rubrica on right side of footer  
        if (micaelaRubrica) {
            const rubricaHeight = 20;
            const rubricaWidth = (micaelaRubrica.width / micaelaRubrica.height) * rubricaHeight;
            p.drawImage(micaelaRubrica, {
                x: pageWidth - 30 - rubricaWidth,
                y: 25,
                width: rubricaWidth,
                height: rubricaHeight,
            });
        }
    }

    return pdfDoc.save();
}
