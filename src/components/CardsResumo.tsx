import { DollarSign, Package, Wrench, ClipboardList, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useOficina } from '@/contexts/OficinaContext';

interface CardResumoProps {
  icon: React.ReactNode;
  titulo: string;
  valor: string | number;
  cor: string;
}

function CardResumo({ icon, titulo, valor, cor }: CardResumoProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${cor}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{titulo}</p>
            <p className="text-2xl font-bold text-foreground">{valor}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CardsResumo() {
  const {
    totalVendido,
    totalVendidoProdutos,
    totalVendidoServicos,
    ordensAbertas,
    ordensFinalizadas,
  } = useOficina();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <CardResumo
        icon={<DollarSign className="h-6 w-6 text-success" />}
        titulo="Total Vendido"
        valor={formatCurrency(totalVendido)}
        cor="bg-success/20"
      />
      <CardResumo
        icon={<Package className="h-6 w-6 text-info" />}
        titulo="Vendas Produtos"
        valor={formatCurrency(totalVendidoProdutos)}
        cor="bg-info/20"
      />
      <CardResumo
        icon={<Wrench className="h-6 w-6 text-primary" />}
        titulo="Vendas Serviços"
        valor={formatCurrency(totalVendidoServicos)}
        cor="bg-primary/20"
      />
      <CardResumo
        icon={<ClipboardList className="h-6 w-6 text-warning" />}
        titulo="OS em Aberto"
        valor={ordensAbertas}
        cor="bg-warning/20"
      />
      <CardResumo
        icon={<CheckCircle className="h-6 w-6 text-success" />}
        titulo="OS Finalizadas"
        valor={ordensFinalizadas}
        cor="bg-success/20"
      />
    </div>
  );
}
