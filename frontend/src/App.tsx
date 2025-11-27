import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SurveyListPage from "./pages/SurveyListPage";
import VotingPage from "./pages/VotingPage";
import ResultsPage from "./pages/ResultsPage";
import MyVotesPage from "./pages/MyVotesPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SurveyListPage />} />
        <Route path="/vote/:address" element={<VotingPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/results/:address" element={<ResultsPage />} />
        <Route path="/my-votes" element={<MyVotesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/:address" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
