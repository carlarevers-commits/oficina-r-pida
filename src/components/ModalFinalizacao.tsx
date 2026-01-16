import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle, X } from 'lucide-react';
import { OrdemServico } from '@/types/os';
import { toast } from '@/hooks/use-toast';

interface ModalFinalizacaoProps {
  open: boolean;
  onClose: () => void;
  ordem: OrdemServico | null;
}

export function ModalFinalizacao({ open, onClose, ordem }: ModalFinalizacaoProps) {
  if (!ordem) return null;

  const enviarAviso = () => {
    toast({
      title: 'Aviso enviado!',
      description: `Mensagem enviada para ${ordem.whatsapp}`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <DialogTitle className="text-xl text-foreground">
            Ordem Finalizada!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Moto do cliente pronta para retirada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-accent rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium text-foreground">{ordem.nomeCliente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Placa:</span>
              <span className="font-medium text-foreground">{ordem.placa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">WhatsApp:</span>
              <span className="font-medium text-foreground">{ordem.whatsapp}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold text-primary text-lg">
                R$ {ordem.valorTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          <Button
            onClick={enviarAviso}
            className="flex-1 bg-success text-success-foreground hover:bg-success/90"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Enviar Aviso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
