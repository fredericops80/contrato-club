'use client';

import { useState, useRef, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { PLANOS, type PlanKey, getContratoCompleto } from '@/lib/contracts';

type Step = 'identity' | 'plan' | 'signature' | 'success';

interface FormData {
    nome: string;
    nif: string;
    email: string;
    whatsapp: string;
    endereco: string;
    plano: string;
}

export default function ContractWizard() {
    const [step, setStep] = useState<Step>('identity');
    const [formData, setFormData] = useState<FormData>({
        nome: '',
        nif: '',
        email: '',
        whatsapp: '',
        endereco: '',
        plano: ''
    });
    const [contractNumber, setContractNumber] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const signatureRef = useRef<SignatureCanvas>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleIdentitySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const required = ['nome', 'nif', 'email', 'whatsapp', 'endereco'];
        const missing = required.filter(field => !formData[field as keyof FormData]);

        if (missing.length > 0) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setStep('plan');
    };

    const handlePlanSelect = (planKey: string) => {
        setFormData(prev => ({ ...prev, plano: planKey }));
        setStep('signature');
    };

    const handleBack = () => {
        if (step === 'plan') setStep('identity');
        if (step === 'signature') setStep('plan');
    };

    const clearSignature = () => {
        signatureRef.current?.clear();
    };

    const handleFinalSubmit = async () => {
        if (signatureRef.current?.isEmpty()) {
            setError('Por favor, assine o contrato antes de finalizar.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const signatureData = signatureRef.current?.toDataURL('image/png');

            const response = await fetch('/api/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    signature_data: signatureData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao salvar contrato');
            }

            setContractNumber(data.contract_number);
            setStep('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao processar contrato');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!contractNumber) return;
        // Open PDF in new tab - more reliable than programmatic download
        window.open(`/api/contracts/${contractNumber}/pdf`, '_blank');
    };

    const handleNewContract = () => {
        setFormData({
            nome: '', nif: '', email: '', whatsapp: '', endereco: '', plano: ''
        });
        setContractNumber('');
        setStep('identity');
    };

    // Contract preview text
    const getContractPreview = useCallback(() => {
        return getContratoCompleto({
            ...formData,
            numero_contrato: 'CTR-2024-PREVIEW',
            contratada_nome: 'MICAELA SAMPAIO',
            contratada_nif: '',
            contratada_endereco: ''
        });
    }, [formData]);

    return (
        <div className="container fade-in">
            {/* Header */}
            <header className="header">
                <h1 className="header-title">✨ Micaela Sampaio</h1>
                <p className="header-subtitle">Bem-vinda ao Clube + Estética 3.0</p>
            </header>

            {/* Step 1: Identity */}
            {step === 'identity' && (
                <div className="card">
                    <p className="step-indicator">Etapa 1 de 3 - Seus Dados</p>
                    <h2 className="mb-3">Vamos começar com suas informações</h2>

                    <form onSubmit={handleIdentitySubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Nome Completo *</label>
                                <input
                                    type="text"
                                    name="nome"
                                    className="form-input"
                                    placeholder="Maria Silva"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">NIF *</label>
                                <input
                                    type="text"
                                    name="nif"
                                    className="form-input"
                                    placeholder="123456789"
                                    value={formData.nif}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="maria@exemplo.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">WhatsApp *</label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    className="form-input"
                                    placeholder="+351 912 345 678"
                                    value={formData.whatsapp}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Endereço Completo *</label>
                            <input
                                type="text"
                                name="endereco"
                                className="form-input"
                                placeholder="Rua, Número, Cidade"
                                value={formData.endereco}
                                onChange={handleInputChange}
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <div className="mt-4">
                            <button type="submit" className="btn btn-primary">
                                Continuar
                            </button>
                        </div>
                    </form>

                    <a href="/admin" className="admin-link">🔐 Admin</a>
                </div>
            )}

            {/* Step 2: Plan Selection */}
            {step === 'plan' && (
                <div className="card">
                    <p className="step-indicator">Etapa 2 de 3 - Escolha Seu Plano</p>
                    <h2 className="mb-3">Escolha o plano ideal para você</h2>

                    <div className="plans-grid">
                        {(Object.entries(PLANOS) as [PlanKey, typeof PLANOS[PlanKey]][]).map(([key, plan]) => (
                            <div
                                key={key}
                                className={`plan-card ${formData.plano === key ? 'selected' : ''}`}
                                onClick={() => handlePlanSelect(key)}
                            >
                                <h3 className="plan-name">{plan.nome_display}</h3>
                                <p className="plan-price">{plan.valor_mensal}€/mês</p>
                                <p className="plan-description">{plan.descricao}</p>
                                {'economia_anual' in plan && (
                                    <span className="plan-savings">
                                        Economia: {plan.economia_anual}€/ano
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <button onClick={handleBack} className="btn btn-back">
                        ⬅️ Voltar
                    </button>
                </div>
            )}

            {/* Step 3: Signature */}
            {step === 'signature' && (
                <div className="card">
                    <p className="step-indicator">Etapa 3 de 3 - Assinatura</p>
                    <h2 className="mb-3">Revise e assine seu contrato</h2>

                    <div className="contract-box">
                        {getContractPreview()}
                    </div>

                    <h3 className="mt-4 mb-2">✍️ Assine aqui</h3>

                    <div className="signature-container">
                        <SignatureCanvas
                            ref={signatureRef}
                            canvasProps={{
                                className: 'signature-canvas',
                                width: 600,
                                height: 200
                            }}
                            backgroundColor="#FFFFFF"
                            penColor="#333333"
                        />

                        <div className="signature-actions">
                            <button onClick={clearSignature} className="btn btn-secondary" style={{ width: 'auto' }}>
                                Limpar
                            </button>
                        </div>
                    </div>

                    {error && <p className="error-message text-center">{error}</p>}

                    <div className="form-grid mt-4">
                        <button onClick={handleBack} className="btn btn-back">
                            ⬅️ Voltar
                        </button>
                        <button
                            onClick={handleFinalSubmit}
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processando...' : 'Finalizar Adesão'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
                <div>
                    <div className="success-box">
                        <h1>🎉 Parabéns!</h1>
                        <h2>Sua adesão foi concluída com sucesso!</h2>
                        <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
                            Número do Contrato: <strong>{contractNumber}</strong>
                        </p>
                        <p style={{ marginTop: '1rem' }}>
                            Bem-vinda ao Clube + Estética 3.0! 💎
                        </p>
                    </div>

                    <div className="card text-center">
                        <button onClick={handleDownloadPDF} className="btn btn-primary mb-3">
                            📄 Baixar Meu Contrato
                        </button>

                        <button onClick={handleNewContract} className="btn btn-secondary">
                            ✨ Fazer Nova Adesão
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
