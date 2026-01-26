"""
Sistema de Contratos - Clube + Estética 3.0
Micaela Sampaio - Estética Avançada

Interface Premium para Gestão de Contratos
"""

import streamlit as st
from streamlit_drawable_canvas import st_canvas
import pandas as pd
from datetime import datetime
import base64
from io import BytesIO

from database import Database
from pdf_generator import generate_contract_pdf
from contract_text import PLANOS, get_contrato_completo

# Configuração da página
st.set_page_config(
    page_title="Micaela Sampaio | Clube + Estética 3.0",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# CSS Premium - Estética Luxury
st.markdown("""
<style>
    /* Importar Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
    
    /* Remover elementos padrão do Streamlit */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Fundo e cores globais */
    .stApp {
        background-color: #FAFAF9;
    }
    
    /* Estilo de texto global */
    * {
        font-family: 'Montserrat', sans-serif;
        color: #333333;
    }
    
    /* Títulos elegantes */
    h1, h2, h3 {
        font-family: 'Playfair Display', serif;
        color: #333333;
    }
    
    h1 {
        font-size: 2.5rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 1rem;
    }
    
    h2 {
        font-size: 1.8rem;
        font-weight: 600;
        margin-top: 2rem;
    }
    
    h3 {
        font-size: 1.4rem;
        font-weight: 600;
    }
    
    /* Estilo de inputs */
    .stTextInput > div > div > input,
    .stSelectbox > div > div > select,
    .stTextArea > div > div > textarea {
        border-radius: 8px !important;
        border: 1px solid #CCCCCC !important; /* Cinza mais suave */
        padding: 12px 16px !important;
        font-size: 1rem !important;
        font-weight: 500 !important;
        background-color: #FFFFFF !important;
        color: #222222 !important; /* Preto suave para leitura */
        caret-color: #D4AF37;
        box-shadow: none !important; /* Remover sombras escuras */
        transition: border 0.2s ease !important;
    }

    /* FIX CRÍTICO: Forçar fundo branco no Autocomplete do Navegador */
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px white inset !important;
        -webkit-text-fill-color: #222222 !important;
        transition: background-color 5000s ease-in-out 0s;
    }

    /* Estilo do Placeholder */
    ::placeholder {
        color: #888888 !important;
        font-weight: 400 !important;
        opacity: 1;
    }
    
    input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {
        color: #888888 !important;
        font-weight: 400 !important;
    }
    
    .stTextInput > div > div > input:focus,
    .stSelectbox > div > div > select:focus,
    .stTextArea > div > div > textarea:focus {
        border-color: #D4AF37 !important;
        background-color: #FFFFFF !important;
        box-shadow: 0 0 0 1px #D4AF37 !important;
        outline: none !important;
        color: #222222 !important;
    }
    
    /* Labels dos inputs */
    .stTextInput > label,
    .stSelectbox > label,
    .stTextArea > label {
        font-family: 'Montserrat', sans-serif !important;
        font-weight: 600 !important;
        color: #222222 !important;
        font-size: 0.95rem !important;
        margin-bottom: 0.5rem !important;
    }

    /* FIX para o Canvas de Assinatura */
    iframe {
        background-color: #FFFFFF !important;
        border: 1px solid #E5E5E5 !important;
        border-radius: 12px !important;
    }
    
    /* Botões Premium */
    /* ========================================================= */
    /* BOTÕES - ESTILO GERAL E CARDS (DEFAULT)                  */
    /* ========================================================= */
    /* Por padrão, todo botão é um CARD BRANCO CLICÁVEL         */
    .stButton > button {
        background-color: #FFFFFF !important;
        color: #1A1A1A !important; /* Cor escura forte */
        border: 2px solid #E5E5E5 !important;
        border-radius: 12px !important;
        padding: 16px 20px !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        
        /* Layout flexível */
        width: 100% !important;
        height: auto !important;
        white-space: pre-wrap !important; /* Permitir quebras de linha */
        line-height: 1.4 !important;
        
        /* Sombra suave */
        box-shadow: 0 2px 6px rgba(0,0,0,0.05) !important;
        transition: all 0.2s ease-in-out !important;
    }

    /* Hover no card padrão */
    .stButton > button:hover {
        border-color: #D4AF37 !important; /* Borda dourada */
        background-color: #FFFCF5 !important; /* Fundo levemente creme */
        color: #D4AF37 !important; /* Texto dourado */
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15) !important;
    }

    /* Active/Click no card padrão */
    .stButton > button:active {
        background-color: #F8F8F8 !important;
        transform: translateY(1px) !important;
        box-shadow: none !important;
    }

    /* ========================================================= */
    /* BOTÕES DE AÇÃO PRINCIPAL (PRIMARY) - CONTINUAR/FINALIZAR  */
    /* ========================================================= */
    /* Alvo específico para botões type="primary" e fallback     */
    .stButton > button[kind="primary"],
    .stButton > button[data-testid="baseButton-primary"] {
        background: linear-gradient(135deg, #D4AF37 0%, #C5A065 100%) !important;
        color: #FFFFFF !important;
        border: none !important;
        border-radius: 30px !important; /* Mais arredondado */
        padding: 14px 40px !important;  
        
        text-transform: uppercase !important;
        letter-spacing: 1.5px !important;
        font-weight: 700 !important;
        
        box-shadow: 0 6px 16px rgba(212, 175, 55, 0.3) !important;
    }

    /* Hover no botão primário */
    .stButton > button[kind="primary"]:hover,
    .stButton > button[data-testid="baseButton-primary"]:hover {
        background: linear-gradient(135deg, #E5C048 0%, #D4AF37 100%) !important;
        box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4) !important;
        transform: translateY(-3px) !important;
        color: #FFFFFF !important;
        border: none !important;
    }
    
    /* Radio buttons - Seleção de planos */
    .stRadio > div {
        background-color: #FFFFFF;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.08);
    }
    
    .stRadio > div > label {
        font-weight: 600 !important;
        font-size: 1.1rem !important;
        color: #333333 !important;
        margin-bottom: 1rem !important;
    }
    
    /* Container de sucesso */
    .success-box {
        background: linear-gradient(135deg, #D4AF37 0%, #C5A065 100%);
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        color: #FFFFFF;
        box-shadow: 0 8px 16px rgba(212, 175, 55, 0.3);
        margin: 2rem 0;
    }
    
    .success-box h2 {
        color: #FFFFFF;
        margin-bottom: 1rem;
    }
    
    /* Caixa de economia */
    .economia-box {
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        padding: 1.5rem;
        border-radius: 15px;
        text-align: center;
        color: #FFFFFF;
        margin: 1.5rem 0;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        animation: slideIn 0.5s ease;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .economia-box p {
        color: #FFFFFF;
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0;
    }
    
    /* Container do contrato */
    .contrato-box {
        background-color: #F5F5F5;
        padding: 2rem;
        border-radius: 15px;
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #E5E5E5;
        margin: 1rem 0;
        font-size: 0.9rem;
        line-height: 1.6;
    }
    
    /* Canvas de assinatura */
    .signature-canvas {
        border: 2px dashed #D4AF37 !important;
        border-radius: 10px !important;
        background-color: #FFFFFF !important;
    }
    
    /* Tabela do admin */
    .dataframe {
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    /* Link do admin */
    .admin-link {
        position: fixed;
        bottom: 20px;
        right: 20px;
        font-size: 0.8rem;
        color: #999999;
        text-decoration: none;
        padding: 8px 16px;
        background-color: #FFFFFF;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }
    
    .admin-link:hover {
        color: #D4AF37;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    /* Espaçamento */
    .block-container {
        padding-top: 3rem;
        padding-bottom: 3rem;
    }
    
    /* Step indicator */
    .step-indicator {
        text-align: center;
        color: #999999;
        font-size: 0.9rem;
        margin-bottom: 2rem;
        text-transform: uppercase;
        letter-spacing: 2px;
    }
    
    /* Botão de Download - Estilo Premium Dourado */
    .stDownloadButton > button {
        background: linear-gradient(135deg, #D4AF37 0%, #C5A065 100%) !important;
        color: #FFFFFF !important;
        border: none !important;
        border-radius: 25px !important;
        padding: 14px 32px !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3) !important;
        transition: all 0.3s ease !important;
        width: 100% !important;
        margin-top: 1rem !important;
    }
    
    .stDownloadButton > button:hover {
        background: linear-gradient(135deg, #C5A065 0%, #B8935A 100%) !important;
        box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4) !important;
        transform: translateY(-2px) !important;
    }
    
    .stDownloadButton > button:active {
        transform: translateY(0) !important;
    }
</style>
""", unsafe_allow_html=True)

# Inicializar banco de dados
db = Database()

# Inicializar session state
if 'view' not in st.session_state:
    st.session_state.view = 'client'
if 'step' not in st.session_state:
    st.session_state.step = 'identity'
if 'form_data' not in st.session_state:
    st.session_state.form_data = {}
if 'contract_number' not in st.session_state:
    st.session_state.contract_number = None

# Funções auxiliares
def reset_client_flow():
    """Reinicia o fluxo do cliente"""
    st.session_state.step = 'identity'
    st.session_state.form_data = {}
    st.session_state.contract_number = None

def get_plan_card(plan_name: str, info: dict) -> str:
    """Gera o HTML do card de plano"""
    economia_text = ""
    if info.get('economia_anual', 0) > 0:
        economia_text = f" - Economize {info['economia_anual']}€/ano"
    
    return f"""
    <div style="
        background: white;
        padding: 1.5rem;
        border-radius: 15px;
        margin: 0.5rem 0;
        box-shadow: 0 4px 6px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
    ">
        <h3 style="color: #D4AF37; margin-top: 0;">{info['nome_display']}</h3>
        <p style="font-size: 1.8rem; font-weight: 600; color: #333333; margin: 0.5rem 0;">
            {info['valor_mensal']}€/mês
        </p>
        <p style="color: #666666; margin: 0;">
            {info['descricao']}{economia_text}
        </p>
    </div>
    """

# ============================================
# VISUALIZAÇÃO PRINCIPAL
# ============================================

if st.session_state.view == 'admin':
    # ============================================
    # AREA ADMINISTRATIVA
    # ============================================
    col_logo, col_logout = st.columns([6, 1])
    with col_logo:
        st.title("Painel Admin 🔐")
    with col_logout:
        if st.button("Sair", key="btn_logout"):
            st.session_state.view = 'client'
            st.session_state.step = 'identity'
            st.rerun()
            
    # Navegação por Abas (Melhor que sidebar neste caso)
    tab_contratos, tab_config = st.tabs(["📋 Contratos Gerados", "⚙️ Configurações da Empresa"])

    with tab_contratos:
        st.markdown("### 🔍 Pesquisar Contratos")
        
        # Filtro de busca
        search = st.text_input("Buscar por nome do cliente", label_visibility="collapsed", placeholder="Digite o nome do cliente...")
        
        if search:
            contracts = db.search_contracts(search)
        else:
            contracts = db.get_all_contracts()
            
        if not contracts:
            st.info("Nenhum contrato encontrado.")
        else:
            # Exibir tabela simplificada
            df_display = pd.DataFrame(contracts)
            st.dataframe(
                df_display[['contract_number', 'nome', 'plano', 'created_at']],
                column_config={
                    "contract_number": "Nº Contrato",
                    "nome": "Cliente",
                    "plano": "Plano",
                    "created_at": "Data"
                },
                hide_index=True,
                use_container_width=True
            )
            
            st.markdown("---")
            st.markdown("### 📥 Baixar Contrato")
            contract_numbers = [c['contract_number'] for c in contracts]
            selected_contract = st.selectbox("Selecione o contrato", contract_numbers)
            
            if st.button("Gerar PDF"):
                contract_data = db.get_contract_by_number(selected_contract)
                if contract_data:
                    contract_data['numero_contrato'] = contract_data['contract_number']
                    
                    # Injetar dados da contratada do banco
                    contratada_info = {
                        'contratada_nome': db.get_setting('contratada_nome'),
                        'contratada_nif': db.get_setting('contratada_nif'),
                        'contratada_endereco': db.get_setting('contratada_endereco')
                    }
                    contract_data.update(contratada_info)
                    
                    pdf_bytes = generate_contract_pdf(contract_data)
                    
                    st.download_button(
                        label="⬇️ Baixar PDF",
                        data=pdf_bytes,
                        file_name=f"{selected_contract}.pdf",
                        mime="application/pdf",
                        type="primary"
                    )
    
    with tab_config:
        st.markdown("### ⚙️ Dados da Contratada")
        st.markdown("Estes dados aparecerão no cabeçalho e corpo de todos os novos contratos.")
        
        with st.form("settings_form"):
            c_nome = st.text_input("Nome da Contratada/Empresa", value=db.get_setting('contratada_nome'))
            c_nif = st.text_input("NIF", value=db.get_setting('contratada_nif'))
            c_endereco = st.text_input("Endereço Completo", value=db.get_setting('contratada_endereco'))
            
            if st.form_submit_button("Salvar Alterações", type="primary"):
                db.set_setting('contratada_nome', c_nome)
                db.set_setting('contratada_nif', c_nif)
                db.set_setting('contratada_endereco', c_endereco)
                st.success("✅ Dados atualizados com sucesso!")
                st.rerun()

else:
    # ============================================
    # FLUXO DO CLIENTE
    # ============================================
    
    # Logo e Header
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 3rem; margin-bottom: 0.5rem;">
            ✨ Micaela Sampaio
        </h1>
        <p style="font-size: 1.3rem; color: #666666; font-style: italic;">
            Bem-vinda ao Clube + Estética 3.0
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # ============================================
    # STEP 1: IDENTIFICAÇÃO
    # ============================================
    if st.session_state.step == 'identity':
        st.markdown('<p class="step-indicator">Etapa 1 de 3 - Seus Dados</p>', unsafe_allow_html=True)
        
        st.markdown("### Vamos começar com suas informações")
        
        col1, col2 = st.columns(2)
        
        with col1:
            nome = st.text_input("Nome Completo *", placeholder="Maria Silva")
            nif = st.text_input("NIF *", placeholder="123456789")
            email = st.text_input("Email *", placeholder="maria@exemplo.com")
        
        with col2:
            whatsapp = st.text_input("WhatsApp *", placeholder="+351 912 345 678")
            endereco = st.text_input("Endereço Completo *", placeholder="Rua, Número, Cidade")
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        if st.button("CONTINUAR", type="primary"):
            # Validação simples
            if not all([nome, nif, email, whatsapp, endereco]):
                st.error("Por favor, preencha todos os campos obrigatórios.")
            else:
                st.session_state.form_data.update({
                    'nome': nome,
                    'nif': nif,
                    'email': email,
                    'whatsapp': whatsapp,
                    'endereco': endereco
                })
                st.session_state.step = 'plan'
                st.rerun()
    
    # ============================================
    # STEP 2: SELEÇÃO DE PLANO
    # ============================================
    elif st.session_state.step == 'plan':
        st.markdown('<p class="step-indicator">Etapa 2 de 3 - Escolha Seu Plano</p>', unsafe_allow_html=True)
        
        st.markdown("### Escolha o plano ideal para você")
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Grid de Planos Clicáveis
        col1, col2 = st.columns(2)
        cols = [col1, col2]
        
        # Iterar sobre os planos e criar botões
        for i, (key, info) in enumerate(PLANOS.items()):
            with cols[i % 2]:
                # Criar label formatada
                label = f"{info['nome_display']}\n{info['valor_mensal']}€/mês"
                if info.get('economia_anual'):
                    label += f"\n(Economia: {info['economia_anual']}€)"
                
                # Botão Card (Secondary) que seleciona e avança
                if st.button(label, key=f"btn_{key}", use_container_width=True, type="secondary"):
                    st.session_state.form_data['plano'] = key
                    st.session_state.step = 'signature'
                    st.rerun()
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        if st.button("⬅️ VOLTAR"):
            st.session_state.step = 'identity'
            st.rerun()
    
    # ============================================
    # STEP 3: CONTRATO E ASSINATURA
    # ============================================
    elif st.session_state.step == 'signature':
        st.markdown('<p class="step-indicator">Etapa 3 de 3 - Assinatura</p>', unsafe_allow_html=True)
        
        st.markdown("### Revise e assine seu contrato")
        
        # Gerar número de contrato temporário para visualização
        temp_contract_data = st.session_state.form_data.copy()
        temp_contract_data['numero_contrato'] = 'CTR-2024-PREVIEW'
        
        # Injetar dados da contratada do banco para o preview
        contratada_info = {
            'contratada_nome': db.get_setting('contratada_nome'),
            'contratada_nif': db.get_setting('contratada_nif'),
            'contratada_endereco': db.get_setting('contratada_endereco')
        }
        temp_contract_data.update(contratada_info)
        
        # Mostrar contrato
        contrato_texto = get_contrato_completo(temp_contract_data)
        st.markdown(f'<div class="contrato-box">{contrato_texto.replace(chr(10), "<br>")}</div>', unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown("### ✍️ Assine aqui")
        
        # Canvas de assinatura
        canvas_result = st_canvas(
            fill_color="rgba(255, 255, 255, 0)",
            stroke_width=3,
            stroke_color="#333333",
            background_color="#FFFFFF",
            height=200,
            width=600,
            drawing_mode="freedraw",
            key="signature_canvas",
        )
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("⬅️ VOLTAR"):
                st.session_state.step = 'plan'
                st.rerun()
        
        with col2:
            if st.button("FINALIZAR ADESÃO", type="primary"):
                # Validar assinatura
                if canvas_result.image_data is None:
                    st.error("Por favor, assine o contrato antes de finalizar.")
                else:
                    # Converter assinatura para base64
                    from PIL import Image
                    import io
                    
                    img = Image.fromarray(canvas_result.image_data.astype('uint8'), 'RGBA')
                    buffered = io.BytesIO()
                    img.save(buffered, format="PNG")
                    signature_base64 = base64.b64encode(buffered.getvalue()).decode()
                    signature_data = f"data:image/png;base64,{signature_base64}"
                    
                    # Salvar no banco de dados
                    contract_number = db.create_contract(
                        nome=st.session_state.form_data['nome'],
                        nif=st.session_state.form_data['nif'],
                        whatsapp=st.session_state.form_data['whatsapp'],
                        email=st.session_state.form_data['email'],
                        endereco=st.session_state.form_data['endereco'],
                        plano=st.session_state.form_data['plano'],
                        signature_data=signature_data
                    )
                    
                    st.session_state.contract_number = contract_number
                    st.session_state.step = 'success'
                    st.rerun()
    
    # ============================================
    # STEP 4: SUCESSO
    # ============================================
    elif st.session_state.step == 'success':
        st.balloons()
        
        st.markdown(f"""
        <div class="success-box">
            <h1 style="color: #FFFFFF;">🎉 Parabéns!</h1>
            <h2 style="color: #FFFFFF;">Sua adesão foi concluída com sucesso!</h2>
            <p style="color: #FFFFFF; font-size: 1.2rem; margin-top: 1rem;">
                Número do Contrato: <strong>{st.session_state.contract_number}</strong>
            </p>
            <p style="color: #FFFFFF; margin-top: 1rem;">
                Bem-vinda ao Clube + Estética 3.0! 💎
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Gerar PDF para download
        contract_data = db.get_contract_by_number(st.session_state.contract_number)
        if contract_data:
            contract_data['numero_contrato'] = contract_data['contract_number']
            
            # Injetar dados da contratada do banco para o PDF final
            contratada_info = {
                'contratada_nome': db.get_setting('contratada_nome'),
                'contratada_nif': db.get_setting('contratada_nif'),
                'contratada_endereco': db.get_setting('contratada_endereco')
            }
            contract_data.update(contratada_info)
            
            pdf_bytes = generate_contract_pdf(contract_data)
            
            col1, col2, col3 = st.columns([1, 2, 1])
            with col2:
                # Usar st.download_button nativo do Streamlit (mais confiável)
                if pdf_bytes and len(pdf_bytes) > 0:
                    file_name = f"Contrato_{st.session_state.contract_number}.pdf"
                    
                    st.download_button(
                        label="📄 BAIXAR MEU CONTRATO",
                        data=pdf_bytes,
                        file_name=file_name,
                        mime="application/pdf",
                        use_container_width=True,
                        type="primary"
                    )
                else:
                    st.error("❌ Erro ao gerar contrato. Por favor, entre em contato com o suporte.")
                
                st.markdown("<br>", unsafe_allow_html=True)
                
                if st.button("✨ FAZER NOVA ADESÃO", use_container_width=True):
                    reset_client_flow()
                    st.rerun()
    
    # Link para admin (discreto)
    if st.session_state.step == 'identity':
        st.markdown("""
        <a href="?admin=true" class="admin-link">🔐 Admin</a>
        """, unsafe_allow_html=True)
        
        # Verificar se clicou no link de admin
        query_params = st.query_params
        if 'admin' in query_params:
            # Solicitar senha
            st.markdown("---")
            st.markdown("### 🔐 Acesso Administrativo")
            senha = st.text_input("Senha de administrador:", type="password")
            
            if st.button("Entrar"):
                # Senha padrão (pode ser alterada)
                if senha == "admin123":
                    st.session_state.view = 'admin'
                    st.query_params.clear()
                    st.rerun()
                else:
                    st.error("Senha incorreta!")
