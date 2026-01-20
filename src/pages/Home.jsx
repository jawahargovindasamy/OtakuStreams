import { useTheme } from '@/context/theme-provider';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

const Home = () => {
   const [count, setCount] = useState(0);

  const { theme, setTheme } = useTheme();
  return (
    <div>
      <h1 className="text-3xl font-bold text-center">Welcome to OtakuStream</h1>
      <p className="text-center mt-4 mb-8">Clicked {count} times</p>
      <Button
        className="mx-auto block cursor-pointer"
        onClick={() => setCount(count + 1)}
      >
        Button
      </Button>
      <Button
        variant="outline"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        Switch to {theme === "dark" ? "Light" : "Dark"} Mode
      </Button>
    </div>
  );
};

export default Home;