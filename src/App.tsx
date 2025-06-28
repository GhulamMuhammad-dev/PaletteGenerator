import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { LandingPage } from './components/LandingPage';
import { PaletteGenerator } from './components/PaletteGenerator';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <SignedOut>
                <LandingPage />
              </SignedOut>
              <SignedIn>
                <PaletteGenerator />
              </SignedIn>
            </>
          } 
        />
        <Route 
          path="/app" 
          element={
            <SignedIn>
              <PaletteGenerator />
            </SignedIn>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;