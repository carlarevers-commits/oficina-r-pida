import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useOS } from '@/contexts/OSContext';
import { ServicoChecklist } from '@/components/ServicoChecklist';
import { ProdutoScanner } from '@/components/ProdutoScanner';
import { StatusBadge } from '@/components/StatusBadge';
import { ModalFinalizacao } from '@/components/ModalFinalizacao';
import { Produto, StatusOS } from '@/types/os';
import {
  ArrowLeft,
  Save,
  Play,
  CheckCircle,
  Bike,
  User,
  Phone,
  Gauge,
  FileText,
  History,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function OrdemServico() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { adicionarOS, atualizarOS, buscarPorId, alterarStatus, finalizarOS, buscarPorPlaca } =
    useOS();

  const isNovaOS = id === 'nova';
  const osExistente = !isNovaOS && id ? buscarPorId(id) : null;

  const [placa, setPlaca] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [servicos, setServicos] = useState<string[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [status, setStatus] = useState<StatusOS>('aberta');
  const [showModal, setShowModal] = useState(false);
  const [osFinalizada, setOsFinalizada] = useState<any>(null);

  useEffect(() => {
    if (osExistente) {
      setPlaca(osExistente.placa);
      setNomeCliente(osExistente.nomeCliente);
      setWhatsapp(osExistente.whatsapp);
      setKmAtual(osExistente.kmAtual);
      setObservacoes(osExistente.observacoes);
      setServicos(osExistente.servicos);
      setProdutos(osExistente.produtos);
      setStatus(osExistente.status);
    }
  }, [osExistente]);

  const valorTotal = produtos.reduce((acc, p) => acc + p.valor, 0);

  const handleSalvar = () => {
    if (!placa.trim()) {
      toast({ title: 'Erro', description: 'Informe a placa da moto', variant: 'destructive' });
      return;
    }
    if (!nomeCliente.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome do cliente', variant: 'destructive' });
      return;
    }

    if (isNovaOS) {
      const novoId = adicionarOS({
        placa: placa.toUpperCase(),
        nomeCliente,
        whatsapp,
        kmAtual,
        observacoes,
        servicos,
        produtos,
        status: 'aberta',
      });
      toast({ title: 'Sucesso', description: 'Ordem de serviço criada!' });
      navigate(`/os/${novoId}`);
    } else if (id) {
      atualizarOS(id, {
        placa: placa.toUpperCase(),
        nomeCliente,
        whatsapp,
        kmAtual,
        observacoes,
        servicos,
        produtos,
      });
      toast({ title: 'Sucesso', description: 'Ordem de serviço atualizada!' });
    }
  };

  const handleIniciar = () => {
    if (id && !isNovaOS) {
      alterarStatus(id, 'em_execucao');
      setStatus('em_execucao');
      toast({ title: 'Status atualizado', description: 'OS em execução' });
    }
  };

  const handleFinalizar = () => {
    if (id && !isNovaOS) {
      finalizarOS(id);
      setStatus('finalizada');
      const os = buscarPorId(id);
      if (os) {
        setOsFinalizada({ ...os, status: 'finalizada', valorTotal });
        setShowModal(true);
      }
    }
  };

  const historicoPlaca = !isNovaOS && placa ? buscarPorPlaca(placa).filter((o) => o.id !== id) : [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isNovaOS ? 'Nova Ordem de Serviço' : `OS - ${placa}`}
              </h1>
              {!isNovaOS && <StatusBadge status={status} className="mt-1" />}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Dados do Cliente */}
        <section className="bg-card rounded-xl border border-border p-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Dados do Cliente
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa" className="text-foreground">
                Placa da Moto *
              </Label>
              <div className="relative">
                <Bike className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="placa"
                  placeholder="ABC-1234"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  className="pl-10 h-12 bg-input border-border text-foreground uppercase"
                  disabled={!isNovaOS && status === 'finalizada'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-foreground">
                Nome do Cliente *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="nome"
                  placeholder="Nome completo"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  className="pl-10 h-12 bg-input border-border text-foreground"
                  disabled={status === 'finalizada'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-foreground">
                WhatsApp
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  placeholder="(11) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="pl-10 h-12 bg-input border-border text-foreground"
                  disabled={status === 'finalizada'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="km" className="text-foreground">
                KM Atual
              </Label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="km"
                  placeholder="12.500"
                  value={kmAtual}
                  onChange={(e) => setKmAtual(e.target.value)}
                  className="pl-10 h-12 bg-input border-border text-foreground"
                  disabled={status === 'finalizada'}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="obs" className="text-foreground">
              Observações
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Textarea
                id="obs"
                placeholder="Observações sobre o serviço..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="pl-10 min-h-24 bg-input border-border text-foreground resize-none"
                disabled={status === 'finalizada'}
              />
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section className="bg-card rounded-xl border border-border p-4">
          <ServicoChecklist
            servicosSelecionados={servicos}
            onChange={status !== 'finalizada' ? setServicos : () => {}}
          />
        </section>

        {/* Produtos */}
        <section className="bg-card rounded-xl border border-border p-4">
          <ProdutoScanner
            produtos={produtos}
            onChange={status !== 'finalizada' ? setProdutos : () => {}}
          />
        </section>

        {/* Histórico por Placa */}
        {historicoPlaca.length > 0 && (
          <section className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <History className="h-5 w-5 text-info" />
              Histórico desta Placa
            </h3>
            <div className="space-y-2">
              {historicoPlaca.map((os) => (
                <button
                  key={os.id}
                  onClick={() => navigate(`/os/${os.id}`)}
                  className="w-full bg-accent rounded-lg p-3 text-left hover:bg-accent/80 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(os.dataCriacao).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-foreground">
                        {os.servicos.slice(0, 2).join(', ')}
                        {os.servicos.length > 2 && ` +${os.servicos.length - 2}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        R$ {os.valorTotal.toFixed(2)}
                      </p>
                      <StatusBadge status={os.status} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          {status !== 'finalizada' && (
            <Button
              onClick={handleSalvar}
              className="flex-1 h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-5 w-5 mr-2" />
              Salvar
            </Button>
          )}

          {!isNovaOS && status === 'aberta' && (
            <Button
              onClick={handleIniciar}
              className="flex-1 h-14 text-lg bg-info text-info-foreground hover:bg-info/90"
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar
            </Button>
          )}

          {!isNovaOS && status === 'em_execucao' && (
            <Button
              onClick={handleFinalizar}
              className="flex-1 h-14 text-lg bg-success text-success-foreground hover:bg-success/90"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Finalizar OS
            </Button>
          )}
        </div>
      </div>

      <ModalFinalizacao
        open={showModal}
        onClose={() => setShowModal(false)}
        ordem={osFinalizada}
      />
    </div>
  );
}
