import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import MockInterview from './pages/MockInterview';
import MockResults from './pages/MockResults';
import Questions from './pages/Questions';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Upcoming from './components/ui/Upcoming';

function PrivateRoute({ children }: { children: any }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/onboarding" element={
            <PrivateRoute><Onboarding /></PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/mock" element={
            <PrivateRoute><MockInterview /></PrivateRoute>
          } />
          <Route path="/mock/results/:sessionId" element={
            <PrivateRoute><MockResults /></PrivateRoute>
          } />
          <Route path="/questions" element={
            <PrivateRoute><Questions /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><Profile /></PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute><Settings /></PrivateRoute>
          } />
          <Route path="/intel" element={
            <PrivateRoute>
              <Upcoming 
                title="Company Intel" 
                description="Get inside information on how Big Tech companies interview for PM roles." 
                featureDescription="Our upcoming AI-powered extractor will analyze thousands of real interview reports to synthesize company-specific questions, ideal answer styles, and cultural nuances."
              />
            </PrivateRoute>
          } />
          <Route path="/peer" element={
            <PrivateRoute>
              <Upcoming 
                title="Peer Mocks" 
                description="Practice live with other PM candidates in a structured environment." 
                featureDescription="Soon you'll be able to schedule 45-minute sessions with peers at your level. Take turns being the interviewer and interviewee, and get real-time feedback from the community."
              />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
