const ClickableName = ({ name, onClick, hasArrived }) => {
  return (
    <div
      className="clickable-name"
      style={hasArrived ? { background: '#e0ffe0', color: '#000' } : undefined}
      onClick={onClick}
    >
      {name}
    </div>
  );
};

export default ClickableName;
