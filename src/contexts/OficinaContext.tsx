import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  estoqueMinimo: number;
}

export interface ServicoOS {
  id: string;
  nome: string;
  preco: number;
  selecionado: boolean;
}

export interface ProdutoOS {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface OrdemServico {
  id: string;
  placa: string;
  nomeCliente: string;
  telefone: string;
  servicos: ServicoOS[];
  produtos: ProdutoOS[];
  totalServicos: number;
  totalProdutos: number;
  totalGeral: number;
  status: 'aberta' | 'finalizada';
  dataCriacao: Date;
  dataFinalizacao?: Date;
}

export interface VendaServico {
  nome: string;
  quantidade: number;
  total: number;
}

export interface VendaProduto {
  nome: string;
  quantidade: number;
  total: number;
}

interface OficinaContextType {
  produtos: Produto[];
  ordens: OrdemServico[];
  vendasServicos: VendaServico[];
  vendasProdutos: VendaProduto[];
  totalVendido: number;
  totalVendidoProdutos: number;
  totalVendidoServicos: number;
  ordensAbertas: number;
  ordensFinalizadas: number;
  adicionarProduto: (produto: Omit<Produto, 'id'>) => void;
  atualizarProduto: (id: string, dados: Partial<Produto>) => void;
  removerProduto: (id: string) => void;
  criarOS: (dados: { placa: string; nomeCliente: string; telefone: string }) => OrdemServico;
  atualizarOS: (id: string, dados: Partial<OrdemServico>) => void;
  finalizarOS: (id: string) => void;
  buscarOS: (id: string) => OrdemServico | undefined;
  getServicosDisponiveis: () => ServicoOS[];
}

const SERVICOS_PADRAO = [
  { nome: 'Troca de óleo', preco: 50 },
  { nome: 'Troca de pastilha de freio', preco: 80 },
  { nome: 'Esticar relação', preco: 40 },
  { nome: 'Troca de relação', preco: 120 },
  { nome: 'Troca de pneu', preco: 60 },
  { nome: 'Manutenção motoboy', preco: 150 },
];

const PRODUTOS_INICIAIS: Produto[] = [
  { id: '1', nome: 'Óleo Motor 10W40 1L', categoria: 'Óleos', preco: 45.00, estoque: 20, estoqueMinimo: 5 },
  { id: '2', nome: 'Pastilha de Freio Dianteira', categoria: 'Freios', preco: 89.00, estoque: 15, estoqueMinimo: 3 },
  { id: '3', nome: 'Corrente de Transmissão', categoria: 'Transmissão', preco: 120.00, estoque: 8, estoqueMinimo: 2 },
  { id: '4', nome: 'Kit Relação Completo', categoria: 'Transmissão', preco: 280.00, estoque: 5, estoqueMinimo: 2 },
  { id: '5', nome: 'Pneu Traseiro 100/90-18', categoria: 'Pneus', preco: 320.00, estoque: 6, estoqueMinimo: 2 },
  { id: '6', nome: 'Pneu Dianteiro 90/90-19', categoria: 'Pneus', preco: 290.00, estoque: 6, estoqueMinimo: 2 },
  { id: '7', nome: 'Filtro de Óleo', categoria: 'Filtros', preco: 35.00, estoque: 25, estoqueMinimo: 5 },
  { id: '8', nome: 'Vela de Ignição', categoria: 'Ignição', preco: 28.00, estoque: 30, estoqueMinimo: 10 },
  { id: '9', nome: 'Cabo de Acelerador', categoria: 'Cabos', preco: 55.00, estoque: 10, estoqueMinimo: 3 },
  { id: '10', nome: 'Cabo de Embreagem', categoria: 'Cabos', preco: 48.00, estoque: 10, estoqueMinimo: 3 },
];

const OficinaContext = createContext<OficinaContextType | undefined>(undefined);

export function OficinaProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_INICIAIS);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [vendasServicos, setVendasServicos] = useState<VendaServico[]>([]);
  const [vendasProdutos, setVendasProdutos] = useState<VendaProduto[]>([]);

  const totalVendido = ordens
    .filter(o => o.status === 'finalizada')
    .reduce((acc, o) => acc + o.totalGeral, 0);

  const totalVendidoProdutos = ordens
    .filter(o => o.status === 'finalizada')
    .reduce((acc, o) => acc + o.totalProdutos, 0);

  const totalVendidoServicos = ordens
    .filter(o => o.status === 'finalizada')
    .reduce((acc, o) => acc + o.totalServicos, 0);

  const ordensAbertas = ordens.filter(o => o.status === 'aberta').length;
  const ordensFinalizadas = ordens.filter(o => o.status === 'finalizada').length;

  const adicionarProduto = useCallback((produto: Omit<Produto, 'id'>) => {
    const novoProduto: Produto = {
      ...produto,
      id: crypto.randomUUID(),
    };
    setProdutos(prev => [...prev, novoProduto]);
  }, []);

  const atualizarProduto = useCallback((id: string, dados: Partial<Produto>) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p));
  }, []);

  const removerProduto = useCallback((id: string) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
  }, []);

  const getServicosDisponiveis = useCallback((): ServicoOS[] => {
    return SERVICOS_PADRAO.map((s, index) => ({
      id: `servico-${index}`,
      nome: s.nome,
      preco: s.preco,
      selecionado: false,
    }));
  }, []);

  const criarOS = useCallback((dados: { placa: string; nomeCliente: string; telefone: string }): OrdemServico => {
    const novaOS: OrdemServico = {
      id: crypto.randomUUID(),
      placa: dados.placa,
      nomeCliente: dados.nomeCliente,
      telefone: dados.telefone,
      servicos: getServicosDisponiveis(),
      produtos: [],
      totalServicos: 0,
      totalProdutos: 0,
      totalGeral: 0,
      status: 'aberta',
      dataCriacao: new Date(),
    };
    setOrdens(prev => [...prev, novaOS]);
    return novaOS;
  }, [getServicosDisponiveis]);

  const atualizarOS = useCallback((id: string, dados: Partial<OrdemServico>) => {
    setOrdens(prev => prev.map(o => {
      if (o.id === id) {
        const updated = { ...o, ...dados };
        const totalServicos = updated.servicos
          .filter(s => s.selecionado)
          .reduce((acc, s) => acc + s.preco, 0);
        const totalProdutos = updated.produtos.reduce((acc, p) => acc + (p.quantidade * p.precoUnitario), 0);
        return {
          ...updated,
          totalServicos,
          totalProdutos,
          totalGeral: totalServicos + totalProdutos,
        };
      }
      return o;
    }));
  }, []);

  const finalizarOS = useCallback((id: string) => {
    setOrdens(prev => {
      const ordem = prev.find(o => o.id === id);
      if (!ordem) return prev;

      // Update stock
      setProdutos(currentProdutos => {
        const updatedProdutos = [...currentProdutos];
        ordem.produtos.forEach(prodOS => {
          const idx = updatedProdutos.findIndex(p => p.id === prodOS.produtoId);
          if (idx !== -1) {
            updatedProdutos[idx] = {
              ...updatedProdutos[idx],
              estoque: Math.max(0, updatedProdutos[idx].estoque - prodOS.quantidade),
            };
          }
        });
        return updatedProdutos;
      });

      // Update service sales report
      setVendasServicos(currentVendas => {
        const updatedVendas = [...currentVendas];
        ordem.servicos.filter(s => s.selecionado).forEach(servico => {
          const idx = updatedVendas.findIndex(v => v.nome === servico.nome);
          if (idx !== -1) {
            updatedVendas[idx] = {
              ...updatedVendas[idx],
              quantidade: updatedVendas[idx].quantidade + 1,
              total: updatedVendas[idx].total + servico.preco,
            };
          } else {
            updatedVendas.push({
              nome: servico.nome,
              quantidade: 1,
              total: servico.preco,
            });
          }
        });
        return updatedVendas;
      });

      // Update product sales report
      setVendasProdutos(currentVendas => {
        const updatedVendas = [...currentVendas];
        ordem.produtos.forEach(produto => {
          const idx = updatedVendas.findIndex(v => v.nome === produto.nome);
          if (idx !== -1) {
            updatedVendas[idx] = {
              ...updatedVendas[idx],
              quantidade: updatedVendas[idx].quantidade + produto.quantidade,
              total: updatedVendas[idx].total + (produto.quantidade * produto.precoUnitario),
            };
          } else {
            updatedVendas.push({
              nome: produto.nome,
              quantidade: produto.quantidade,
              total: produto.quantidade * produto.precoUnitario,
            });
          }
        });
        return updatedVendas;
      });

      return prev.map(o => 
        o.id === id 
          ? { ...o, status: 'finalizada' as const, dataFinalizacao: new Date() }
          : o
      );
    });
  }, []);

  const buscarOS = useCallback((id: string): OrdemServico | undefined => {
    return ordens.find(o => o.id === id);
  }, [ordens]);

  return (
    <OficinaContext.Provider
      value={{
        produtos,
        ordens,
        vendasServicos,
        vendasProdutos,
        totalVendido,
        totalVendidoProdutos,
        totalVendidoServicos,
        ordensAbertas,
        ordensFinalizadas,
        adicionarProduto,
        atualizarProduto,
        removerProduto,
        criarOS,
        atualizarOS,
        finalizarOS,
        buscarOS,
        getServicosDisponiveis,
      }}
    >
      {children}
    </OficinaContext.Provider>
  );
}

export function useOficina() {
  const context = useContext(OficinaContext);
  if (!context) {
    throw new Error('useOficina deve ser usado dentro de OficinaProvider');
  }
  return context;
}
