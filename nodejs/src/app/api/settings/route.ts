/**
 * API Route: /api/settings
 * GET - Get company settings
 * PUT - Update company settings
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCompanySettings, setSetting } from '@/lib/database';

export async function GET() {
    try {
        const settings = getCompanySettings();
        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (body.contratada_nome !== undefined) {
            setSetting('contratada_nome', body.contratada_nome);
        }
        if (body.contratada_nif !== undefined) {
            setSetting('contratada_nif', body.contratada_nif);
        }
        if (body.contratada_endereco !== undefined) {
            setSetting('contratada_endereco', body.contratada_endereco);
        }

        return NextResponse.json({
            success: true,
            settings: getCompanySettings()
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
