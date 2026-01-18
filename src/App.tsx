import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OficinaProvider } from "@/contexts/OficinaContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BuscaPlaca from "./pages/BuscaPlaca";
import PDV from "./pages/PDV";
import Estoque from "./pages/Estoque";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OficinaProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/busca" element={<BuscaPlaca />} />
            <Route path="/pdv/:id" element={<PDV />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OficinaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
