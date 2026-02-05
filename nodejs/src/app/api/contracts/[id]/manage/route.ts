/**
 * API Route: /api/contracts/[id]/manage
 * POST - Manage contract (archive, restore, delete, update tags)
 */
import { NextRequest, NextResponse } from 'next/server';
import { archiveContract, restoreContract, deleteContract, updateContractTags, getContractByNumber } from '@/lib/database';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action, tags } = body;

        const contract = getContractByNumber(id);
        if (!contract) {
            return NextResponse.json(
                { error: 'Contract not found' },
                { status: 404 }
            );
        }

        switch (action) {
            case 'archive':
                const archived = archiveContract(id);
                return NextResponse.json({
                    success: archived,
                    message: archived ? 'Contrato arquivado com sucesso' : 'Erro ao arquivar'
                });

            case 'restore':
                const restored = restoreContract(id);
                return NextResponse.json({
                    success: restored,
                    message: restored ? 'Contrato restaurado com sucesso' : 'Erro ao restaurar'
                });

            case 'delete':
                const deleted = deleteContract(id);
                return NextResponse.json({
                    success: deleted,
                    message: deleted ? 'Contrato excluído permanentemente' : 'Erro ao excluir'
                });

            case 'updateTags':
                if (tags === undefined) {
                    return NextResponse.json(
                        { error: 'Tags are required for updateTags action' },
                        { status: 400 }
                    );
                }
                const updated = updateContractTags(id, tags);
                return NextResponse.json({
                    success: updated,
                    message: updated ? 'Tags atualizadas com sucesso' : 'Erro ao atualizar tags'
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: archive, restore, delete, or updateTags' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error managing contract:', error);
        return NextResponse.json(
            { error: 'Failed to manage contract' },
            { status: 500 }
        );
    }
}
