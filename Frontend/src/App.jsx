import { Toaster } from "react-hot-toast";
import Routing from "./Routing";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0F172A",
            color: "#FFFFFF",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            border: "1px solid #334155",
          },
          success: {
            iconTheme: {
              primary: "#14B8A6",
              secondary: "#FFFFFF",
            },
          },
        }}
      />
      <Routing />
    </>
  );
}

export default App;