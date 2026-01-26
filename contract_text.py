"""
Configuração dos planos e texto do contrato
"""

# Configuração dos planos
PLANOS = {
    "BASIC - Semestral": {
        "nome_display": "BASIC (6 meses)",
        "sessoes": 2,
        "valor_mensal": 75,
        "periodo": "semestral",
        "fidelidade": 6,
        "descricao": "2 sessões/mês - Fidelidade 6 meses",
        "desconto_extras": "30%",
        "reagendamentos": 1
    },
    "BASIC - Anual": {
        "nome_display": "BASIC (12 meses)",
        "sessoes": 2,
        "valor_mensal": 60,
        "periodo": "anual",
        "fidelidade": 12,
        "descricao": "2 sessões/mês - Fidelidade 12 meses - Desconto Extra",
        "desconto_extras": "30%",
        "reagendamentos": 1,
        "economia_anual": 180  # 75-60 = 15€/mês x 12 = 180€
    },
    "PREMIUM - Semestral": {
        "nome_display": "PREMIUM (6 meses)",
        "sessoes": 4,
        "valor_mensal": 120,
        "periodo": "semestral",
        "fidelidade": 6,
        "descricao": "4 sessões/mês - Fidelidade 6 meses + Consultoria Skincare",
        "desconto_extras": "50%",
        "reagendamentos": 2
    },
    "PREMIUM - Anual": {
        "nome_display": "PREMIUM (12 meses)",
        "sessoes": 4,
        "valor_mensal": 100,
        "periodo": "anual",
        "fidelidade": 12,
        "descricao": "4 sessões/mês - Fidelidade 12 meses - Desconto Extra + Consultoria Skincare",
        "desconto_extras": "50%",
        "reagendamentos": 2,
        "economia_anual": 240  # 120-100 = 20€/mês x 12 = 240€
    }
}

# Texto base do contrato
CONTRATO_TEXTO = """
CONTRATO DE ADESAO
CLUBE + ESTETICA 3.0

Pelo presente instrumento particular, as partes abaixo qualificadas celebram este contrato de prestacao de servicos:

CONTRATADA: {contratada_nome}, NIF {contratada_nif}, com sede em {contratada_endereco}, doravante denominada apenas CONTRATADA.

CONTRATANTE: 
Nome: {nome}
NIF: {nif}
E-mail: {email}
WhatsApp: {whatsapp}
Endereco: {endereco}

Doravante denominado(a) CONTRATANTE.


CLAUSULA 1ª - DO OBJETO

O Clube + Estetica 3.0 consiste em um programa de acompanhamento estetico mensal continuado. O tratamento fundamenta-se em protocolos personalizados, definidos e ajustados pela equipe tecnica da CONTRATADA segundo a avaliacao profissional e necessidades individuais de cada fase do(a) CONTRATANTE.

Nota importante: Este programa nao se caracteriza como um "pacote fechado" de procedimentos fixos, mas sim como uma assinatura de acompanhamento estetico recorrente.


CLAUSULA 2ª - DOS PLANOS E INVESTIMENTOS

O Clube opera sob o modelo de assinatura, garantindo valores preferenciais em relacao a tabela de servicos avulsos (preco medio de referencia: 60 EUR/sessao).

2.1. Quadro Comparativo de Beneficios
 
 (Ver tabela comparativa abaixo)


2.2. Modalidades de Fidelizacao

{plano_escolhido}


CLAUSULA 3ª - CONDICOES GERAIS DE UTILIZACAO

Duracao: Cada sessao tera a duracao maxima de 60 minutos.

Protocolos: A definicao tecnica do tratamento e de exclusiva responsabilidade da profissional.

Agendamento e Cancelamento: Cancelamentos ou alteracoes devem ser comunicados com 48h de antecedencia. A ausencia ou aviso tardio implicara na perda da sessao (considerada realizada).

Intransferibilidade: O plano e pessoal e nao podera ser utilizado por terceiros.

Nao Cumulatividade: As sessoes devem ser usufruidas dentro do mes de vigencia. Sessoes nao utilizadas nao acumulam para o mes seguinte.

Reagendamento:
{reagendamentos_info}


CLAUSULA 4ª - BENEFICIOS EXCLUSIVOS

Alem das sessoes fixas, o membro tera direito a:

- Desconto em Servicos Extras: {desconto_extras}
{beneficio_premium}
- Descontos em parceiros.


CLAUSULA 5ª - ROL DE PROCEDIMENTOS DISPONIVEIS

O acompanhamento podera abranger, conforme avaliacao tecnica, os seguintes procedimentos:

Segmento Facial:
- Dermaplaning
- Protocolo Fios de Seda
- Peeling de Vitamina C
- Revitalizacao Face/Pescoco/Colo
- Tratamento Antiacne
- Spa dos Labios / HidraGloss
- Radiofrequencia & Lipo LED

Segmento Corporal:
- Drenagens (Inf. / Abdominal / Total)
- FAT Redux
- Radiofrequencia & Cavitacao
- Lipo LED & Eletroestimulacao
- Protocolos Especificos (Bumbum Up / Dreno Slim)
- Terapias (Termo / Crio / Gesso / Endermo)
- Tratamentos para Estrias e Lipedema

Paragrafo Unico: Procedimentos que utilizem insumos importados (Brasil) estao sujeitos a disponibilidade de estoque, podendo ser substituidos por equivalentes de qualidade similar.


CLAUSULA 6ª - DO PAGAMENTO

Vencimento: Ate o dia 10 de cada mes.

Metodos: Transferencia Bancaria ou Especie.

O atraso no pagamento podera suspender a prestacao dos servicos ate a regularizacao.


CLAUSULA 7ª - RESCISAO E MULTA

A rescisao devera ser solicitada com aviso previo minimo de 60 dias, por escrito ou e-mail.

Caso o(a) CONTRATANTE rescinda o contrato antes de findo o periodo de fidelidade escolhido ({fidelidade_meses} meses), sera aplicada uma multa compensatoria de 40% sobre o valor total das mensalidades vincendas ate o termino do contrato.


CLAUSULA 8ª - VALIDADE JURIDICA

Este contrato e validado mediante assinatura digital, confirmacao por e-mail ou aceitacao eletronica.


CLAUSULA 9ª - PROTECAO DE DADOS (RGPD)

O(A) CONTRATANTE autoriza o tratamento dos seus dados pessoais para fins de gestao contratual e agendamentos. A utilizacao de imagens para fins publicitarios sera objeto de consentimento especifico e separado.


CLAUSULA 10ª - RESPONSABILIDADE TECNICA

O(A) CONTRATANTE obriga-se a informar sobre quaisquer condicoes de saude, alergias, uso de medicacao ou estado de gravidez. A CONTRATADA nao se responsabiliza por reacoes decorrentes da omissao de tais informacoes.


CLAUSULA 11ª - TOLERANCIA DE ATRASO

Sera admitida uma tolerancia de atraso de 10 minutos. Apos este periodo, a sessao sera realizada pelo tempo restante disponivel, sem direito a compensacao ou desconto, de forma a nao comprometer os agendamentos seguintes.


Vila Nova de Gaia, {data}

CONTRATO Nº: {numero_contrato}


__________________________________
Micaela Sampaio - Centro de Estetica


__________________________________
Contratante (Assinatura Digital)
"""

def get_plano_info_texto(plano: str) -> str:
    """Retorna o texto formatado com as informações do plano escolhido"""
    # Tentar encontrar o plano exato ou aproximado
    if plano in PLANOS:
        info = PLANOS[plano]
    else:
        # Busca case-insensitive
        found = False
        for p in PLANOS:
            if p.lower() == plano.lower():
                info = PLANOS[p]
                found = True
                break
        
        # Fallback para evitar erro se não achar
        if not found:
            # Tentar adivinhar pelo conteúdo da string
            if "PREMIUM" in plano.upper():
                if "SEMESTRAL" in plano.upper():
                    info = PLANOS.get("PREMIUM - Semestral", {})
                else:
                    info = PLANOS.get("PREMIUM - Anual", {})
            else:
                if "SEMESTRAL" in plano.upper():
                    info = PLANOS.get("BASIC - Semestral", {})
                else:
                    info = PLANOS.get("BASIC - Anual", {})
    
    # Valores padrão para evitar KeyError
    valor_mensal = info.get('valor_mensal', '00')
    
    if "BASIC" in plano.upper():
        tipo = "BASIC"
    else:
        tipo = "PREMIUM"
    
    if "Semestral" in plano or "SEMESTRAL" in plano.upper():
        periodo = "PLANO SEMESTRAL (6 Meses de Fidelidade)"
        return f"O(A) CONTRATANTE optou por:\n[X] {periodo}\n    (X) {tipo}: {valor_mensal} EUR/mes"
    else:
        periodo = "PLANO ANUAL (12 Meses de Fidelidade - Desconto Extra)"
        return f"O(A) CONTRATANTE optou por:\n[X] {periodo}\n    (X) {tipo}: {valor_mensal} EUR/mes"

def get_reagendamentos_texto(plano: str) -> str:
    """Retorna o texto sobre reagendamentos baseado no plano"""
    info = PLANOS.get(plano, {})
    if "BASIC" in plano:
        return "Plano Basic: Permitido 01 (um) reagendamento mensal.\nPlano Premium: Permitido ate 02 (dois) reagendamentos mensais."
    else:
        return "Plano Basic: Permitido 01 (um) reagendamento mensal.\nPlano Premium: Permitido ate 02 (dois) reagendamentos mensais."

def get_beneficio_premium(plano: str) -> str:
    """Retorna texto do benefício premium se aplicável"""
    if "PREMIUM" in plano:
        return "- Vantagem para o Premium: 1 Consultoria de skincare personalizada inclusa."
    return ""

def get_contrato_completo(dados: dict) -> str:
    """Gera o contrato completo com os dados do cliente"""
    from datetime import datetime
    
    plano = dados.get('plano', '')
    info_plano = PLANOS.get(plano, {})
    
    plano_escolhido = get_plano_info_texto(plano)
    reagendamentos_info = get_reagendamentos_texto(plano)
    desconto_extras = info_plano.get('desconto_extras', '30%')
    beneficio_premium = get_beneficio_premium(plano)
    fidelidade_meses = info_plano.get('fidelidade', 6)
    
    return CONTRATO_TEXTO.format(
        nome=dados.get('nome', ''),
        nif=dados.get('nif', ''),
        email=dados.get('email', ''),
        whatsapp=dados.get('whatsapp', ''),
        endereco=dados.get('endereco', ''),
        contratada_nome=dados.get('contratada_nome', 'MICAELA SAMPAIO'),
        contratada_nif=dados.get('contratada_nif', ''),
        contratada_endereco=dados.get('contratada_endereco', ''),
        plano_escolhido=plano_escolhido,
        reagendamentos_info=reagendamentos_info,
        desconto_extras=desconto_extras,
        beneficio_premium=beneficio_premium if beneficio_premium else "",
        fidelidade_meses=fidelidade_meses,
        data=datetime.now().strftime('%d de %B de %Y'),
        numero_contrato=dados.get('numero_contrato', '')
    )
