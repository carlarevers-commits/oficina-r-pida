import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useOficina } from '@/contexts/OficinaContext';
import { ArrowLeft, Package, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Estoque() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { produtos, adicionarProduto, atualizarProduto, removerProduto } = useOficina();

  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState(0);
  const [estoque, setEstoque] = useState(0);
  const [estoqueMinimo, setEstoqueMinimo] = useState(0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const limparForm = () => {
    setNome('');
    setCategoria('');
    setPreco(0);
    setEstoque(0);
    setEstoqueMinimo(0);
    setEditando(null);
  };

  const handleAbrirEdicao = (produto: typeof produtos[0]) => {
    setEditando(produto.id);
    setNome(produto.nome);
    setCategoria(produto.categoria);
    setPreco(produto.preco);
    setEstoque(produto.estoque);
    setEstoqueMinimo(produto.estoqueMinimo);
    setDialogAberto(true);
  };

  const handleSalvar = () => {
    if (!nome || !categoria || preco <= 0) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (editando) {
      atualizarProduto(editando, { nome, categoria, preco, estoque, estoqueMinimo });
      toast({ title: 'Sucesso', description: 'Produto atualizado' });
    } else {
      adicionarProduto({ nome, categoria, preco, estoque, estoqueMinimo });
      toast({ title: 'Sucesso', description: 'Produto cadastrado' });
    }

    limparForm();
    setDialogAberto(false);
  };

  const handleRemover = (id: string) => {
    removerProduto(id);
    toast({ title: 'Sucesso', description: 'Produto removido' });
  };

  const categorias = [...new Set(produtos.map(p => p.categoria))];
  const produtosBaixoEstoque = produtos.filter(p => p.estoque <= p.estoqueMinimo);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Estoque</h1>
              <p className="text-xs text-muted-foreground">Gerenciamento de produtos</p>
            </div>
          </div>

          <Dialog open={dialogAberto} onOpenChange={(open) => {
            setDialogAberto(open);
            if (!open) limparForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>
                  {editando ? 'Editar Produto' : 'Cadastrar Produto'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Óleo Motor 10W40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ex: Óleos"
                    list="categorias"
                  />
                  <datalist id="categorias">
                    {categorias.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      min={0}
                      step={0.01}
                      value={preco}
                      onChange={(e) => setPreco(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estoque">Quantidade</Label>
                    <Input
                      id="estoque"
                      type="number"
                      min={0}
                      value={estoque}
                      onChange={(e) => setEstoque(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimo">Mínimo</Label>
                    <Input
                      id="minimo"
                      type="number"
                      min={0}
                      value={estoqueMinimo}
                      onChange={(e) => setEstoqueMinimo(Number(e.target.value))}
                    />
                  </div>
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground"
                  onClick={handleSalvar}
                >
                  {editando ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Alertas de Estoque Baixo */}
        {produtosBaixoEstoque.length > 0 && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                <Package className="h-5 w-5" />
                Produtos com Estoque Baixo ({produtosBaixoEstoque.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {produtosBaixoEstoque.map((p) => (
                  <Badge key={p.id} variant="destructive">
                    {p.nome} ({p.estoque})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Produtos */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-success" />
              Produtos ({produtos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Produto</TableHead>
                    <TableHead className="text-muted-foreground">Categoria</TableHead>
                    <TableHead className="text-muted-foreground text-right">Preço</TableHead>
                    <TableHead className="text-muted-foreground text-center">Estoque</TableHead>
                    <TableHead className="text-muted-foreground text-center">Mínimo</TableHead>
                    <TableHead className="text-muted-foreground text-center">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto) => {
                    const estoqueBaixo = produto.estoque <= produto.estoqueMinimo;
                    return (
                      <TableRow key={produto.id} className="border-border">
                        <TableCell className="text-foreground font-medium">
                          {produto.nome}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {produto.categoria}
                        </TableCell>
                        <TableCell className="text-foreground text-right">
                          {formatCurrency(produto.preco)}
                        </TableCell>
                        <TableCell className="text-foreground text-center">
                          {produto.estoque}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-center">
                          {produto.estoqueMinimo}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={estoqueBaixo ? 'destructive' : 'default'}
                            className={
                              estoqueBaixo
                                ? 'bg-destructive/20 text-destructive border-destructive/30'
                                : 'bg-success/20 text-success border-success/30'
                            }
                          >
                            {estoqueBaixo ? 'Baixo' : 'OK'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAbrirEdicao(produto)}
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemover(produto.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
