"""
Gerador de PDF para contratos - Versão Profissional e Estruturada
"""
from fpdf import FPDF
from datetime import datetime
import base64
from io import BytesIO
from PIL import Image
from contract_text import get_contrato_completo
import os

# Caminho para assets
ASSETS_DIR = "assets"
MICAELA_SIGNATURE_PATH = os.path.join(ASSETS_DIR, "assinatura_micaela.png")

class ContractPDF(FPDF):
    def __init__(self, orientation='P', unit='mm', format='A4', signature_data=None):
        super().__init__(orientation, unit, format)
        self.signature_data = signature_data # Dados da assinatura do cliente (base64)
    
    def header(self):
        # Logo/Marca Dourada
        self.set_font('Arial', 'B', 16)
        self.set_text_color(212, 175, 55) # Dourado
        self.cell(0, 10, 'MICAELA SAMPAIO', 0, 1, 'C')
        
        self.set_font('Arial', 'I', 10)
        self.set_text_color(100, 100, 100) # Cinza
        self.cell(0, 5, 'CLUBE + ESTETICA 3.0', 0, 1, 'C')
        
        # Linha separadora
        self.set_draw_color(212, 175, 55)
        self.line(20, 25, 190, 25)
        self.ln(15)

    def footer(self):
        self.set_y(-25) # Mais espaço para rubricas
        
        # --- RUBRICAS ---
        # Rubrica Cliente (Esquerda)
        if self.signature_data:
            try:
                sign_img = get_image_from_base64(self.signature_data)
                if sign_img:
                    # Salvar temp
                    temp_rubrica = '/tmp/rubrica_cliente.png'
                    sign_img.save(temp_rubrica, 'PNG')
                    # Renderizar pequena rubrica
                    self.image(temp_rubrica, x=20, y=self.get_y(), w=15)
            except Exception as e:
                pass # Ignorar erro de rubrica silenciosamente

        # Rubrica Micaela (Direita)
        if os.path.exists(MICAELA_SIGNATURE_PATH):
            try:
                self.image(MICAELA_SIGNATURE_PATH, x=175, y=self.get_y(), w=15)
            except:
                pass

        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Pagina {self.page_no()}/{{nb}}', 0, 0, 'C')

def get_image_from_base64(base64_string):
    """Converte string base64 em objeto PIL Image"""
    try:
        if ',' in base64_string:
            signature_bytes = base64.b64decode(base64_string.split(',')[1])
        else:
            signature_bytes = base64.b64decode(base64_string)
        return Image.open(BytesIO(signature_bytes))
    except:
        return None

def generate_contract_pdf(contract_data: dict) -> bytes:
    """
    Gera um PDF do contrato profissional e estruturado
    
    Args:
        contract_data: Dicionário com os dados do contrato
        
    Returns:
        bytes: PDF em formato bytes
    """
    try:
        # Criar PDF
        signature_data = contract_data.get('signature_data')
        pdf = ContractPDF('P', 'mm', 'A4', signature_data=signature_data)
        pdf.alias_nb_pages()
        pdf.add_page()
        pdf.set_margins(20, 20, 20)
        pdf.set_auto_page_break(auto=True, margin=35) # Margem maior para footer caber rubricas
        
        # Título do Documento
        pdf.set_font('Arial', 'B', 14)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 10, 'CONTRATO DE ADESAO', 0, 1, 'C')
        
        # Número do contrato
        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(212, 175, 55)
        pdf.cell(0, 6, f"N. {contract_data.get('numero_contrato', '')}", 0, 1, 'C')
        pdf.ln(10)
        
        # --- BOX DE DADOS DO CLIENTE ---
        pdf.set_fill_color(250, 250, 250)
        pdf.set_draw_color(230, 230, 230)
        pdf.rect(20, pdf.get_y(), 170, 45, 'DF')
        
        pdf.set_xy(25, pdf.get_y() + 5)
        pdf.set_font('Arial', 'B', 10)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 6, 'DADOS DO(A) CONTRATANTE', 0, 1, 'L')
        
        pdf.set_font('Arial', '', 9)
        pdf.set_x(25)
        nome = contract_data.get('nome', '').encode('latin-1', 'replace').decode('latin-1')
        pdf.cell(20, 6, 'Nome:', 0, 0)
        pdf.cell(0, 6, nome, 0, 1)
        
        pdf.set_x(25)
        nif = contract_data.get('nif', '')
        pdf.cell(20, 6, 'NIF:', 0, 0)
        pdf.cell(0, 6, nif, 0, 1)
        
        pdf.set_x(25)
        email = contract_data.get('email', '')
        pdf.cell(20, 6, 'Email:', 0, 0)
        pdf.cell(0, 6, email, 0, 1)
        
        pdf.set_x(25)
        whatsapp = contract_data.get('whatsapp', '')
        pdf.cell(20, 6, 'WhatsApp:', 0, 0)
        pdf.cell(0, 6, whatsapp, 0, 1)
        
        pdf.set_x(25)
        endereco = contract_data.get('endereco', '').encode('latin-1', 'replace').decode('latin-1')
        pdf.cell(20, 6, 'Endereco:', 0, 0)
        pdf.cell(0, 6, endereco[:60], 0, 1) # Trunca endereço muito longo para caber na box
        
        pdf.set_y(pdf.get_y() + 10) # Sair da box
        
        # Texto do contrato
        texto_contrato = get_contrato_completo(contract_data)
        
        # Processar o texto com inteligência
        linhas = texto_contrato.split('\n')
        ignore_next_lines = False # Flag para pular seções que renderizamos manualmente (como dados do cliente)
        
        for linha in linhas:
            linha_raw = linha
            linha = linha.strip()
            
            # Pular cabeçalho ASCII antigo se ainda estiver no texto
            if "CONTRATADA:" in linha and "MICAELA" in linha:
                ignore_next_lines = True
                continue
            if "Doravante denominado" in linha:
                ignore_next_lines = False
                continue
            if ignore_next_lines:
                continue
                
            # Pular linhas de tabela ASCII e separadores
            if set(linha).issubset({'-', '|', ' ', '+'}):
                continue
            if linha.count('|') >= 2 and "Plano" in linha and "Valor" in linha: # Cabeçalho da tabela
                # Renderizar Tabela Real
                render_comparison_table(pdf)
                continue
            if linha.count('|') >= 2: # Linhas da tabela
                continue
                
            # Renderizar Títulos e Cláusulas
            if 'CLAUSULA' in linha.upper():
                pdf.ln(5)
                pdf.set_font('Arial', 'B', 10)
                pdf.set_text_color(0, 0, 0)
                # Formatar Clausula X - TITULO
                parts = linha.split('-', 1)
                if len(parts) == 2:
                    pdf.cell(0, 6, parts[0].strip(), 0, 1, 'L')
                    pdf.cell(0, 6, parts[1].strip(), 0, 1, 'L')
                else:
                     pdf.cell(0, 6, linha, 0, 1, 'L')
                pdf.set_font('Arial', '', 9)
                pdf.ln(2)
                continue
            
            # Subtítulos (ex: 2.1. Quadro...)
            if linha and (linha[0].isdigit() and '.' in linha[:5]) or linha.isupper():
                if len(linha) < 100: # Evitar confundir texto longo em caps lock
                   pdf.ln(2)
                   pdf.set_font('Arial', 'B', 9)
                   try:
                       pdf.cell(0, 5, linha.encode('latin-1', 'replace').decode('latin-1'), 0, 1)
                   except:
                       pdf.cell(0, 5, linha.encode('ascii', 'replace').decode('ascii'), 0, 1)
                   pdf.set_font('Arial', '', 9)
                   continue

            # Texto normal
            if not linha:
                pdf.ln(2)
                continue
                
            # Tratamento de encoding e width
            try:
                safe_text = linha.encode('latin-1', 'replace').decode('latin-1')
            except:
                safe_text = linha.encode('ascii', 'replace').decode('ascii')
                
            if len(safe_text) > 300: # Segurança extrema
                safe_text = safe_text[:300]
            
            # Garantir que estamos na margem esquerda para ter largura total
            pdf.set_x(20)
            try:
                pdf.multi_cell(0, 5, safe_text)
            except Exception as e:
                # Fallback: tentar reduzir fonte ou apenas truncar
                print(f"Erro linha PDF: {e}")
                try:
                    pdf.set_font('Arial', '', 8)
                    pdf.multi_cell(0, 5, safe_text)
                    pdf.set_font('Arial', '', 9)
                except:
                    pass
        
        # Assinaturas (sempre numa nova página se estiver no fim)
        if pdf.get_y() > 220:
            pdf.add_page()
        else:
            pdf.ln(10)
            
        render_signatures(pdf, contract_data)
        
        return bytes(pdf.output())
        
    except Exception as e:
        print(f"ERRO CRITICO AO GERAR PDF: {e}")
        import traceback
        traceback.print_exc()
        return b''

def render_comparison_table(pdf):
    """Renderiza a tabela comparativa de preços"""
    pdf.ln(5)
    
    # Configurações da tabela
    col_widths = [35, 35, 35, 35, 35]
    headers = ['Plano', 'Sessoes', 'V. Mercado', 'V. Clube', 'Poupanca']
    
    # Header
    pdf.set_font('Arial', 'B', 8)
    pdf.set_fill_color(240, 240, 240)
    pdf.set_text_color(0, 0, 0)
    for i, h in enumerate(headers):
        pdf.cell(col_widths[i], 8, h, 1, 0, 'C', True)
    pdf.ln()
    
    # Dados
    rows = [
        ['BASIC', '2 sessoes', '120 EUR', '75 EUR', '45 EUR/mes'],
        ['PREMIUM', '4 sessoes', '240 EUR', '120 EUR', '120 EUR/mes']
    ]
    
    pdf.set_font('Arial', '', 8)
    for row in rows:
        for i, data in enumerate(row):
            pdf.cell(col_widths[i], 8, data, 1, 0, 'C')
        pdf.ln()
    
    pdf.ln(5)
    pdf.set_font('Arial', '', 9)

def render_signatures(pdf, contract_data):
    """Renderiza a seção de assinaturas"""
    pdf.ln(10)
    # Fundo cinza claro para a área de assinatura
    y_start = pdf.get_y()
    pdf.set_fill_color(252, 252, 252)
    # pdf.rect(20, y_start, 170, 60, 'F')
    
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(0, 10, 'ASSINATURAS', 0, 1, 'C')
    pdf.ln(5)
    
    # Assinatura Cliente (Esquerda)
    signature_data = contract_data.get('signature_data')
    if signature_data:
        try:
            sign_img = get_image_from_base64(signature_data)
            temp_path = '/tmp/signature.png'
            sign_img.save(temp_path, 'PNG')
            
            # Centralizar imagem na esquerda
            pdf.image(temp_path, x=45, y=pdf.get_y(), w=40)
        except Exception as e:
            print(f"Erro assinatura cliente: {e}")
            
    # Assinatura Micaela (Direita) - Fixa
    if os.path.exists(MICAELA_SIGNATURE_PATH):
        try:
             # Ajustar posição Y para alinhar com a do cliente
             y_pos_micaela = pdf.get_y() 
             pdf.image(MICAELA_SIGNATURE_PATH, x=135, y=y_pos_micaela, w=40)
        except Exception as e:
            print(f"Erro assinatura micaela: {e}")
            
    
    pdf.ln(25) # Espaço para assinatura
    
    # Linhas
    y_line = pdf.get_y()
    pdf.line(30, y_line, 90, y_line) # Cliente
    pdf.line(120, y_line, 180, y_line) # Empresa
    
    pdf.ln(2)
    pdf.set_font('Arial', '', 8)
    
    # Nomes abaixo da linha
    pdf.cell(75, 5, 'Cliente (Assinatura Digital)', 0, 0, 'C')
    pdf.cell(15, 5, '', 0, 0)
    pdf.cell(75, 5, 'Micaela Sampaio - Clube Estetica', 0, 1, 'C')
    
    pdf.ln(5)
    date_str = datetime.now().strftime('%d/%m/%Y %H:%M')
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 5, f'Assinado digitalmente em: {date_str}', 0, 1, 'C')
