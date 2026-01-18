import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useOficina, OrdemServico, ServicoOS, ProdutoOS } from '@/contexts/OficinaContext';
import { ModalFinalizacaoPDV } from '@/components/ModalFinalizacaoPDV';
import { ArrowLeft, Plus, Trash2, CheckCircle, Wrench, Package, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PDV() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { 
    produtos, 
    criarOS, 
    atualizarOS, 
    finalizarOS, 
    buscarOS,
    getServicosDisponiveis 
  } = useOficina();

  const [ordem, setOrdem] = useState<OrdemServico | null>(null);
  const [placa, setPlaca] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [servicos, setServicos] = useState<ServicoOS[]>([]);
  const [produtosOS, setProdutosOS] = useState<ProdutoOS[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [ordemFinalizada, setOrdemFinalizada] = useState<OrdemServico | null>(null);

  const isNovaOS = id === 'nova';

  useEffect(() => {
    if (isNovaOS) {
      setServicos(getServicosDisponiveis());
    } else if (id) {
      const osExistente = buscarOS(id);
      if (osExistente) {
        setOrdem(osExistente);
        setPlaca(osExistente.placa);
        setNomeCliente(osExistente.nomeCliente);
        setTelefone(osExistente.telefone);
        setServicos(osExistente.servicos);
        setProdutosOS(osExistente.produtos);
      }
    }
  }, [id, isNovaOS, buscarOS, getServicosDisponiveis]);

  // Mask functions
  const formatPlaca = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length <= 3) return clean;
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}`;
  };

  const formatTelefone = (value: string) => {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 2) return clean.length ? `(${clean}` : '';
    if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaca(formatPlaca(e.target.value));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatTelefone(e.target.value));
  };

  const toggleServico = (servicoId: string) => {
    setServicos(prev => prev.map(s => 
      s.id === servicoId ? { ...s, selecionado: !s.selecionado } : s
    ));
  };

  const handlePrecoChange = (servicoId: string, novoPreco: number) => {
    setServicos(prev => prev.map(s => 
      s.id === servicoId ? { ...s, preco: novoPreco } : s
    ));
  };

  const adicionarProduto = () => {
    if (!produtoSelecionado || quantidade <= 0) {
      toast({
        title: 'Erro',
        description: 'Selecione um produto e informe a quantidade',
        variant: 'destructive',
      });
      return;
    }

    const produto = produtos.find(p => p.id === produtoSelecionado);
    if (!produto) return;

    if (quantidade > produto.estoque) {
      toast({
        title: 'Estoque insuficiente',
        description: `Apenas ${produto.estoque} unidades disponíveis`,
        variant: 'destructive',
      });
      return;
    }

    const produtoExistente = produtosOS.find(p => p.produtoId === produtoSelecionado);
    if (produtoExistente) {
      setProdutosOS(prev => prev.map(p => 
        p.produtoId === produtoSelecionado
          ? { ...p, quantidade: p.quantidade + quantidade }
          : p
      ));
    } else {
      setProdutosOS(prev => [...prev, {
        produtoId: produto.id,
        nome: produto.nome,
        quantidade,
        precoUnitario: produto.preco,
      }]);
    }

    setProdutoSelecionado('');
    setQuantidade(1);
  };

  const removerProduto = (produtoId: string) => {
    setProdutosOS(prev => prev.filter(p => p.produtoId !== produtoId));
  };

  const totalServicos = servicos
    .filter(s => s.selecionado)
    .reduce((acc, s) => acc + s.preco, 0);

  const totalProdutos = produtosOS.reduce((acc, p) => acc + (p.quantidade * p.precoUnitario), 0);
  const totalGeral = totalServicos + totalProdutos;

  const handleSalvar = () => {
    if (!placa || !nomeCliente || !telefone) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os dados do cliente',
        variant: 'destructive',
      });
      return;
    }

    if (isNovaOS) {
      const novaOrdem = criarOS({ placa, nomeCliente, telefone });
      atualizarOS(novaOrdem.id, { servicos, produtos: produtosOS });
      setOrdem(buscarOS(novaOrdem.id) || null);
      navigate(`/pdv/${novaOrdem.id}`, { replace: true });
    } else if (ordem) {
      atualizarOS(ordem.id, { placa, nomeCliente, telefone, servicos, produtos: produtosOS });
    }

    toast({
      title: 'Sucesso',
      description: 'Ordem de serviço salva',
    });
  };

  const handleFinalizar = () => {
    handleSalvar();
    
    const osId = ordem?.id || buscarOS(id || '')?.id;
    if (!osId) {
      toast({
        title: 'Erro',
        description: 'Salve a OS antes de finalizar',
        variant: 'destructive',
      });
      return;
    }

    finalizarOS(osId);
    const osFinalizada = buscarOS(osId);
    setOrdemFinalizada(osFinalizada || null);
    setModalAberto(true);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const isFinalizada = ordem?.status === 'finalizada';

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isNovaOS ? 'Nova Ordem de Serviço' : `OS - ${placa}`}
              </h1>
              <p className="text-xs text-muted-foreground">PDV</p>
            </div>
          </div>
          {isFinalizada && (
            <span className="px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
              Finalizada
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-32 space-y-6">
        {/* Dados do Cliente */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-info" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa da Moto</Label>
                <Input
                  id="placa"
                  placeholder="ABC-1234"
                  value={placa}
                  onChange={handlePlacaChange}
                  maxLength={8}
                  disabled={isFinalizada}
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Cliente</Label>
                <Input
                  id="nome"
                  placeholder="Nome completo"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  disabled={isFinalizada}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={handleTelefoneChange}
                  maxLength={15}
                  disabled={isFinalizada}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Serviços */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5 text-primary" />
              Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {servicos.map((servico) => (
                <div
                  key={servico.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    servico.selecionado
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-accent/50 border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={servico.selecionado}
                      onCheckedChange={() => toggleServico(servico.id)}
                      disabled={isFinalizada}
                    />
                    <span className="text-foreground">{servico.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">R$</span>
                    <Input
                      type="number"
                      value={servico.preco}
                      onChange={(e) => handlePrecoChange(servico.id, Number(e.target.value))}
                      disabled={isFinalizada}
                      className="w-24 text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <div className="text-lg font-medium">
                Total Serviços: <span className="text-primary">{formatCurrency(totalServicos)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-info" />
              Produtos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isFinalizada && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((produto) => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome} - {formatCurrency(produto.preco)} ({produto.estoque} em estoque)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  className="w-24"
                  placeholder="Qtd"
                />
                <Button onClick={adicionarProduto} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            )}

            {produtosOS.length > 0 && (
              <div className="space-y-2">
                {produtosOS.map((produto) => (
                  <div
                    key={produto.produtoId}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border"
                  >
                    <div>
                      <span className="text-foreground">{produto.nome}</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        ({produto.quantidade}x {formatCurrency(produto.precoUnitario)})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-foreground font-medium">
                        {formatCurrency(produto.quantidade * produto.precoUnitario)}
                      </span>
                      {!isFinalizada && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removerProduto(produto.produtoId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <div className="text-lg font-medium">
                Total Produtos: <span className="text-info">{formatCurrency(totalProdutos)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totais */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-muted-foreground">Total Serviços:</span>
              <span className="text-primary font-medium">{formatCurrency(totalServicos)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-muted-foreground">Total Produtos:</span>
              <span className="text-info font-medium">{formatCurrency(totalProdutos)}</span>
            </div>
            <Separator className="bg-border" />
            <div className="flex justify-between text-2xl font-bold">
              <span className="text-foreground">Total Geral:</span>
              <span className="text-success">{formatCurrency(totalGeral)}</span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer Actions */}
      {!isFinalizada && (
        <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSalvar}
            >
              Salvar OS
            </Button>
            <Button
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              onClick={handleFinalizar}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar OS
            </Button>
          </div>
        </footer>
      )}

      <ModalFinalizacaoPDV
        open={modalAberto}
        onClose={() => {
          setModalAberto(false);
          navigate('/dashboard');
        }}
        ordem={ordemFinalizada}
      />
    </div>
  );
}
