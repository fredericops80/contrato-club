/**
 * Plan configuration and contract text
 * Converted from Python contract_text.py
 */

// Plan configuration
export const PLANOS = {
    "BASIC - Semestral": {
        nome_display: "BASIC (6 meses)",
        sessoes: 2,
        valor_mensal: 75,
        periodo: "semestral",
        fidelidade: 6,
        descricao: "2 sessões/mês - Fidelidade 6 meses",
        desconto_extras: "30%",
        reagendamentos: 1
    },
    "BASIC - Anual": {
        nome_display: "BASIC (12 meses)",
        sessoes: 2,
        valor_mensal: 60,
        periodo: "anual",
        fidelidade: 12,
        descricao: "2 sessões/mês - Fidelidade 12 meses - Desconto Extra",
        desconto_extras: "30%",
        reagendamentos: 1,
        economia_anual: 180
    },
    "PREMIUM - Semestral": {
        nome_display: "PREMIUM (6 meses)",
        sessoes: 4,
        valor_mensal: 120,
        periodo: "semestral",
        fidelidade: 6,
        descricao: "4 sessões/mês - Fidelidade 6 meses + Consultoria Skincare",
        desconto_extras: "50%",
        reagendamentos: 2
    },
    "PREMIUM - Anual": {
        nome_display: "PREMIUM (12 meses)",
        sessoes: 4,
        valor_mensal: 100,
        periodo: "anual",
        fidelidade: 12,
        descricao: "4 sessões/mês - Fidelidade 12 meses - Desconto Extra + Consultoria Skincare",
        desconto_extras: "50%",
        reagendamentos: 2,
        economia_anual: 240
    }
} as const;

export type PlanKey = keyof typeof PLANOS;

export interface ContractData {
    nome: string;
    nif: string;
    email: string;
    whatsapp: string;
    endereco: string;
    plano: string;
    numero_contrato: string;
    contratada_nome?: string;
    contratada_nif?: string;
    contratada_endereco?: string;
}

function getPlanInfo(plano: string) {
    if (plano in PLANOS) {
        return PLANOS[plano as PlanKey];
    }

    // Fallback search
    const upperPlano = plano.toUpperCase();
    if (upperPlano.includes("PREMIUM")) {
        return upperPlano.includes("SEMESTRAL")
            ? PLANOS["PREMIUM - Semestral"]
            : PLANOS["PREMIUM - Anual"];
    }
    return upperPlano.includes("SEMESTRAL")
        ? PLANOS["BASIC - Semestral"]
        : PLANOS["BASIC - Anual"];
}

function getPlanoInfoTexto(plano: string): string {
    const info = getPlanInfo(plano);
    const tipo = plano.toUpperCase().includes("BASIC") ? "BASIC" : "PREMIUM";
    const isAnual = plano.toUpperCase().includes("ANUAL") || info.periodo === "anual";

    const periodo = isAnual
        ? "PLANO ANUAL (12 Meses de Fidelidade - Desconto Extra)"
        : "PLANO SEMESTRAL (6 Meses de Fidelidade)";

    return `O(A) CONTRATANTE optou por:\n[X] ${periodo}\n    (X) ${tipo}: ${info.valor_mensal} EUR/mês`;
}

function getReagendamentosTexto(): string {
    return "Plano Basic: Permitido 01 (um) reagendamento mensal.\nPlano Premium: Permitido até 02 (dois) reagendamentos mensais.";
}

function getBeneficioPremium(plano: string): string {
    return plano.toUpperCase().includes("PREMIUM")
        ? "- Vantagem para o Premium: 1 Consultoria de skincare personalizada inclusa."
        : "";
}

function formatDate(): string {
    const months = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    const now = new Date();
    return `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

export function getContratoCompleto(dados: ContractData): string {
    const plano = dados.plano || '';
    const info = getPlanInfo(plano);

    const planoEscolhido = getPlanoInfoTexto(plano);
    const reagendamentosInfo = getReagendamentosTexto();
    const descontoExtras = info.desconto_extras;
    const beneficioPremium = getBeneficioPremium(plano);
    const fidelidadeMeses = info.fidelidade;

    return `CONTRATO DE ADESÃO
CLUBE + ESTÉTICA 3.0

Pelo presente instrumento particular, as partes abaixo qualificadas celebram este contrato de prestação de serviços:

CONTRATADA: ${dados.contratada_nome || 'MICAELA SAMPAIO'}, NIF ${dados.contratada_nif || ''}, com sede em ${dados.contratada_endereco || ''}, doravante denominada apenas CONTRATADA.

CONTRATANTE: 
Nome: ${dados.nome}
NIF: ${dados.nif}
E-mail: ${dados.email}
WhatsApp: ${dados.whatsapp}
Endereço: ${dados.endereco}

Doravante denominado(a) CONTRATANTE.


CLÁUSULA 1ª - DO OBJETO

O Clube + Estética 3.0 consiste em um programa de acompanhamento estético mensal continuado. O tratamento fundamenta-se em protocolos personalizados, definidos e ajustados pela equipe técnica da CONTRATADA segundo a avaliação profissional e necessidades individuais de cada fase do(a) CONTRATANTE.

Nota importante: Este programa não se caracteriza como um "pacote fechado" de procedimentos fixos, mas sim como uma assinatura de acompanhamento estético recorrente.


CLÁUSULA 2ª - DOS PLANOS E INVESTIMENTOS

O Clube opera sob o modelo de assinatura, garantindo valores preferenciais em relação a tabela de serviços avulsos (preço médio de referência: 60 EUR/sessão).

2.1. Quadro Comparativo de Benefícios
 
 (Ver tabela comparativa abaixo)


2.2. Modalidades de Fidelização

${planoEscolhido}


CLÁUSULA 3ª - CONDIÇÕES GERAIS DE UTILIZAÇÃO

Duração: Cada sessão terá a duração máxima de 60 minutos.

Protocolos: A definição técnica do tratamento é de exclusiva responsabilidade da profissional.

Agendamento e Cancelamento: Cancelamentos ou alterações devem ser comunicados com 48h de antecedência. A ausência ou aviso tardio implicará na perda da sessão (considerada realizada).

Intransferibilidade: O plano é pessoal e não poderá ser utilizado por terceiros.

Não Cumulatividade: As sessões devem ser usufruídas dentro do mês de vigência. Sessões não utilizadas não acumulam para o mês seguinte.

Reagendamento:
${reagendamentosInfo}


CLÁUSULA 4ª - BENEFÍCIOS EXCLUSIVOS

Além das sessões fixas, o membro terá direito a:

- Desconto em Serviços Extras: ${descontoExtras}
${beneficioPremium}
- Descontos em parceiros.


CLÁUSULA 5ª - ROL DE PROCEDIMENTOS DISPONÍVEIS

O acompanhamento poderá abranger, conforme avaliação técnica, os seguintes procedimentos:

Segmento Facial:
- Dermaplaning
- Protocolo Fios de Seda
- Peeling de Vitamina C
- Revitalização Face/Pescoço/Colo
- Tratamento Antiacne
- Spa dos Lábios / HidraGloss
- Radiofrequência & Lipo LED

Segmento Corporal:
- Drenagens (Inf. / Abdominal / Total)
- FAT Redux
- Radiofrequência & Cavitação
- Lipo LED & Eletroestimulação
- Protocolos Específicos (Bumbum Up / Dreno Slim)
- Terapias (Termo / Crio / Gesso / Endermo)
- Tratamentos para Estrias e Lipedema

Parágrafo Único: Procedimentos que utilizem insumos importados (Brasil) estão sujeitos a disponibilidade de estoque, podendo ser substituídos por equivalentes de qualidade similar.


CLÁUSULA 6ª - DO PAGAMENTO

Vencimento: Até o dia 10 de cada mês.

Métodos: Transferência Bancária ou Espécie.

O atraso no pagamento poderá suspender a prestação dos serviços até a regularização.


CLÁUSULA 7ª - RESCISÃO E MULTA

A rescisão deverá ser solicitada com aviso prévio mínimo de 60 dias, por escrito ou e-mail.

Caso o(a) CONTRATANTE rescinda o contrato antes de findo o período de fidelidade escolhido (${fidelidadeMeses} meses), será aplicada uma multa compensatória de 40% sobre o valor total das mensalidades vincendas até o término do contrato.


CLÁUSULA 8ª - VALIDADE JURÍDICA

Este contrato é validado mediante assinatura digital, confirmação por e-mail ou aceitação eletrônica.


CLÁUSULA 9ª - PROTEÇÃO DE DADOS (RGPD)

O(A) CONTRATANTE autoriza o tratamento dos seus dados pessoais para fins de gestão contratual e agendamentos. A utilização de imagens para fins publicitários será objeto de consentimento específico e separado.


CLÁUSULA 10ª - RESPONSABILIDADE TÉCNICA

O(A) CONTRATANTE obriga-se a informar sobre quaisquer condições de saúde, alergias, uso de medicação ou estado de gravidez. A CONTRATADA não se responsabiliza por reações decorrentes da omissão de tais informações.


CLÁUSULA 11ª - TOLERÂNCIA DE ATRASO

Será admitida uma tolerância de atraso de 10 minutos. Após este período, a sessão será realizada pelo tempo restante disponível, sem direito a compensação ou desconto, de forma a não comprometer os agendamentos seguintes.


Vila Nova de Gaia, ${formatDate()}

CONTRATO Nº: ${dados.numero_contrato}


__________________________________
Micaela Sampaio - Centro de Estética


__________________________________
Contratante (Assinatura Digital)`;
}
