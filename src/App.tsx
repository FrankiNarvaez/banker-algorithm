import { useState } from "react";
import renderMatrixInput from "./components/MatrixInput";
import { isSafeState } from "./utils/banker";
import "./index.css";

const App = () => {
  const [processes, setProcesses] = useState(3);
  const [resources, setResources] = useState(3);

  const createMatrix = (rows: number, cols: number) =>
    Array.from({ length: rows }, () => Array(cols).fill(0));

  const [allocation, setAllocation] = useState(createMatrix(processes, resources));
  const [need, setNeed] = useState(createMatrix(processes, resources));
  const [available, setAvailable] = useState(Array(resources).fill(0));
  const [safeSequence, setSafeSequence] = useState<number[] | null>(null);
  const [message, setMessage] = useState("");

  const handleAvailableChange = (index: number, value: string) => {
    const newAvailable = [...available];
    newAvailable[index] = parseInt(value) || 0;
    setAvailable(newAvailable);
  };

  const checkSafeSequence = () => {
    const result = isSafeState(allocation, need, available);
    if (result.safe) {
      setSafeSequence(result.sequence);
      setMessage("Sistema en estado seguro.");
    } else {
      setSafeSequence(null);
      setMessage("¡Estado inseguro! Posible bloqueo detectado.");
    }
  };  

  return (
    <div className="app">
      <h1>Algoritmo del Banquero</h1>

      <div className="controls">
        <label>
          Procesos:
          <input
            type="number"
            value={processes}
            min={1}
            onChange={e => {
              const val = parseInt(e.target.value) || 1;
              setProcesses(val);
              setAllocation(createMatrix(val, resources));
              setNeed(createMatrix(val, resources));
            }}
          />
        </label>
        <label>
          Recursos:
          <input
            type="number"
            value={resources}
            min={1}
            onChange={e => {
              const val = parseInt(e.target.value) || 1;
              setResources(val);
              setAllocation(createMatrix(processes, val));
              setNeed(createMatrix(processes, val));
              setAvailable(Array(val).fill(0));
            }}
          />
        </label>
      </div>

      {renderMatrixInput("Asignación", allocation, setAllocation)}
      {renderMatrixInput("Necesidad", need, setNeed)}

      <div className="matrix">
        <h3>Disponibles</h3>
        <div className="row">
          {available.map((val, i) => (
            <input
              key={i}
              type="number"
              value={val}
              onChange={e => handleAvailableChange(i, e.target.value)}
            />
          ))}
        </div>
      </div>

      <button onClick={checkSafeSequence}>Verificar Secuencia Segura</button>

      {message && <p className="message">{message}</p>}
      {safeSequence && (
        <p className="sequence">Secuencia segura: {safeSequence.map(p => `P${p}`).join(" → ")}</p>
      )}
    </div>
  );
};

export default App;
