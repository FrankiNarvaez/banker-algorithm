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
  const [step, setStep] = useState(0);
  const [simulating, setSimulating] = useState(false);
  const [simulationAvailable, setSimulationAvailable] = useState<number[]>([]);
  const [completed, setCompleted] = useState<boolean[]>([]);
  type StepDetail = {
    process: number;
    need: number[];
    canExecute: boolean;
    availableBefore: number[];
    availableAfter: number[];
  };
  
  const [stepDetails, setStepDetails] = useState<StepDetail[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  


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

  const prepareDetailedSimulation = () => {
    if (!safeSequence) return;
  
    const steps: StepDetail[] = [];
    let availableCopy = [...available];
  
    safeSequence.forEach(proc => {
      const needProc = need[proc];
      const allocProc = allocation[proc];
      const canExecute = needProc.every((n, i) => n <= availableCopy[i]);
      const before = [...availableCopy];
      const after = [...availableCopy];
  
      if (canExecute) {
        for (let i = 0; i < resources; i++) {
          after[i] += allocProc[i];
        }
        availableCopy = [...after];
      }
  
      steps.push({
        process: proc,
        need: [...needProc],
        canExecute,
        availableBefore: before,
        availableAfter: canExecute ? after : before,
      });
    });
  
    setStepDetails(steps);
    setCurrentStepIndex(0);
  };  

  const startSimulation = () => {
    if (!safeSequence) return;
  
    setSimulating(true);
    setStep(0);
    setSimulationAvailable([...available]);
    setCompleted(Array(processes).fill(false));
    prepareDetailedSimulation();
  };  
  
  const nextStep = () => {
    if (currentStepIndex >= stepDetails.length) {
      setSimulating(false);
      return;
    }
  
    const detail = stepDetails[currentStepIndex];
  
    const newCompleted = [...completed];
    if (detail.canExecute) {
      newCompleted[detail.process] = true;
      setSimulationAvailable(detail.availableAfter);
    }
  
    setCompleted(newCompleted);
    setCurrentStepIndex(prev => prev + 1);
  
    if (currentStepIndex + 1 === stepDetails.length) {
      setSimulating(false);
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
      {safeSequence && !simulating && (
        <button onClick={startSimulation}>Simular paso a paso</button>
      )}

      {simulating && stepDetails.length > 0 && currentStepIndex < stepDetails.length && (
        <div className="step-info">
          <h3>Paso {currentStepIndex + 1} de {stepDetails.length}</h3>
          <p><strong>Proceso:</strong> P{stepDetails[currentStepIndex].process}</p>
          <p><strong>Necesidad:</strong> [{stepDetails[currentStepIndex].need.join(", ")}]</p>
          <p><strong>Disponibles antes:</strong> [{stepDetails[currentStepIndex].availableBefore.join(", ")}]</p>

          {stepDetails[currentStepIndex].canExecute ? (
            <>
              <p style={{ color: "green" }}><strong>✅ El proceso puede ejecutarse</strong></p>
              <p><strong>Disponibles después:</strong> [{stepDetails[currentStepIndex].availableAfter.join(", ")}]</p>
            </>
          ) : (
            <p style={{ color: "red" }}><strong>❌ El proceso NO puede ejecutarse con los recursos actuales</strong></p>
          )}

          <button onClick={nextStep} style={{ marginTop: "1rem" }}>Siguiente paso</button>
        </div>
      )}

      {!simulating && stepDetails.length > 0 && currentStepIndex === stepDetails.length && (
        <div>
          <h3>✅ Simulación completada</h3>
          <p>Todos los pasos fueron ejecutados.</p>
        </div>
      )}

      {message && <p className="message">{message}</p>}
      {safeSequence && (
        <p className="sequence">Secuencia segura: {safeSequence.map(p => `P${p}`).join(" → ")}</p>
      )}
    </div>
  );
};

export default App;
