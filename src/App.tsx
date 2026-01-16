import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OSProvider } from "@/contexts/OSContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BuscaPlaca from "./pages/BuscaPlaca";
import OrdemServico from "./pages/OrdemServico";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OSProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/busca" element={<BuscaPlaca />} />
            <Route path="/os/:id" element={<OrdemServico />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OSProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
