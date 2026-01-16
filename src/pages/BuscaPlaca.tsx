import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOS } from '@/contexts/OSContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, ArrowLeft, Bike, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BuscaPlaca() {
  const navigate = useNavigate();
  const { ordens, buscarPorPlaca } = useOS();
  const [termo, setTermo] = useState('');

  const resultados = termo ? buscarPorPlaca(termo) : ordens;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Buscar por Placa</h1>
            <p className="text-xs text-muted-foreground">
              {ordens.length} ordem(ns) cadastrada(s)
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Digite a placa da moto..."
            value={termo}
            onChange={(e) => setTermo(e.target.value.toUpperCase())}
            className="pl-12 h-14 text-lg bg-card border-border text-foreground placeholder:text-muted-foreground uppercase"
            autoFocus
          />
        </div>

        {resultados.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Bike className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {termo ? 'Nenhuma OS encontrada' : 'Nenhuma OS cadastrada'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {termo
                ? `Não encontramos resultados para "${termo}"`
                : 'Crie uma nova ordem de serviço para começar'}
            </p>
            <Button
              onClick={() => navigate('/os/nova')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Criar Nova OS
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {resultados.map((os) => (
              <button
                key={os.id}
                onClick={() => navigate(`/os/${os.id}`)}
                className="w-full bg-card border border-border rounded-xl p-4 text-left hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-primary">
                        {os.placa}
                      </span>
                      <StatusBadge status={os.status} />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{os.nomeCliente}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(os.dataCriacao), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      R$ {os.valorTotal.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {os.servicos.length} serviço(s)
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
