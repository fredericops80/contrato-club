'use client';

import { useState, useEffect } from 'react';

interface Contract {
    id: number;
    contract_number: string;
    nome: string;
    plano: string;
    status: 'active' | 'archived';
    tags: string;
    created_at: string;
}

interface Settings {
    contratada_nome: string;
    contratada_nif: string;
    contratada_endereco: string;
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<'contracts' | 'archived' | 'settings'>('contracts');
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [settings, setSettings] = useState<Settings>({
        contratada_nome: '',
        contratada_nif: '',
        contratada_endereco: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [editingTagsFor, setEditingTagsFor] = useState<string | null>(null);
    const [newTags, setNewTags] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        const savedAuth = sessionStorage.getItem('admin_authenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }
        setIsCheckingAuth(false);
    }, []);

    // Fetch data when authenticated or tab changes
    useEffect(() => {
        if (isAuthenticated && !isCheckingAuth) {
            fetchContracts();
            fetchSettings();
        }
    }, [isAuthenticated, isCheckingAuth, activeTab]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_authenticated', 'true');
            setError('');
        } else {
            setError('Senha incorreta!');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_authenticated');
    };

    const fetchContracts = async () => {
        try {
            const status = activeTab === 'archived' ? 'archived' : 'active';
            const url = searchTerm
                ? `/api/contracts?search=${encodeURIComponent(searchTerm)}&status=${status}&includeTags=true`
                : `/api/contracts?status=${status}&includeTags=true`;
            const response = await fetch(url);
            const data = await response.json();
            setContracts(data.contracts || []);
            setAllTags(data.tags || []);
        } catch (err) {
            console.error('Error fetching contracts:', err);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            const data = await response.json();
            setSettings(data.settings || {});
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchContracts();
    };

    const handleArchive = async (contractNumber: string) => {
        try {
            const response = await fetch(`/api/contracts/${contractNumber}/manage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'archive' })
            });
            const data = await response.json();
            if (data.success) {
                setMessage('✅ Contrato arquivado!');
                fetchContracts();
            }
        } catch (err) {
            setMessage('❌ Erro ao arquivar contrato');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleRestore = async (contractNumber: string) => {
        try {
            const response = await fetch(`/api/contracts/${contractNumber}/manage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'restore' })
            });
            const data = await response.json();
            if (data.success) {
                setMessage('✅ Contrato restaurado!');
                fetchContracts();
            }
        } catch (err) {
            setMessage('❌ Erro ao restaurar contrato');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleDelete = async (contractNumber: string) => {
        try {
            const response = await fetch(`/api/contracts/${contractNumber}/manage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete' })
            });
            const data = await response.json();
            if (data.success) {
                setMessage('✅ Contrato excluído permanentemente!');
                setShowDeleteConfirm(null);
                fetchContracts();
            }
        } catch (err) {
            setMessage('❌ Erro ao excluir contrato');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleUpdateTags = async (contractNumber: string) => {
        try {
            const response = await fetch(`/api/contracts/${contractNumber}/manage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateTags', tags: newTags })
            });
            const data = await response.json();
            if (data.success) {
                setMessage('✅ Tags atualizadas!');
                setEditingTagsFor(null);
                setNewTags('');
                fetchContracts();
            }
        } catch (err) {
            setMessage('❌ Erro ao atualizar tags');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setMessage('✅ Dados atualizados com sucesso!');
            } else {
                setMessage('❌ Erro ao salvar dados');
            }
        } catch (err) {
            setMessage('❌ Erro ao salvar dados');
        } finally {
            setIsLoading(false);
        }
        setTimeout(() => setMessage(''), 3000);
    };

    // Show loading while checking auth
    if (isCheckingAuth) {
        return (
            <div className="container fade-in">
                <div className="card text-center" style={{ maxWidth: '400px', margin: '4rem auto' }}>
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="container fade-in">
                <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
                    <h2 className="text-center mb-4">🔐 Acesso Administrativo</h2>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Senha de administrador:</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite a senha"
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <button type="submit" className="btn btn-primary mt-3">
                            Entrar
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <a href="/" style={{ color: '#888', textDecoration: 'none' }}>
                            ← Voltar ao início
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container fade-in">
            {/* Header */}
            <div className="admin-header">
                <h1>Painel Admin 🔐</h1>
                <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{ width: 'auto' }}
                >
                    Sair
                </button>
            </div>

            {/* Global Message */}
            {message && (
                <div style={{
                    padding: '12px 20px',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
                    color: message.includes('✅') ? '#2e7d32' : '#c62828',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'contracts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contracts')}
                >
                    📋 Contratos Ativos
                </button>
                <button
                    className={`admin-tab ${activeTab === 'archived' ? 'active' : ''}`}
                    onClick={() => setActiveTab('archived')}
                >
                    📦 Arquivados
                </button>
                <button
                    className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    ⚙️ Configurações
                </button>
            </div>

            {/* Contracts Tab (Active) */}
            {activeTab === 'contracts' && (
                <div className="card">
                    <h3 className="mb-3">🔍 Contratos Ativos</h3>

                    <form onSubmit={handleSearch} className="form-grid mb-4">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Digite o nome do cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">
                            Buscar
                        </button>
                    </form>

                    {contracts.length === 0 ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                            Nenhum contrato ativo encontrado.
                        </p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nº Contrato</th>
                                        <th>Cliente</th>
                                        <th>Plano</th>
                                        <th>Tags</th>
                                        <th>Data</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contracts.map((contract) => (
                                        <tr key={contract.id}>
                                            <td>{contract.contract_number}</td>
                                            <td>{contract.nome}</td>
                                            <td>{contract.plano}</td>
                                            <td>
                                                {editingTagsFor === contract.contract_number ? (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <input
                                                            type="text"
                                                            value={newTags}
                                                            onChange={(e) => setNewTags(e.target.value)}
                                                            placeholder="tag1, tag2"
                                                            style={{ width: '100px', padding: '4px', fontSize: '0.8rem' }}
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateTags(contract.contract_number)}
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingTagsFor(null); setNewTags(''); }}
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        onClick={() => { setEditingTagsFor(contract.contract_number); setNewTags(contract.tags || ''); }}
                                                        style={{ cursor: 'pointer', color: contract.tags ? '#666' : '#bbb' }}
                                                        title="Clique para editar tags"
                                                    >
                                                        {contract.tags || '+ adicionar'}
                                                    </span>
                                                )}
                                            </td>
                                            <td>{new Date(contract.created_at).toLocaleDateString('pt-PT')}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    <a
                                                        href={`/api/contracts/${contract.contract_number}/pdf`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 10px', fontSize: '0.75rem', width: 'auto' }}
                                                    >
                                                        📄
                                                    </a>
                                                    <button
                                                        onClick={() => handleArchive(contract.contract_number)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 10px', fontSize: '0.75rem', width: 'auto' }}
                                                        title="Arquivar"
                                                    >
                                                        📦
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Archived Contracts Tab */}
            {activeTab === 'archived' && (
                <div className="card">
                    <h3 className="mb-3">📦 Contratos Arquivados</h3>

                    <form onSubmit={handleSearch} className="form-grid mb-4">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Digite o nome do cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">
                            Buscar
                        </button>
                    </form>

                    {/* Tags filter */}
                    {allTags.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>Tags existentes: </span>
                            {allTags.map(tag => (
                                <span
                                    key={tag}
                                    style={{
                                        display: 'inline-block',
                                        padding: '2px 8px',
                                        margin: '2px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        color: '#555'
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {contracts.length === 0 ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                            Nenhum contrato arquivado.
                        </p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nº Contrato</th>
                                        <th>Cliente</th>
                                        <th>Plano</th>
                                        <th>Tags</th>
                                        <th>Data</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contracts.map((contract) => (
                                        <tr key={contract.id}>
                                            <td>{contract.contract_number}</td>
                                            <td>{contract.nome}</td>
                                            <td>{contract.plano}</td>
                                            <td>
                                                {editingTagsFor === contract.contract_number ? (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <input
                                                            type="text"
                                                            value={newTags}
                                                            onChange={(e) => setNewTags(e.target.value)}
                                                            placeholder="tag1, tag2"
                                                            style={{ width: '100px', padding: '4px', fontSize: '0.8rem' }}
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateTags(contract.contract_number)}
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingTagsFor(null); setNewTags(''); }}
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        onClick={() => { setEditingTagsFor(contract.contract_number); setNewTags(contract.tags || ''); }}
                                                        style={{ cursor: 'pointer', color: contract.tags ? '#666' : '#bbb' }}
                                                        title="Clique para editar tags"
                                                    >
                                                        {contract.tags || '+ adicionar'}
                                                    </span>
                                                )}
                                            </td>
                                            <td>{new Date(contract.created_at).toLocaleDateString('pt-PT')}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    <a
                                                        href={`/api/contracts/${contract.contract_number}/pdf`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 10px', fontSize: '0.75rem', width: 'auto' }}
                                                    >
                                                        📄
                                                    </a>
                                                    <button
                                                        onClick={() => handleRestore(contract.contract_number)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 10px', fontSize: '0.75rem', width: 'auto' }}
                                                        title="Restaurar"
                                                    >
                                                        ↩️
                                                    </button>
                                                    {showDeleteConfirm === contract.contract_number ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleDelete(contract.contract_number)}
                                                                style={{
                                                                    padding: '6px 10px',
                                                                    fontSize: '0.75rem',
                                                                    backgroundColor: '#e53935',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Confirmar
                                                            </button>
                                                            <button
                                                                onClick={() => setShowDeleteConfirm(null)}
                                                                style={{
                                                                    padding: '6px 10px',
                                                                    fontSize: '0.75rem',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(contract.contract_number)}
                                                            className="btn btn-secondary"
                                                            style={{
                                                                padding: '6px 10px',
                                                                fontSize: '0.75rem',
                                                                width: 'auto',
                                                                backgroundColor: '#ffebee',
                                                                color: '#c62828'
                                                            }}
                                                            title="Excluir permanentemente"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="card">
                    <h3 className="mb-3">⚙️ Dados da Contratada</h3>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                        Estes dados aparecerão no cabeçalho e corpo de todos os novos contratos.
                    </p>

                    <form onSubmit={handleSaveSettings}>
                        <div className="form-group">
                            <label className="form-label">Nome da Contratada/Empresa</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settings.contratada_nome}
                                onChange={(e) => setSettings({ ...settings, contratada_nome: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">NIF</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settings.contratada_nif}
                                onChange={(e) => setSettings({ ...settings, contratada_nif: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Endereço Completo</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settings.contratada_endereco}
                                onChange={(e) => setSettings({ ...settings, contratada_endereco: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
