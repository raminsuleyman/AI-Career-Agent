import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CareerProvider } from "@/context/CareerContext";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Interview from "./pages/Interview";
import InterviewResult from "./pages/InterviewResult";
import NotFound from "./pages/NotFound";
import Roadmap from "./pages/Roadmap";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/dashboard" component={Dashboard} /><Route path="/roadmap" component={Roadmap} /><Route path="/interview" component={Interview} /><Route path="/interview/result" component={InterviewResult} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><CareerProvider><TooltipProvider><Toaster theme="dark" richColors closeButton /><Router /></TooltipProvider></CareerProvider></ErrorBoundary>;
}
