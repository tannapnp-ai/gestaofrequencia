export const getCareersByTeam = (teamId: string): string[] => {
  switch (teamId) {
    case 'A':
    case 'B':
    case 'C':
    case 'D':
    case 'E':
      return ['AGSE - Efetivo', 'AGSE - Contratado'];
    case 'F':
      return [
        'ANEDS - Odontologia',
        'ANEDS - Pedagogia',
        'ANEDS - Jurídico',
        'ANEDS - Enfermagem',
        'ANEDS - Psicologia',
        'ANEDS - Qualquer Formação',
        'ANEDS - Serviço Social',
        'ANEDS - Terapia Ocupacional',
        'ASEDS - Qualquer Nível Médio',
        'ASEDS - Técnico de Enfermagem',
        'ASEDS - Auxiliar de Consultório Odontológico'
      ];
    case 'G':
      return ['ASEDS - Auxiliar Administrativo', 'Auxiliar Executivo de Defesa Social'];
    case 'H':
      return ['ASEDS - Auxiliar Educacional'];
    case 'I':
      return [
        'AGSE - Efetivo',
        'AGSE - Contratado',
        'ANEDS - Odontologia',
        'ANEDS - Pedagogia',
        'ANEDS - Jurídico',
        'ANEDS - Enfermagem',
        'ANEDS - Psicologia',
        'ANEDS - Qualquer Formação',
        'ANEDS - Serviço Social',
        'ANEDS - Terapia Ocupacional',
        'ASEDS - Qualquer Nível Médio',
        'ASEDS - Técnico de Enfermagem',
        'ASEDS - Auxiliar de Consultório Odontológico',
        'ASEDS - Auxiliar Administrativo',
        'Auxiliar Executivo de Defesa Social',
        'ASEDS - Auxiliar Educacional',
        'Recrutamento Amplo'
      ];
    default:
      return [];
  }
};

export const getFunctionsByTeam = (teamId: string): string[] => {
  switch (teamId) {
    case 'A':
    case 'B':
    case 'C':
    case 'D':
    case 'E':
      return [
        'AGSE',
        'AGSE - Ajustamento de Saúde',
        'AGSE - Afastamento Judicial',
        'Supervisão de Segurança',
        'Coordenação de Segurança'
      ];
    case 'F':
      return ['Analista Técnico', 'Assistente Técnico'];
    case 'G':
      return ['Assistente Administrativo', 'Analista Técnico Administrativo'];
    case 'H':
      return ['ASEDS - Auxiliar Educacional'];
    case 'I':
      return ['Direção de Segurança', 'Direção Geral', 'Direção de Atendimento'];
    default:
      return [];
  }
};