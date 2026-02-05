/**
 * API Route: /api/contracts
 * GET - List all contracts
 * POST - Create new contract
 */
import { NextRequest, NextResponse } from 'next/server';
import {
    getAllContracts,
    searchContracts,
    createContract,
    getAllTags,
    type ContractInput
} from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status') as 'active' | 'archived' | 'all' | null;
        const includeTags = searchParams.get('includeTags') === 'true';

        const contracts = search
            ? searchContracts(search, status || 'active')
            : getAllContracts(status || 'active');

        const response: { contracts: typeof contracts; tags?: string[] } = { contracts };

        if (includeTags) {
            response.tags = getAllTags();
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching contracts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contracts' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ContractInput = await request.json();

        // Validate required fields
        const requiredFields = ['nome', 'nif', 'email', 'whatsapp', 'endereco', 'plano'];
        for (const field of requiredFields) {
            if (!body[field as keyof ContractInput]) {
                return NextResponse.json(
                    { error: `Campo obrigatório: ${field}` },
                    { status: 400 }
                );
            }
        }

        const contractNumber = createContract(body);

        return NextResponse.json({
            success: true,
            contract_number: contractNumber
        });
    } catch (error) {
        console.error('Error creating contract:', error);
        return NextResponse.json(
            { error: 'Failed to create contract' },
            { status: 500 }
        );
    }
}
