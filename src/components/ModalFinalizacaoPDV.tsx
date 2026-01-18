import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OrdemServico } from '@/contexts/OficinaContext';
import { Printer, FileText, CheckCircle } from 'lucide-react';

interface ModalFinalizacaoPDVProps {
  open: boolean;
  onClose: () => void;
  ordem: OrdemServico | null;
}

export function ModalFinalizacaoPDV({ open, onClose, ordem }: ModalFinalizacaoPDVProps) {
  if (!ordem) return null;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const servicosSelecionados = ordem.servicos.filter(s => s.selecionado);

  const gerarConteudoOS = () => {
    const linhas = [
      '═══════════════════════════════════════',
      '           ORDEM DE SERVIÇO            ',
      '═══════════════════════════════════════',
      '',
      'DADOS DO CLIENTE',
      `Nome: ${ordem.nomeCliente}`,
      `Placa: ${ordem.placa}`,
      `Telefone: ${ordem.telefone}`,
      '',
      '───────────────────────────────────────',
      'SERVIÇOS REALIZADOS',
      '───────────────────────────────────────',
      ...servicosSelecionados.map(s => `• ${s.nome} - ${formatCurrency(s.preco)}`),
      '',
      '───────────────────────────────────────',
      'PRODUTOS UTILIZADOS',
      '───────────────────────────────────────',
      ...ordem.produtos.map(p => `• ${p.nome} (${p.quantidade}x) - ${formatCurrency(p.quantidade * p.precoUnitario)}`),
      '',
      '═══════════════════════════════════════',
      `Total Serviços: ${formatCurrency(ordem.totalServicos)}`,
      `Total Produtos: ${formatCurrency(ordem.totalProdutos)}`,
      `TOTAL GERAL: ${formatCurrency(ordem.totalGeral)}`,
      '═══════════════════════════════════════',
      '',
      `Data: ${ordem.dataFinalizacao?.toLocaleDateString('pt-BR')}`,
    ];
    return linhas.join('\n');
  };

  const handleImprimir = () => {
    const conteudo = gerarConteudoOS();
    const janela = window.open('', '_blank');
    if (janela) {
      janela.document.write(`
        <html>
          <head>
            <title>OS - ${ordem.placa}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                padding: 20px; 
                background: #fff;
                color: #000;
              }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${conteudo}</pre>
          </body>
        </html>
      `);
      janela.document.close();
      janela.print();
    }
  };

  const handleGerarPDF = () => {
    const conteudo = gerarConteudoOS();
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OS-${ordem.placa}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="h-6 w-6" />
            OS Finalizada!
          </DialogTitle>
          <DialogDescription>
            Ordem de serviço finalizada com sucesso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-accent/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="text-foreground font-medium">{ordem.nomeCliente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Placa:</span>
              <span className="text-foreground font-mono">{ordem.placa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefone:</span>
              <span className="text-foreground">{ordem.telefone}</span>
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Serviços:</span>
              <span className="text-foreground">{formatCurrency(ordem.totalServicos)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Produtos:</span>
              <span className="text-foreground">{formatCurrency(ordem.totalProdutos)}</span>
            </div>
            <Separator className="bg-border" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-foreground">Total Geral:</span>
              <span className="text-success">{formatCurrency(ordem.totalGeral)}</span>
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleImprimir}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir OS
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleGerarPDF}
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>

          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
