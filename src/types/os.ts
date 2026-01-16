export type StatusOS = 'aberta' | 'em_execucao' | 'finalizada';

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  valor: number;
}

export interface OrdemServico {
  id: string;
  placa: string;
  nomeCliente: string;
  whatsapp: string;
  kmAtual: string;
  observacoes: string;
  servicos: string[];
  produtos: Produto[];
  status: StatusOS;
  dataCriacao: Date;
  dataFinalizacao?: Date;
  valorTotal: number;
}

export const SERVICOS_DISPONIVEIS = [
  'Troca de óleo',
  'Troca de pastilha de freio',
  'Esticar relação',
  'Troca de relação',
  'Troca de pneu',
  'Manutenção motoboy',
] as const;

export const PRODUTOS_MOCK: Record<string, { nome: string; valor: number }> = {
  '7891234567890': { nome: 'Óleo Motor 10W40 1L', valor: 45.00 },
  '7891234567891': { nome: 'Pastilha de Freio Dianteira', valor: 89.00 },
  '7891234567892': { nome: 'Corrente de Transmissão', valor: 120.00 },
  '7891234567893': { nome: 'Kit Relação Completo', valor: 280.00 },
  '7891234567894': { nome: 'Pneu Traseiro 100/90-18', valor: 320.00 },
  '7891234567895': { nome: 'Pneu Dianteiro 90/90-19', valor: 290.00 },
  '7891234567896': { nome: 'Filtro de Óleo', valor: 35.00 },
  '7891234567897': { nome: 'Vela de Ignição', valor: 28.00 },
  '7891234567898': { nome: 'Cabo de Acelerador', valor: 55.00 },
  '7891234567899': { nome: 'Cabo de Embreagem', valor: 48.00 },
};
