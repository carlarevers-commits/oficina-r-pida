import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OrdemServico, StatusOS } from '@/types/os';

interface OSContextType {
  ordens: OrdemServico[];
  adicionarOS: (os: Omit<OrdemServico, 'id' | 'dataCriacao' | 'valorTotal'>) => string;
  atualizarOS: (id: string, dados: Partial<OrdemServico>) => void;
  buscarPorPlaca: (placa: string) => OrdemServico[];
  buscarPorId: (id: string) => OrdemServico | undefined;
  alterarStatus: (id: string, status: StatusOS) => void;
  finalizarOS: (id: string) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export function OSProvider({ children }: { children: ReactNode }) {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);

  const adicionarOS = (os: Omit<OrdemServico, 'id' | 'dataCriacao' | 'valorTotal'>): string => {
    const id = crypto.randomUUID();
    const valorTotal = os.produtos.reduce((acc, p) => acc + p.valor, 0);
    const novaOS: OrdemServico = {
      ...os,
      id,
      dataCriacao: new Date(),
      valorTotal,
    };
    setOrdens((prev) => [...prev, novaOS]);
    return id;
  };

  const atualizarOS = (id: string, dados: Partial<OrdemServico>) => {
    setOrdens((prev) =>
      prev.map((os) => {
        if (os.id === id) {
          const atualizada = { ...os, ...dados };
          atualizada.valorTotal = atualizada.produtos.reduce((acc, p) => acc + p.valor, 0);
          return atualizada;
        }
        return os;
      })
    );
  };

  const buscarPorPlaca = (placa: string): OrdemServico[] => {
    const termo = placa.toUpperCase().trim();
    if (!termo) return ordens;
    return ordens.filter((os) => os.placa.toUpperCase().includes(termo));
  };

  const buscarPorId = (id: string): OrdemServico | undefined => {
    return ordens.find((os) => os.id === id);
  };

  const alterarStatus = (id: string, status: StatusOS) => {
    setOrdens((prev) =>
      prev.map((os) => (os.id === id ? { ...os, status } : os))
    );
  };

  const finalizarOS = (id: string) => {
    setOrdens((prev) =>
      prev.map((os) =>
        os.id === id
          ? { ...os, status: 'finalizada' as StatusOS, dataFinalizacao: new Date() }
          : os
      )
    );
  };

  return (
    <OSContext.Provider
      value={{
        ordens,
        adicionarOS,
        atualizarOS,
        buscarPorPlaca,
        buscarPorId,
        alterarStatus,
        finalizarOS,
      }}
    >
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS deve ser usado dentro de OSProvider');
  }
  return context;
}
