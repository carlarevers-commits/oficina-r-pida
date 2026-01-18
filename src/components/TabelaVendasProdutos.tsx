import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOficina } from '@/contexts/OficinaContext';
import { Package } from 'lucide-react';

export function TabelaVendasProdutos() {
  const { vendasProdutos } = useOficina();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalGeral = vendasProdutos.reduce((acc, v) => acc + v.total, 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-info" />
          Vendas por Produto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vendasProdutos.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma venda de produto registrada
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Produto</TableHead>
                <TableHead className="text-muted-foreground text-center">Qtd</TableHead>
                <TableHead className="text-muted-foreground text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendasProdutos.map((venda, index) => (
                <TableRow key={index} className="border-border">
                  <TableCell className="text-foreground">{venda.nome}</TableCell>
                  <TableCell className="text-foreground text-center">{venda.quantidade}</TableCell>
                  <TableCell className="text-foreground text-right font-medium">
                    {formatCurrency(venda.total)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-border bg-accent/50">
                <TableCell className="text-foreground font-bold">Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-success text-right font-bold">
                  {formatCurrency(totalGeral)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
