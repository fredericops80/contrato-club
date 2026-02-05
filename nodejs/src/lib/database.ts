/**
 * Database connection and operations for contracts
 * Converted from Python database.py
 */
import Database from 'better-sqlite3';
import path from 'path';

// Database path
const DB_PATH = path.join(process.cwd(), 'contratos.db');

// Get database instance (singleton pattern for connection reuse)
let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
    if (!dbInstance) {
        dbInstance = new Database(DB_PATH);
        dbInstance.pragma('journal_mode = WAL');
        initDatabase(dbInstance);
    }
    return dbInstance;
}

function initDatabase(db: Database.Database) {
    // Create contracts table
    db.exec(`
    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_number TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      nif TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      endereco TEXT NOT NULL,
      plano TEXT NOT NULL,
      signature_data TEXT,
      status TEXT DEFAULT 'active',
      tags TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Add new columns if they don't exist (for existing databases)
    try {
        db.exec(`ALTER TABLE contracts ADD COLUMN status TEXT DEFAULT 'active'`);
    } catch (e) {
        // Column already exists, ignore
    }
    try {
        db.exec(`ALTER TABLE contracts ADD COLUMN tags TEXT DEFAULT ''`);
    } catch (e) {
        // Column already exists, ignore
    }

    // Create settings table
    db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

    // Insert default settings if not exist
    const defaultSettings = {
        'contratada_nome': 'MICAELA SAMPAIO',
        'contratada_nif': 'NIF_PENDENTE',
        'contratada_endereco': 'ENDERECO_PENDENTE'
    };

    const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(defaultSettings)) {
        insertSetting.run(key, value);
    }
}

// Contract interface
export interface Contract {
    id: number;
    contract_number: string;
    nome: string;
    nif: string;
    whatsapp: string;
    email: string;
    endereco: string;
    plano: string;
    signature_data?: string;
    status: 'active' | 'archived';
    tags: string;
    created_at: string;
}

export interface ContractInput {
    nome: string;
    nif: string;
    whatsapp: string;
    email: string;
    endereco: string;
    plano: string;
    signature_data?: string;
}

// Generate unique contract number
export function generateContractNumber(): string {
    const db = getDb();
    const year = new Date().getFullYear();
    const result = db.prepare(
        "SELECT COUNT(*) as count FROM contracts WHERE contract_number LIKE ?"
    ).get(`CTR-${year}-%`) as { count: number };

    const nextNumber = (result?.count || 0) + 1;
    return `CTR-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

// Create a new contract
export function createContract(data: ContractInput): string {
    const db = getDb();
    const contractNumber = generateContractNumber();

    db.prepare(`
    INSERT INTO contracts 
    (contract_number, nome, nif, whatsapp, email, endereco, plano, signature_data, status, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', '')
  `).run(
        contractNumber,
        data.nome,
        data.nif,
        data.whatsapp,
        data.email,
        data.endereco,
        data.plano,
        data.signature_data || null
    );

    return contractNumber;
}

// Get all contracts (with optional status filter)
export function getAllContracts(status?: 'active' | 'archived' | 'all'): Contract[] {
    const db = getDb();

    let query = `
        SELECT id, contract_number, nome, nif, whatsapp, email, 
               endereco, plano, status, tags, created_at
        FROM contracts
    `;

    if (status === 'active') {
        query += ` WHERE status = 'active' OR status IS NULL`;
    } else if (status === 'archived') {
        query += ` WHERE status = 'archived'`;
    }

    query += ` ORDER BY created_at DESC`;

    return db.prepare(query).all() as Contract[];
}

// Search contracts by name
export function searchContracts(name: string, status?: 'active' | 'archived' | 'all'): Contract[] {
    const db = getDb();

    let query = `
        SELECT id, contract_number, nome, nif, whatsapp, email, 
               endereco, plano, status, tags, created_at
        FROM contracts
        WHERE nome LIKE ?
    `;

    if (status === 'active') {
        query += ` AND (status = 'active' OR status IS NULL)`;
    } else if (status === 'archived') {
        query += ` AND status = 'archived'`;
    }

    query += ` ORDER BY created_at DESC`;

    return db.prepare(query).all(`%${name}%`) as Contract[];
}

// Get contract by number
export function getContractByNumber(contractNumber: string): Contract | null {
    const db = getDb();
    const result = db.prepare(`
    SELECT id, contract_number, nome, nif, whatsapp, email, 
           endereco, plano, signature_data, status, tags, created_at
    FROM contracts
    WHERE contract_number = ?
  `).get(contractNumber) as Contract | undefined;

    return result || null;
}

// Archive a contract
export function archiveContract(contractNumber: string): boolean {
    const db = getDb();
    const result = db.prepare(`
        UPDATE contracts SET status = 'archived' WHERE contract_number = ?
    `).run(contractNumber);
    return result.changes > 0;
}

// Restore a contract from archive
export function restoreContract(contractNumber: string): boolean {
    const db = getDb();
    const result = db.prepare(`
        UPDATE contracts SET status = 'active' WHERE contract_number = ?
    `).run(contractNumber);
    return result.changes > 0;
}

// Delete a contract permanently
export function deleteContract(contractNumber: string): boolean {
    const db = getDb();
    const result = db.prepare(`
        DELETE FROM contracts WHERE contract_number = ?
    `).run(contractNumber);
    return result.changes > 0;
}

// Update contract tags
export function updateContractTags(contractNumber: string, tags: string): boolean {
    const db = getDb();
    const result = db.prepare(`
        UPDATE contracts SET tags = ? WHERE contract_number = ?
    `).run(tags, contractNumber);
    return result.changes > 0;
}

// Get all unique tags
export function getAllTags(): string[] {
    const db = getDb();
    const contracts = db.prepare(`
        SELECT DISTINCT tags FROM contracts WHERE tags IS NOT NULL AND tags != ''
    `).all() as { tags: string }[];

    const allTags = new Set<string>();
    contracts.forEach(c => {
        if (c.tags) {
            c.tags.split(',').forEach(tag => {
                const trimmed = tag.trim();
                if (trimmed) allTags.add(trimmed);
            });
        }
    });

    return Array.from(allTags).sort();
}

// Get setting value
export function getSetting(key: string): string {
    const db = getDb();
    const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return result?.value || '';
}

// Set setting value
export function setSetting(key: string, value: string): void {
    const db = getDb();
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

// Get all settings (for company data)
export function getCompanySettings() {
    return {
        contratada_nome: getSetting('contratada_nome'),
        contratada_nif: getSetting('contratada_nif'),
        contratada_endereco: getSetting('contratada_endereco')
    };
}
