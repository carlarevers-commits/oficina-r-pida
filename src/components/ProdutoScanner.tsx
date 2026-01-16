import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Produto, PRODUTOS_MOCK } from '@/types/os';
import { Barcode, Plus, Trash2 } from 'lucide-react';

interface ProdutoScannerProps {
  produtos: Produto[];
  onChange: (produtos: Produto[]) => void;
}

export function ProdutoScanner({ produtos, onChange }: ProdutoScannerProps) {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');

  const adicionarProduto = () => {
    const codigoLimpo = codigo.trim();
    if (!codigoLimpo) {
      setErro('Digite um código');
      return;
    }

    const produtoMock = PRODUTOS_MOCK[codigoLimpo];
    if (produtoMock) {
      const novoProduto: Produto = {
        id: crypto.randomUUID(),
        codigo: codigoLimpo,
        nome: produtoMock.nome,
        valor: produtoMock.valor,
      };
      onChange([...produtos, novoProduto]);
      setCodigo('');
      setErro('');
    } else {
      // Produto genérico para códigos não mapeados
      const novoProduto: Produto = {
        id: crypto.randomUUID(),
        codigo: codigoLimpo,
        nome: `Produto ${codigoLimpo.slice(-4)}`,
        valor: 50.00,
      };
      onChange([...produtos, novoProduto]);
      setCodigo('');
      setErro('');
    }
  };

  const removerProduto = (id: string) => {
    onChange(produtos.filter((p) => p.id !== id));
  };

  const total = produtos.reduce((acc, p) => acc + p.valor, 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      adicionarProduto();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Produtos</h3>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Código de barras"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground h-12"
          />
        </div>
        <Button
          onClick={adicionarProduto}
          className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar
        </Button>
      </div>
      
      {erro && <p className="text-destructive text-sm">{erro}</p>}

      {produtos.length > 0 && (
        <div className="space-y-2">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {produtos.map((produto, index) => (
              <div
                key={produto.id}
                className={`flex items-center justify-between p-3 ${
                  index !== produtos.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{produto.nome}</p>
                  <p className="text-sm text-muted-foreground">Cód: {produto.codigo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">
                    R$ {produto.valor.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removerProduto(produto.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/30">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">
              R$ {total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Códigos de teste: 7891234567890, 7891234567891, 7891234567892...
      </p>
    </div>
  );
}
