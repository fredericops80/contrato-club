/**
 * API Route: /api/contracts/[id]
 * GET - Get contract by number
 */
import { NextRequest, NextResponse } from 'next/server';
import { getContractByNumber, getCompanySettings } from '@/lib/database';

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

        // Include company settings
        const companySettings = getCompanySettings();

        return NextResponse.json({
            contract: {
                ...contract,
                ...companySettings
            }
        });
    } catch (error) {
        console.error('Error fetching contract:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contract' },
            { status: 500 }
        );
    }
}
