import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOficina } from '@/contexts/OficinaContext';
import { ClipboardList } from 'lucide-react';

export function ListaOrdens() {
  const { ordens } = useOficina();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5 text-warning" />
          Ordens de Serviço
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ordens.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma ordem de serviço registrada
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Placa</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Serviços</TableHead>
                  <TableHead className="text-muted-foreground">Produtos</TableHead>
                  <TableHead className="text-muted-foreground text-right">Total</TableHead>
                  <TableHead className="text-muted-foreground text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordens.map((ordem) => (
                  <TableRow 
                    key={ordem.id} 
                    className="border-border cursor-pointer hover:bg-accent/50"
                    onClick={() => navigate(`/pdv/${ordem.id}`)}
                  >
                    <TableCell className="text-foreground font-mono font-medium">
                      {ordem.placa}
                    </TableCell>
                    <TableCell className="text-foreground">{ordem.nomeCliente}</TableCell>
                    <TableCell className="text-foreground">
                      {ordem.servicos.filter(s => s.selecionado).length} serviço(s)
                    </TableCell>
                    <TableCell className="text-foreground">
                      {ordem.produtos.length} produto(s)
                    </TableCell>
                    <TableCell className="text-foreground text-right font-medium">
                      {formatCurrency(ordem.totalGeral)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={ordem.status === 'finalizada' ? 'default' : 'secondary'}
                        className={
                          ordem.status === 'finalizada'
                            ? 'bg-success/20 text-success border-success/30'
                            : 'bg-warning/20 text-warning border-warning/30'
                        }
                      >
                        {ordem.status === 'finalizada' ? 'Finalizada' : 'Em Aberto'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
