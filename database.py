"""
Gerenciamento do banco de dados SQLite
"""
import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
import base64

class Database:
    def __init__(self, db_name: str = "contratos.db"):
        self.db_name = db_name
        self.init_database()
    
    def get_connection(self):
        """Cria uma conexão com o banco de dados"""
        return sqlite3.connect(self.db_name)
    
    def init_database(self):
        """Inicializa o banco de dados e cria a tabela se não existir"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def generate_contract_number(self) -> str:
        """Gera um número de contrato único no formato CTR-2024-XXXX"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        year = datetime.now().year
        cursor.execute(
            "SELECT COUNT(*) FROM contracts WHERE contract_number LIKE ?",
            (f"CTR-{year}-%",)
        )
        count = cursor.fetchone()[0]
        conn.close()
        
        next_number = count + 1
        return f"CTR-{year}-{next_number:04d}"
    
    def create_contract(
        self,
        nome: str,
        nif: str,
        whatsapp: str,
        email: str,
        endereco: str,
        plano: str,
        signature_data: Optional[str] = None
    ) -> str:
        """
        Cria um novo contrato no banco de dados
        Retorna o número do contrato gerado
        """
        contract_number = self.generate_contract_number()
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO contracts 
            (contract_number, nome, nif, whatsapp, email, endereco, plano, signature_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (contract_number, nome, nif, whatsapp, email, endereco, plano, signature_data))
        
        conn.commit()
        conn.close()
        
        return contract_number
    
    def get_all_contracts(self) -> List[Dict]:
        """Retorna todos os contratos do banco de dados"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, contract_number, nome, nif, whatsapp, email, 
                   endereco, plano, created_at
            FROM contracts
            ORDER BY created_at DESC
        ''')
        
        columns = [description[0] for description in cursor.description]
        results = []
        
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        
        conn.close()
        return results
    
    def search_contracts(self, name: str) -> List[Dict]:
        """Busca contratos por nome do cliente"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, contract_number, nome, nif, whatsapp, email, 
                   endereco, plano, created_at
            FROM contracts
            WHERE nome LIKE ?
            ORDER BY created_at DESC
        ''', (f"%{name}%",))
        
        columns = [description[0] for description in cursor.description]
        results = []
        
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        
        conn.close()
        return results
    
    def get_contract_by_number(self, contract_number: str) -> Optional[Dict]:
        """Retorna um contrato específico pelo número"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, contract_number, nome, nif, whatsapp, email, 
                   endereco, plano, signature_data, created_at
            FROM contracts
            WHERE contract_number = ?
        ''', (contract_number,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            columns = ['id', 'contract_number', 'nome', 'nif', 'whatsapp', 
                      'email', 'endereco', 'plano', 'signature_data', 'created_at']
            return dict(zip(columns, row))
        
        return None
