function renderMatrixInput(label: string, matrix: number[][], setter: Function) {
  const handleInputChange = (setter: Function, row: number, col: number, value: string) => {
    setter((prev: number[][]) => {
      const updated = [...prev];
      updated[row][col] = parseInt(value) || 0;
      return updated;
    });
  };
  
  return (
    <div className="matrix">
    <h3>{label}</h3>
    {matrix.map((row, i) => (
      <div key={i} className="row">
        {row.map((val, j) => (
          <input
            key={j}
            type="number"
            value={val}
            onChange={e => handleInputChange(setter, i, j, e.target.value)}
          />
        ))}
      </div>
    ))}
  </div>
  )
};

export default renderMatrixInput;